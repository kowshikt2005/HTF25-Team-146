const express = require('express');
const { googleAuthService } = require('../../lib/googleAuth');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const router = express.Router();

// Helper functions for token management
async function storeUserTokens(userId, tokens) {
  try {
    const UserTokens = mongoose.models.UserTokens;
    if (!UserTokens) {
      throw new Error('UserTokens model not found');
    }
    
    await UserTokens.findOneAndUpdate(
      { userId },
      { 
        googleTokens: tokens,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error storing user tokens:', error);
    throw error;
  }
}

// Google OAuth login initiation
router.get('/google', (req, res) => {
  try {
    const authUrl = googleAuthService.generateAuthUrl('login');
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google OAuth callback
router.post('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Get tokens from Google
    const tokens = await googleAuthService.getTokens(code);
    
    // Get user info from Google
    const googleUser = await googleAuthService.getUserInfo(tokens);
    
    if (!googleUser.email) {
      return res.status(400).json({ error: 'Unable to get user email from Google' });
    }

    // Check if user exists in our database
    const User = mongoose.models.User;
    let user = await User.findOne({ email: googleUser.email });
    
    if (!user) {
      // Create new user
      user = new User({
        name: googleUser.name || googleUser.email,
        email: googleUser.email,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        role: 'employee', // Default role, can be changed later
        googleId: googleUser.id,
        avatar: googleUser.picture
      });
      await user.save();
    } else {
      // Update existing user with Google info
      user.googleId = googleUser.id;
      user.avatar = googleUser.picture;
      await user.save();
    }

    // Store Google tokens (including calendar permissions)
    await storeUserTokens(user._id, tokens);

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        hasCalendarAccess: googleAuthService.hasCalendarPermissions(tokens)
      },
      process.env.JWT_SECRET || 'hackathon-jwt-secret-key-2024'
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        hasCalendarAccess: googleAuthService.hasCalendarPermissions(tokens)
      }
    });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;