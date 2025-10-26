const express = require('express');
const { googleCalendarService } = require('../../lib/googleCalendar');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
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

async function getUserTokens(userId) {
  try {
    const UserTokens = mongoose.models.UserTokens;
    if (!UserTokens) {
      throw new Error('UserTokens model not found');
    }
    
    const userTokens = await UserTokens.findOne({ userId });
    return userTokens?.googleTokens || null;
  } catch (error) {
    console.error('Error getting user tokens:', error);
    throw error;
  }
}

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

// Check if user has Google Calendar connected
router.get('/google/status', authenticateToken, async (req, res) => {
  try {
    const tokens = await getUserTokens(req.user.userId);
    res.json({ connected: !!tokens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google Calendar OAuth routes
router.get('/google/auth', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const authUrl = googleCalendarService.generateAuthUrl(userId);
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/google/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.body;
    
    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing authorization code or user ID' });
    }

    const tokens = await googleCalendarService.getTokens(code);
    
    // Store tokens in database
    await storeUserTokens(userId, tokens);
    
    res.json({ success: true, message: 'Google Calendar connected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync meeting to Google Calendar
router.post('/google/sync/:meetingId', authenticateToken, async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Get meeting from database
    const Meeting = mongoose.models.Meeting || mongoose.model('Meeting');
    const meeting = await Meeting.findById(meetingId).populate('attendees', 'email');
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Get user's Google Calendar tokens
    const tokens = await getUserTokens(req.user.userId);
    if (!tokens) {
      return res.status(400).json({ error: 'Google Calendar not connected. Please connect first.' });
    }
    
    googleCalendarService.setUserTokens(tokens);

    // Sync to Google Calendar
    const googleEvent = await googleCalendarService.syncMeetingToGoogle(meeting);
    
    // Update meeting with Google event ID
    meeting.googleEventId = googleEvent.id;
    await meeting.save();
    
    res.json({ success: true, googleEventId: googleEvent.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import events from Google Calendar
router.get('/google/import', authenticateToken, async (req, res) => {
  try {
    const { timeMin, timeMax } = req.query;
    
    // Get user's Google Calendar tokens
    const tokens = await getUserTokens(req.user.userId);
    if (!tokens) {
      return res.status(400).json({ error: 'Google Calendar not connected. Please connect first.' });
    }
    
    googleCalendarService.setUserTokens(tokens);

    // Get events from Google Calendar
    const googleEvents = await googleCalendarService.getEvents(timeMin, timeMax);
    
    // Convert to meeting format
    const meetings = googleEvents.map(event => 
      googleCalendarService.convertGoogleEventToMeeting(event)
    );
    
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
