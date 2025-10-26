const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createServer } = require('http');
const { Server } = require('socket.io');
const calendarRoutes = require('./routes/calendar');
const googleAuthRoutes = require('./routes/googleAuth');
const githubOAuthRoutes = require('./routes/githubOAuth');
const githubViewerRoutes = require('./routes/githubViewer');
// const githubApiRoutes = require('./routes/githubApi'); // Disabled - missing githubApp module
// const githubWebhookRoutes = require('./routes/githubWebhooks'); // Disabled - missing githubApp module
// const { reminderScheduler } = require('../lib/reminderScheduler'); // Disabled for now
require('dotenv').config({ path: '.env.local' });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/calendar', calendarRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/github', githubOAuthRoutes);
app.use('/api/github-viewer', githubViewerRoutes);
// app.use('/api/github-app', githubApiRoutes); // Disabled - missing githubApp module
// app.use('/api/webhooks', githubWebhookRoutes); // Disabled - missing githubApp module

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-workspace')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['mentor', 'employee'], required: true },
  phone: String,
  googleId: String, // Google user ID
  avatar: String, // Google profile picture
  createdAt: { type: Date, default: Date.now }
});

// Project Schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  gitRepo: String, // Format: "owner/repo"
  githubUrl: String, // Full GitHub URL
  createdAt: { type: Date, default: Date.now }
});

// Enhanced Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' }, // Rich text support later
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  
  // Multiple assignees support
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Enhanced status and priority
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'review', 'done'], 
    default: 'todo' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  
  // Time tracking
  dueDate: Date,
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  
  // Labels and categorization
  tags: [{ type: String }],
  labels: [{
    name: String,
    color: String
  }],
  
  // Subtasks and dependencies
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  dependencies: {
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    blocking: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
  },
  
  // Additional metadata
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Real-time Activity Schema for tracking user actions
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  action: { 
    type: String, 
    enum: ['task_created', 'task_updated', 'task_deleted', 'user_joined', 'user_left', 'comment_added'],
    required: true 
  },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // Task ID, Comment ID, etc.
  metadata: {
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    field: String, // Which field was changed
    description: String
  },
  timestamp: { type: Date, default: Date.now },
  sessionId: String // Socket session ID for tracking
});

// User Session Schema for tracking active users
const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  socketId: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  userAgent: String,
  ipAddress: String
});

// Meeting Schema
const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agenda: [{ type: String }],
  location: String,
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: { type: Number, default: 1 },
    endDate: Date
  },
  actionItems: [{
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: Date,
    completed: { type: Boolean, default: false }
  }],
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Tokens Schema for Google Calendar integration
const userTokensSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  googleTokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);
const Activity = mongoose.model('Activity', activitySchema);
const UserSession = mongoose.model('UserSession', userSessionSchema);
const Meeting = mongoose.model('Meeting', meetingSchema);
const UserTokens = mongoose.model('UserTokens', userTokensSchema);

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

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project Routes
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can create projects' });
    }

    const { title, description, gitRepo, collaborators } = req.body;
    
    const project = new Project({
      title,
      description,
      gitRepo,
      owner: req.user.userId,
      collaborators: collaborators || []
    });

    await project.save();
    await project.populate('owner collaborators', 'name email');
    
    io.emit('project_created', project);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'mentor') {
      projects = await Project.find({ owner: req.user.userId })
        .populate('owner collaborators', 'name email');
    } else {
      projects = await Project.find({ 
        $or: [
          { collaborators: req.user.userId },
          { owner: req.user.userId }
        ]
      }).populate('owner collaborators', 'name email');
    }
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner collaborators', 'name email');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess = project.owner._id.toString() === req.user.userId ||
                     project.collaborators.some(collab => collab._id.toString() === req.user.userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner (only owners can update projects)
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only project owners can update projects' });
    }

    const { title, description, gitRepo, githubUrl, collaborators } = req.body;
    
    // Update project fields
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (gitRepo !== undefined) project.gitRepo = gitRepo;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (collaborators !== undefined) project.collaborators = collaborators;
    
    await project.save();
    await project.populate('owner collaborators', 'name email');
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users for task assignment
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can view users' });
    }
    
    const users = await User.find({ role: 'employee' }, 'name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for real user management)
app.get('/api/users/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can view all users' });
    }
    
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: req.user.userId } }, 'name email role createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Meeting routes
const meetingRoutes = require('./routes/meetings');
app.use('/api/meetings', meetingRoutes);

// Task Routes
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    
    const task = new Task({
      title,
      description,
      project,
      assignees: assignedTo ? [assignedTo] : [], // Convert single assignedTo to assignees array
      priority,
      dueDate,
      createdBy: req.user.userId
    });

    await task.save();
    await task.populate('assignees createdBy project', 'name email title');
    
    io.emit('task_created', task);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:projectId', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignees createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      description, 
      title, 
      priority, 
      assignedTo, 
      dueDate, 
      estimatedHours, 
      actualHours 
    } = req.body;
    
    // Get the original task for activity logging
    const originalTask = await Task.findById(req.params.taskId).populate('assignees');
    
    // Prepare update object
    const updateData = {
      updatedAt: new Date()
    };
    
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (title !== undefined) updateData.title = title;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    
    // Handle assignee changes
    if (assignedTo !== undefined) {
      updateData.assignees = assignedTo ? [assignedTo] : [];
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      updateData,
      { new: true }
    ).populate('assignees createdBy project', 'name email title');

    // Log activities for different types of changes
    const activities = [];
    
    if (originalTask.status !== status && status) {
      activities.push({
        userId: req.user.userId,
        projectId: task.project._id,
        action: 'task_updated',
        targetId: task._id,
        metadata: {
          description: `Task status changed from ${originalTask.status} to ${status}`,
          field: 'status',
          oldValue: originalTask.status,
          newValue: status
        }
      });
    }
    
    // Check for reassignment
    const oldAssigneeId = originalTask.assignees?.[0]?._id?.toString();
    const newAssigneeId = task.assignees?.[0]?._id?.toString();
    const wasReassigned = oldAssigneeId !== newAssigneeId;
    
    if (wasReassigned) {
      activities.push({
        userId: req.user.userId,
        projectId: task.project._id,
        action: 'task_updated',
        targetId: task._id,
        metadata: {
          description: `Task reassigned from ${originalTask.assignees?.[0]?.name || 'unassigned'} to ${task.assignees?.[0]?.name || 'unassigned'}`,
          field: 'assignee',
          oldValue: oldAssigneeId,
          newValue: newAssigneeId
        }
      });
    }
    
    // Save all activities
    for (const activityData of activities) {
      const activity = new Activity(activityData);
      await activity.save();
    }

    // Emit real-time update with reassignment info
    const taskUpdate = {
      ...task.toObject(),
      wasReassigned,
      previousAssignee: originalTask.assignees?.[0] || null
    };
    
    io.to(task.project._id.toString()).emit('task_updated', taskUpdate);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project activity logs
app.get('/api/projects/:projectId/activity', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const activities = await Activity.find({ projectId: req.params.projectId })
      .populate('userId', 'name email')
      .populate('targetId')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Activity.countDocuments({ projectId: req.params.projectId });
    
    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active users for a project
app.get('/api/projects/:projectId/active-users', authenticateToken, async (req, res) => {
  try {
    const activeSessions = await UserSession.find({
      projectId: req.params.projectId,
      isActive: true,
      lastActivity: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Active in last 5 minutes
    }).populate('userId', 'name email role');
    
    res.json(activeSessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assigned tasks for a user
app.get('/api/users/:userId/assigned-tasks', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Ensure user can only see their own tasks or mentor can see all
    if (req.user.userId !== userId && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const tasks = await Task.find({
      assignees: userId,
      status: { $ne: 'done' } // Exclude completed tasks
    })
    .populate('project', 'title')
    .populate('createdBy', 'name email')
    .populate('assignees', 'name email')
    .sort({ createdAt: -1 });
    
    // Add isNew flag for recently assigned tasks (within last 24 hours)
    const tasksWithFlags = tasks.map(task => ({
      ...task.toObject(),
      isNew: new Date() - new Date(task.updatedAt) < 24 * 60 * 60 * 1000,
      assignedTo: task.assignees?.[0] // Backward compatibility
    }));
    
    res.json(tasksWithFlags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Meeting Routes
app.post('/api/meetings', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      start, 
      end, 
      attendees, 
      location, 
      isRecurring, 
      recurringPattern, 
      agenda 
    } = req.body;
    
    const meeting = new Meeting({
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      attendees: attendees || [],
      organizer: req.user.userId,
      location,
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      agenda: agenda || []
    });

    await meeting.save();
    await meeting.populate('attendees organizer', 'name email');
    
    // Schedule reminders for the new meeting
    // reminderScheduler.scheduleMeetingReminders(meeting); // Disabled for now
    
    io.emit('meeting_created', meeting);
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/meetings', authenticateToken, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user.userId },
        { attendees: req.user.userId }
      ]
    })
    .populate('attendees organizer', 'name email')
    .sort({ start: 1 });
    
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/meetings/:meetingId', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      start, 
      end, 
      attendees, 
      location, 
      agenda, 
      notes, 
      actionItems 
    } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (start !== undefined) updateData.start = new Date(start);
    if (end !== undefined) updateData.end = new Date(end);
    if (attendees !== undefined) updateData.attendees = attendees;
    if (location !== undefined) updateData.location = location;
    if (agenda !== undefined) updateData.agenda = agenda;
    if (notes !== undefined) updateData.notes = notes;
    if (actionItems !== undefined) updateData.actionItems = actionItems;
    
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.meetingId,
      updateData,
      { new: true }
    ).populate('attendees organizer', 'name email');

    // Update reminders if meeting time changed
    if (start !== undefined || end !== undefined) {
      // reminderScheduler.updateMeetingReminders(meeting); // Disabled for now
    }

    io.emit('meeting_updated', meeting);
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/meetings/:meetingId', authenticateToken, async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.meetingId);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Cancel all reminders for this meeting
    // reminderScheduler.cancelAllMeetingReminders(req.params.meetingId); // Disabled for now
    
    io.emit('meeting_deleted', { id: req.params.meetingId });
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time activity tracking
const activeUsers = new Map(); // projectId -> Set of socket IDs
const userSessions = new Map(); // socket.id -> { userId, projectId, joinedAt }

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User joins a project room
  socket.on('join_project', async (data) => {
    const { projectId, userId, userName } = data;
    
    try {
      // Leave previous project if any
      if (userSessions.has(socket.id)) {
        const prevSession = userSessions.get(socket.id);
        socket.leave(prevSession.projectId);
        
        // Mark previous session as inactive in database
        await UserSession.updateMany(
          { socketId: socket.id },
          { isActive: false, lastActivity: new Date() }
        );
        
        // Remove from active users
        if (activeUsers.has(prevSession.projectId)) {
          activeUsers.get(prevSession.projectId).delete(socket.id);
        }
      }
      
      // Join new project
      socket.join(projectId);
      
      // Create database session record
      const sessionRecord = new UserSession({
        userId,
        projectId,
        socketId: socket.id,
        userAgent: socket.handshake.headers['user-agent'],
        ipAddress: socket.handshake.address
      });
      await sessionRecord.save();
      
      // Track user session in memory
      userSessions.set(socket.id, {
        userId,
        userName,
        projectId,
        joinedAt: new Date()
      });
      
      // Add to active users
      if (!activeUsers.has(projectId)) {
        activeUsers.set(projectId, new Set());
      }
      activeUsers.get(projectId).add(socket.id);
      
      // Log activity
      const activity = new Activity({
        userId,
        projectId,
        action: 'user_joined',
        metadata: {
          description: `${userName} joined the project`
        },
        sessionId: socket.id
      });
      await activity.save();
      
      // Notify others in the project
      socket.to(projectId).emit('user_joined', {
        userId,
        userName,
        joinedAt: new Date()
      });
      
      // Send current active users to the new user
      const projectActiveUsers = Array.from(activeUsers.get(projectId) || [])
        .map(socketId => userSessions.get(socketId))
        .filter(session => session && session.userId !== userId);
      
      socket.emit('active_users', projectActiveUsers);
      
      console.log(`User ${userName} (${userId}) joined project ${projectId}`);
    } catch (error) {
      console.error('Error handling user join:', error);
    }
  });

  // Real-time task updates
  socket.on('task_updated', async (taskData) => {
    const session = userSessions.get(socket.id);
    if (session) {
      try {
        // Log activity to database
        const activity = new Activity({
          userId: session.userId,
          projectId: session.projectId,
          action: 'task_updated',
          targetId: taskData._id,
          metadata: {
            description: `${session.userName} updated task: ${taskData.title}`,
            field: 'status', // Could be dynamic based on what changed
            newValue: taskData.status
          },
          sessionId: socket.id
        });
        await activity.save();
        
        // Update session activity
        await UserSession.updateOne(
          { socketId: socket.id },
          { lastActivity: new Date() }
        );
        
        // Broadcast to all users in the project except sender
        socket.to(session.projectId).emit('task_updated', {
          ...taskData,
          updatedBy: session.userName,
          updatedAt: new Date()
        });
        
        console.log(`Task ${taskData._id} updated by ${session.userName}`);
      } catch (error) {
        console.error('Error logging task update:', error);
      }
    }
  });

  // Real-time task creation
  socket.on('task_created', (taskData) => {
    const session = userSessions.get(socket.id);
    if (session) {
      socket.to(session.projectId).emit('task_created', {
        ...taskData,
        createdBy: session.userName,
        createdAt: new Date()
      });
      
      console.log(`Task ${taskData._id} created by ${session.userName}`);
    }
  });

  // User typing indicator
  socket.on('user_typing', (data) => {
    const session = userSessions.get(socket.id);
    if (session) {
      socket.to(session.projectId).emit('user_typing', {
        userId: session.userId,
        userName: session.userName,
        taskId: data.taskId,
        isTyping: data.isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    const session = userSessions.get(socket.id);
    if (session) {
      try {
        // Mark session as inactive in database
        await UserSession.updateOne(
          { socketId: socket.id },
          { isActive: false, lastActivity: new Date() }
        );
        
        // Log activity
        const activity = new Activity({
          userId: session.userId,
          projectId: session.projectId,
          action: 'user_left',
          metadata: {
            description: `${session.userName} left the project`
          },
          sessionId: socket.id
        });
        await activity.save();
        
        // Remove from active users
        if (activeUsers.has(session.projectId)) {
          activeUsers.get(session.projectId).delete(socket.id);
          
          // Clean up empty project rooms
          if (activeUsers.get(session.projectId).size === 0) {
            activeUsers.delete(session.projectId);
          }
        }
        
        // Notify others in the project
        socket.to(session.projectId).emit('user_left', {
          userId: session.userId,
          userName: session.userName,
          leftAt: new Date()
        });
        
        console.log(`User ${session.userName} (${session.userId}) disconnected from project ${session.projectId}`);
      } catch (error) {
        console.error('Error handling user disconnect:', error);
      }
    }
    
    // Clean up session
    userSessions.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});