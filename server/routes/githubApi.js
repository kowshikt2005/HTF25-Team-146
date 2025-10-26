const express = require('express');
const { githubAppService } = require('../../lib/githubApp');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const router = express.Router();

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create GitHub repository for project
router.post('/repositories', authenticateToken, async (req, res) => {
  try {
    const { projectId, repositoryName, description, isPrivate } = req.body;
    
    // Get project details
    const Project = mongoose.models.Project;
    const project = await Project.findById(projectId).populate('owner', 'name email');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only mentors can create repositories
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can create repositories' });
    }

    // Create repository on GitHub
    const repoData = await githubAppService.createRepository({
      name: repositoryName,
      description: description || project.description,
      private: isPrivate || false,
      owner: req.user.githubUsername || 'your-org' // This should come from user profile
    });

    // Update project with GitHub repository info
    project.gitRepo = `${repoData.owner.login}/${repoData.name}`;
    project.githubUrl = repoData.html_url;
    await project.save();

    res.json({
      success: true,
      repository: repoData,
      message: 'Repository created successfully'
    });
  } catch (error) {
    console.error('Error creating repository:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add collaborator to repository
router.post('/repositories/:owner/:repo/collaborators', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { username, permission = 'push' } = req.body;

    // Only mentors can add collaborators
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can add collaborators' });
    }

    const result = await githubAppService.addCollaborator(owner, repo, username, permission);

    res.json({
      success: true,
      message: `Collaborator ${username} added successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove collaborator from repository
router.delete('/repositories/:owner/:repo/collaborators/:username', authenticateToken, async (req, res) => {
  try {
    const { owner, repo, username } = req.params;

    // Only mentors can remove collaborators
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can remove collaborators' });
    }

    await githubAppService.removeCollaborator(owner, repo, username);

    res.json({
      success: true,
      message: `Collaborator ${username} removed successfully`
    });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get repository commits
router.get('/repositories/:owner/:repo/commits', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { since } = req.query;

    const commits = await githubAppService.getCommits(owner, repo, since);

    res.json({
      success: true,
      commits: commits
    });
  } catch (error) {
    console.error('Error getting commits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pull requests
router.get('/repositories/:owner/:repo/pulls', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open' } = req.query;

    const pullRequests = await githubAppService.getPullRequests(owner, repo, state);

    res.json({
      success: true,
      pullRequests: pullRequests
    });
  } catch (error) {
    console.error('Error getting pull requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create pull request
router.post('/repositories/:owner/:repo/pulls', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { title, head, base, body } = req.body;

    const pullRequest = await githubAppService.createPullRequest(owner, repo, {
      title,
      head,
      base,
      body
    });

    res.json({
      success: true,
      pullRequest: pullRequest
    });
  } catch (error) {
    console.error('Error creating pull request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Merge pull request
router.put('/repositories/:owner/:repo/pulls/:pullNumber/merge', authenticateToken, async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const { mergeMethod = 'merge' } = req.body;

    // Only mentors can merge pull requests
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can merge pull requests' });
    }

    const result = await githubAppService.mergePullRequest(owner, repo, parseInt(pullNumber), mergeMethod);

    res.json({
      success: true,
      message: 'Pull request merged successfully',
      data: result
    });
  } catch (error) {
    console.error('Error merging pull request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get repository information
router.get('/repositories/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    const repository = await githubAppService.getRepository(owner, repo);

    res.json({
      success: true,
      repository: repository
    });
  } catch (error) {
    console.error('Error getting repository:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get repository collaborators
router.get('/repositories/:owner/:repo/collaborators', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    const collaborators = await githubAppService.getCollaborators(owner, repo);

    res.json({
      success: true,
      collaborators: collaborators
    });
  } catch (error) {
    console.error('Error getting collaborators:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get repository branches
router.get('/repositories/:owner/:repo/branches', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    const branches = await githubAppService.getBranches(owner, repo);

    res.json({
      success: true,
      branches: branches
    });
  } catch (error) {
    console.error('Error getting branches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create branch
router.post('/repositories/:owner/:repo/branches', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { branchName, fromBranch = 'main' } = req.body;

    const branch = await githubAppService.createBranch(owner, repo, branchName, fromBranch);

    res.json({
      success: true,
      branch: branch
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get file content
router.get('/repositories/:owner/:repo/contents/*', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0]; // Get the rest of the path
    const { branch = 'main' } = req.query;

    const content = await githubAppService.getFileContent(owner, repo, path, branch);

    res.json({
      success: true,
      content: content
    });
  } catch (error) {
    console.error('Error getting file content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update file
router.put('/repositories/:owner/:repo/contents/*', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0]; // Get the rest of the path
    const { content, message, branch = 'main' } = req.body;

    const result = await githubAppService.createOrUpdateFile(owner, repo, path, content, message, branch);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating/updating file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project GitHub activity
router.get('/projects/:projectId/activity', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project details
    const Project = mongoose.models.Project;
    const project = await Project.findById(projectId);
    
    if (!project || !project.gitRepo) {
      return res.status(404).json({ error: 'Project or GitHub repository not found' });
    }

    const [owner, repo] = project.gitRepo.split('/');

    // Get recent commits
    const commits = await githubAppService.getCommits(owner, repo);
    
    // Get recent pull requests
    const pullRequests = await githubAppService.getPullRequests(owner, repo);

    res.json({
      success: true,
      activity: {
        commits: commits.slice(0, 10), // Last 10 commits
        pullRequests: pullRequests.slice(0, 10) // Last 10 PRs
      }
    });
  } catch (error) {
    console.error('Error getting project activity:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
