const express = require('express');
const { githubOAuthService } = require('../../lib/githubOAuth');
const { githubService } = require('../../lib/githubService');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const router = express.Router();

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'hackathon-jwt-secret-key-2024', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get GitHub OAuth URL for user
router.get('/user/auth', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const authUrl = githubService.generateUserAuthUrl(userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating GitHub auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle GitHub OAuth callback
router.post('/user/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.body;
    
    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing authorization code or user ID' });
    }

    const result = await githubService.connectUserGitHub(userId, code);
    
    res.json({
      success: true,
      message: 'GitHub account connected successfully',
      profile: result.profile
    });
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has GitHub connected
router.get('/user/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const isConnected = await githubService.isUserGitHubConnected(userId);
    const tokens = isConnected ? await githubService.getUserGitHubTokens(userId) : null;
    
    res.json({
      connected: isConnected,
      githubUsername: tokens?.githubUsername || null,
      avatarUrl: tokens?.avatarUrl || null
    });
  } catch (error) {
    console.error('Error checking GitHub status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's repositories
router.get('/user/repositories', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const repositories = await githubService.getUserRepositories(userId);
    
    res.json({
      success: true,
      repositories: repositories
    });
  } catch (error) {
    console.error('Error getting user repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create repository in user's account
router.post('/user/repositories', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId, repositoryName, description, isPrivate } = req.body;
    
    const repoData = {
      name: repositoryName,
      description: description,
      private: isPrivate || false
    };
    
    // Create repository in user's personal account
    const repository = await githubService.createRepository(userId, repoData, true);
    
    // Update project with GitHub repository info
    const Project = mongoose.models.Project;
    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        gitRepo: repository.full_name,
        githubUrl: repository.html_url
      });
    }
    
    res.json({
      success: true,
      repository: repository,
      message: 'Repository created successfully in your personal GitHub account'
    });
  } catch (error) {
    console.error('Error creating user repository:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add collaborator to user's repository
router.post('/user/repositories/:owner/:repo/collaborators', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { owner, repo } = req.params;
    const { username, permission = 'push' } = req.body;
    
    const result = await githubService.addCollaborator(userId, owner, repo, username, permission, true);
    
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

// Get repository options for user
router.get('/user/repository-options', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const options = await githubService.getRepositoryOptions(userId);
    
    res.json({
      success: true,
      options: options
    });
  } catch (error) {
    console.error('Error getting repository options:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;