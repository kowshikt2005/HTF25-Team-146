# Real-time Data Tracking for MongoDB Atlas

## Overview
This document outlines what real-time data is being tracked and stored in MongoDB Atlas for the collaborative workspace system.

## Database Collections

### 1. Activities Collection
**Purpose**: Track all user actions and changes in real-time
**Schema**:
```javascript
{
  userId: ObjectId,           // User who performed the action
  projectId: ObjectId,        // Project where action occurred
  action: String,             // Type of action (task_created, task_updated, etc.)
  targetId: ObjectId,         // ID of the affected object (task, comment, etc.)
  metadata: {
    oldValue: Mixed,          // Previous value (for updates)
    newValue: Mixed,          // New value (for updates)
    field: String,            // Which field was changed
    description: String       // Human-readable description
  },
  timestamp: Date,            // When the action occurred
  sessionId: String           // Socket session ID
}
```

**Tracked Actions**:
- `task_created` - When a new task is created
- `task_updated` - When a task is modified (status, description, etc.)
- `task_deleted` - When a task is deleted
- `user_joined` - When a user joins a project
- `user_left` - When a user leaves a project
- `comment_added` - When a comment is added to a task

### 2. UserSessions Collection
**Purpose**: Track active user sessions and presence
**Schema**:
```javascript
{
  userId: ObjectId,           // User ID
  projectId: ObjectId,        // Current project
  socketId: String,           // Socket.IO session ID
  joinedAt: Date,             // When user joined
  lastActivity: Date,         // Last activity timestamp
  isActive: Boolean,          // Whether session is active
  userAgent: String,          // Browser/client info
  ipAddress: String           // User's IP address
}
```

### 3. Enhanced Task Schema
**Purpose**: Store comprehensive task information with real-time updates
**New Fields Added**:
```javascript
{
  // ... existing fields ...
  
  // Enhanced status tracking
  status: ['todo', 'in-progress', 'review', 'done'],
  
  // Multiple assignees support
  assignees: [ObjectId],      // Array of user IDs
  
  // Time tracking
  estimatedHours: Number,
  actualHours: Number,
  
  // Labels and categorization
  tags: [String],
  labels: [{
    name: String,
    color: String
  }],
  
  // Task relationships
  subtasks: [ObjectId],
  parentTask: ObjectId,
  dependencies: {
    blockedBy: [ObjectId],
    blocking: [ObjectId]
  },
  
  // File attachments
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedBy: ObjectId,
    uploadedAt: Date
  }],
  
  // Timestamps
  updatedAt: Date             // Last update timestamp
}
```

## Real-time Events Tracked

### Socket.IO Events
1. **Connection Events**
   - User connects/disconnects
   - User joins/leaves project rooms
   - Connection errors and reconnections

2. **Task Events**
   - Task creation with immediate broadcast
   - Task status changes (drag & drop)
   - Task updates (description, assignee, etc.)
   - Task deletion

3. **User Presence**
   - Active users per project
   - User typing indicators
   - Last seen timestamps

4. **Collaboration Events**
   - Multiple users editing same task
   - Concurrent updates handling
   - Conflict resolution

## Data Storage Strategy

### MongoDB Atlas Collections
1. **users** - User accounts and profiles
2. **projects** - Project information and collaborators
3. **tasks** - Work items with enhanced metadata
4. **activities** - Real-time activity log
5. **usersessions** - Active user sessions

### Real-time Data Flow
1. **Client Action** → Socket.IO event
2. **Server Processing** → Database update
3. **Activity Logging** → Activities collection
4. **Broadcast** → All connected clients
5. **UI Update** → Optimistic updates with rollback

## Performance Considerations

### Indexing Strategy
```javascript
// Activities collection indexes
db.activities.createIndex({ projectId: 1, timestamp: -1 })
db.activities.createIndex({ userId: 1, timestamp: -1 })
db.activities.createIndex({ targetId: 1 })

// UserSessions collection indexes
db.usersessions.createIndex({ projectId: 1, isActive: 1 })
db.usersessions.createIndex({ userId: 1, lastActivity: -1 })
db.usersessions.createIndex({ socketId: 1 })

// Tasks collection indexes
db.tasks.createIndex({ project: 1, status: 1 })
db.tasks.createIndex({ assignees: 1 })
db.tasks.createIndex({ createdAt: -1 })
```

### Data Retention
- **Activities**: Keep for 90 days, then archive
- **UserSessions**: Clean up inactive sessions older than 24 hours
- **Tasks**: Permanent storage with soft delete

## Real-time Features Enabled

### 1. Live Collaboration
- See who's currently working on the project
- Real-time task updates across all connected users
- Immediate feedback on changes

### 2. Activity Tracking
- Complete audit trail of all changes
- User action history
- Project timeline view

### 3. Presence Indicators
- Active users display
- Last seen timestamps
- Typing indicators (future enhancement)

### 4. Conflict Resolution
- Optimistic updates with rollback
- Last-write-wins for simple conflicts
- User notification for concurrent edits

## API Endpoints for Real-time Data

### Activity Logs
- `GET /api/projects/:id/activity` - Get project activity history
- `GET /api/users/:id/activity` - Get user activity history

### Active Users
- `GET /api/projects/:id/active-users` - Get currently active users
- `GET /api/projects/:id/sessions` - Get all user sessions

### Real-time Stats
- `GET /api/projects/:id/stats` - Get real-time project statistics
- `GET /api/dashboard/activity` - Get dashboard activity feed

## Migration from Seed Data

### Before (Seed-based)
- Static demo users and tasks
- No real-time tracking
- Limited user management

### After (Real Users)
- Dynamic user registration
- Complete activity tracking
- Real-time collaboration
- Comprehensive session management

## Security Considerations

### Data Privacy
- User sessions include IP addresses (for security)
- Activity logs track all user actions
- Sensitive data is not stored in activities

### Access Control
- Users can only see activities for projects they have access to
- Session data is protected by authentication
- Real-time events are scoped to project rooms

## Monitoring and Analytics

### Real-time Metrics
- Active users per project
- Task completion rates
- User engagement levels
- System performance metrics

### Stored Analytics Data
- User activity patterns
- Project collaboration metrics
- Task lifecycle analytics
- Performance bottlenecks