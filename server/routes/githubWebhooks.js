const express = require('express');
const { githubAppService } = require('../../lib/githubApp');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const router = express.Router();

// GitHub webhook endpoint
router.post('/github', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const payload = req.body;

    // Verify webhook signature
    if (!githubAppService.verifyWebhook(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.headers['x-github-event'];
    const payloadData = JSON.parse(payload);

    console.log(`GitHub webhook received: ${event}`);

    switch (event) {
      case 'push':
        await handlePushEvent(payloadData);
        break;
      case 'pull_request':
        await handlePullRequestEvent(payloadData);
        break;
      case 'installation':
        await handleInstallationEvent(payloadData);
        break;
      default:
        console.log(`Unhandled event type: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle push events
async function handlePushEvent(payload: any) {
  try {
    const { repository, commits, pusher, ref } = payload;
    const repoOwner = repository.owner.login;
    const repoName = repository.name;

    // Find the project in our database
    const Project = mongoose.models.Project;
    const project = await Project.findOne({
      gitRepo: `${repoOwner}/${repoName}`
    }).populate('owner', 'name email');

    if (!project) {
      console.log(`Project not found for repository: ${repoOwner}/${repoName}`);
      return;
    }

    // Process each commit
    for (const commit of commits) {
      const commitData = {
        projectId: project._id,
        repository: `${repoOwner}/${repoName}`,
        commitId: commit.id,
        message: commit.message,
        author: commit.author.name,
        authorEmail: commit.author.email,
        pusher: pusher.name,
        pusherEmail: pusher.email,
        timestamp: commit.timestamp,
        url: commit.url,
        added: commit.added || [],
        modified: commit.modified || [],
        removed: commit.removed || [],
        branch: ref.replace('refs/heads/', ''),
        createdAt: new Date()
      };

      // Store commit in database
      const Commit = mongoose.models.Commit || mongoose.model('Commit', new mongoose.Schema({
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        repository: String,
        commitId: String,
        message: String,
        author: String,
        authorEmail: String,
        pusher: String,
        pusherEmail: String,
        timestamp: String,
        url: String,
        added: [String],
        modified: [String],
        removed: [String],
        branch: String,
        createdAt: { type: Date, default: Date.now }
      }));

      await new Commit(commitData).save();

      // Send notification to project owner (mentor)
      await sendCommitNotification(project.owner, commitData);
    }
  } catch (error) {
    console.error('Error handling push event:', error);
  }
}

// Handle pull request events
async function handlePullRequestEvent(payload: any) {
  try {
    const { action, pull_request, repository } = payload;
    const repoOwner = repository.owner.login;
    const repoName = repository.name;

    // Find the project in our database
    const Project = mongoose.models.Project;
    const project = await Project.findOne({
      gitRepo: `${repoOwner}/${repoName}`
    }).populate('owner', 'name email');

    if (!project) {
      console.log(`Project not found for repository: ${repoOwner}/${repoName}`);
      return;
    }

    const prData = {
      projectId: project._id,
      repository: `${repoOwner}/${repoName}`,
      prNumber: pull_request.number,
      title: pull_request.title,
      body: pull_request.body,
      state: pull_request.state,
      action: action,
      author: pull_request.user.login,
      authorEmail: pull_request.user.email,
      headBranch: pull_request.head.ref,
      baseBranch: pull_request.base.ref,
      url: pull_request.html_url,
      createdAt: new Date(pull_request.created_at),
      updatedAt: new Date(pull_request.updated_at)
    };

    // Store PR in database
    const PullRequest = mongoose.models.PullRequest || mongoose.model('PullRequest', new mongoose.Schema({
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
      repository: String,
      prNumber: Number,
      title: String,
      body: String,
      state: String,
      action: String,
      author: String,
      authorEmail: String,
      headBranch: String,
      baseBranch: String,
      url: String,
      createdAt: Date,
      updatedAt: Date
    }));

    await PullRequest.findOneAndUpdate(
      { projectId: project._id, prNumber: pull_request.number },
      prData,
      { upsert: true, new: true }
    );

    // Send notification to project owner (mentor)
    await sendPullRequestNotification(project.owner, prData);
  } catch (error) {
    console.error('Error handling pull request event:', error);
  }
}

// Handle installation events
async function handleInstallationEvent(payload: any) {
  try {
    const { action, installation } = payload;
    
    console.log(`GitHub App installation ${action}:`, installation.id);
    
    // Store installation info in database
    const Installation = mongoose.models.Installation || mongoose.model('Installation', new mongoose.Schema({
      installationId: { type: Number, required: true, unique: true },
      accountId: Number,
      accountLogin: String,
      accountType: String,
      action: String,
      createdAt: { type: Date, default: Date.now }
    }));

    await Installation.findOneAndUpdate(
      { installationId: installation.id },
      {
        installationId: installation.id,
        accountId: installation.account.id,
        accountLogin: installation.account.login,
        accountType: installation.account.type,
        action: action
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error handling installation event:', error);
  }
}

// Send commit notification to mentor
async function sendCommitNotification(mentor: any, commitData: any) {
  try {
    // Create notification in database
    const Notification = mongoose.models.Notification || mongoose.model('Notification', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      type: { type: String, required: true },
      title: String,
      message: String,
      data: mongoose.Schema.Types.Mixed,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }));

    await new Notification({
      userId: mentor._id,
      type: 'git_commit',
      title: 'New Git Commit',
      message: `${commitData.author} pushed to ${commitData.repository}: ${commitData.message}`,
      data: commitData,
      read: false
    }).save();

    // Emit real-time notification via Socket.IO
    // This would be handled by the main server
    console.log(`Notification sent to mentor ${mentor.name} for commit: ${commitData.message}`);
  } catch (error) {
    console.error('Error sending commit notification:', error);
  }
}

// Send pull request notification to mentor
async function sendPullRequestNotification(mentor: any, prData: any) {
  try {
    // Create notification in database
    const Notification = mongoose.models.Notification || mongoose.model('Notification', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      type: { type: String, required: true },
      title: String,
      message: String,
      data: mongoose.Schema.Types.Mixed,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }));

    await new Notification({
      userId: mentor._id,
      type: 'git_pull_request',
      title: `Pull Request ${prData.action}`,
      message: `${prData.author} ${prData.action} PR #${prData.prNumber}: ${prData.title}`,
      data: prData,
      read: false
    }).save();

    console.log(`Notification sent to mentor ${mentor.name} for PR: ${prData.title}`);
  } catch (error) {
    console.error('Error sending PR notification:', error);
  }
}

module.exports = router;
