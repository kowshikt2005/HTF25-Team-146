const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Use existing Meeting model from main server
const Meeting = mongoose.models.Meeting;

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get all meetings for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user.userId },
        { attendees: req.user.userId }
      ]
    })
    .populate('organizer', 'name email')
    .populate('attendees', 'name email')
    .populate('actionItems.assignedTo', 'name email')
    .sort({ start: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create meeting
router.post('/', authenticateToken, async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      organizer: req.user.userId,
      updatedAt: new Date()
    };

    const meeting = new Meeting(meetingData);
    await meeting.save();
    
    await meeting.populate('organizer', 'name email');
    await meeting.populate('attendees', 'name email');

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update meeting
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { organizer: req.user.userId },
          { attendees: req.user.userId }
        ]
      },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    .populate('organizer', 'name email')
    .populate('attendees', 'name email');

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete meeting
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      organizer: req.user.userId // Only organizer can delete
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or unauthorized' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;