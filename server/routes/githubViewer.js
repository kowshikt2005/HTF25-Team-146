const express = require('express');
const { githubViewer } = require('../../lib/githubViewer');
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

  jwt.verify(token, process.env.JWT_SECRET || 'hackathon-jwt-secret-key-2024', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get comprehensive repository information from GitHub URL
router.post('/repository-info', authenticateToken, async (req, res) => {
  try {
    const { gitUrl } = req.body;
    
    if (!gitUrl) {
      return res.status(400).json({ error: 'GitHub URL is required' });
    }

    const repositoryInfo = await githubViewer.getRepositoryInfo(gitUrl);
    
    res.json({
      success: true,
      data: repositoryInfo
    });
  } catch (error) {
    console.error('Error fetching repository info:', error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

// Get commit activity for the last 30 days
router.post('/commit-activity', authenticateToken, async (req, res) => {
  try {
    const { gitUrl } = req.body;
    
    if (!gitUrl) {
      return res.status(400).json({ error: 'GitHub URL is required' });
    }

    const activity = await githubViewer.getCommitActivity(gitUrl);
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching commit activity:', error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

// Validate GitHub URL
router.post('/validate-url', authenticateToken, async (req, res) => {
  try {
    const { gitUrl } = req.body;
    
    if (!gitUrl) {
      return res.status(400).json({ error: 'GitHub URL is required' });
    }

    const parsed = githubViewer.parseGitHubUrl(gitUrl);
    
    res.json({
      success: true,
      valid: true,
      owner: parsed.owner,
      repo: parsed.repo
    });
  } catch (error) {
    res.json({
      success: true,
      valid: false,
      error: error.message
    });
  }
});

module.exports = router;