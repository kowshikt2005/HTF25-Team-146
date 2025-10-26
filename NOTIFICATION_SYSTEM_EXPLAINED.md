# 🔔 Notification System Implementation Guide

## Overview
The notification system uses a combination of **Socket.IO for real-time communication**, **Zustand for state management**, and **React components for UI display**. Here's how it all works together:

## 🏗️ Architecture Flow

```
[User Action] → [Server Processing] → [Socket.IO Broadcast] → [Client Reception] → [State Update] → [UI Display]
```

## 📡 1. Real-time Communication Layer (Socket.IO)

### Server Side (`server/index.js`)
```javascript
// When a task is updated
app.put('/api/tasks/:taskId', authenticateToken, async (req, res) => {
  // ... update task in database ...
  
  // Check if task was reassigned
  const wasReassigned = oldAssigneeId !== newAssigneeId;
  
  // Emit real-time update with reassignment info
  const taskUpdate = {
    ...task.toObject(),
    wasReassigned,
    previousAssignee: originalTask.assignees?.[0] || null
  };
  
  // Broadcast to all users in the project room
  io.to(task.project._id.toString()).emit('task_updated', taskUpdate);
});
```

### Client Side (`hooks/useSocket.ts`)
```javascript
// Listen for task updates
socket.on('task_updated', (task) => {
  updateTask(task._id, task);
  
  // Handle task reassignment notifications
  if (task.wasReassigned) {
    // Notify the newly assigned user
    if (task.assignedTo?._id === user.id) {
      addNotification({
        type: 'info',
        message: `Task "${task.title}" has been assigned to you by ${task.updatedBy}`
      });
    }
    
    // Notify the previously assigned user
    if (task.previousAssignee?._id === user.id && task.assignedTo?._id !== user.id) {
      addNotification({
        type: 'info',
        message: `Task "${task.title}" has been reassigned to ${task.assignedTo?.name || 'someone else'}`
      });
    }
  }
});
```

## 🗄️ 2. State Management Layer (Zustand)

### Notification Store (`lib/store.ts`)
```javascript
interface AppState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>;
  
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

// Add notification action
addNotification: (notification) => set((state) => ({
  notifications: [...state.notifications, {
    ...notification,
    id: Date.now().toString(),
    timestamp: Date.now()
  }]
}), false, 'addNotification'),
```

## 🎨 3. UI Display Layer (React Components)

### Notification Center (`components/notifications/SimpleNotificationCenter.tsx`)
```javascript
export const SimpleNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { notifications: storeNotifications } = useAppStore();

  useEffect(() => {
    // Convert store notifications to local format
    const formattedNotifications = storeNotifications.map(n => ({
      id: n.id,
      type: n.type as any,
      title: getNotificationTitle(n.type),
      message: n.message,
      timestamp: new Date(n.timestamp).toISOString(),
      read: false
    }));
    setNotifications(formattedNotifications);
  }, [storeNotifications]);

  // ... UI rendering logic ...
};
```

## 🔄 Complete Notification Flow Examples

### Example 1: Task Assignment
```
1. Mentor assigns task to Employee A
   ↓
2. Server updates database
   ↓
3. Server emits: io.to(projectId).emit('task_created', taskData)
   ↓
4. All clients in project room receive event
   ↓
5. Employee A's client checks: task.assignees.includes(user.id)
   ↓
6. Employee A's client calls: addNotification({
      type: 'info',
      message: 'New task assigned: Setup Database'
   })
   ↓
7. Zustand store updates notifications array
   ↓
8. Notification center re-renders with new notification
   ↓
9. Employee A sees notification bell with badge
```

### Example 2: Task Reassignment
```
1. Mentor reassigns task from Employee A to Employee B
   ↓
2. Server detects reassignment: oldAssigneeId !== newAssigneeId
   ↓
3. Server emits: io.to(projectId).emit('task_updated', {
      ...task,
      wasReassigned: true,
      previousAssignee: employeeA,
      assignedTo: employeeB
   })
   ↓
4. Both Employee A and B receive the event
   ↓
5. Employee A's client: if (task.previousAssignee._id === user.id)
      → Shows: "Task reassigned to Employee B"
   ↓
6. Employee B's client: if (task.assignedTo._id === user.id)
      → Shows: "Task assigned to you by Mentor"
   ↓
7. Both see notifications in their notification centers
```

## 🎯 Notification Types and Triggers

### 1. Task Assignment Notifications
**Trigger**: New task created with assignee
**Recipients**: Assigned user
**Message**: `"New task assigned: {taskTitle}"`

### 2. Task Reassignment Notifications
**Trigger**: Task assignee changed
**Recipients**: 
- Previous assignee: `"Task '{taskTitle}' has been reassigned to {newAssignee}"`
- New assignee: `"Task '{taskTitle}' has been assigned to you by {updatedBy}"`

### 3. Task Update Notifications
**Trigger**: Task status, priority, or other fields changed
**Recipients**: All project members except the person who made the change
**Message**: `"Task '{taskTitle}' was updated by {updatedBy}"`

### 4. User Presence Notifications
**Trigger**: User joins/leaves project
**Recipients**: All users in the project
**Message**: `"{userName} joined/left the project"`

### 5. System Notifications
**Trigger**: Connection issues, errors, success messages
**Recipients**: Individual user
**Message**: Various system messages

## 🔧 Technical Implementation Details

### Socket.IO Room Management
```javascript
// Server: User joins project room
socket.on('join_project', async (data) => {
  const { projectId, userId, userName } = data;
  socket.join(projectId); // Join room for real-time updates
  
  // Notify others in the room
  socket.to(projectId).emit('user_joined', { userId, userName });
});

// Broadcast to specific room
io.to(projectId).emit('task_updated', taskData);
```

### Client-Side Event Handling
```javascript
// useSocket hook automatically handles:
1. Connection management
2. Room joining
3. Event listening
4. Notification creation
5. State updates
```

### Notification Persistence
```javascript
// Notifications are stored in Zustand store
// They persist during the session but reset on page reload
// For permanent notifications, they would need database storage
```

## 📱 UI Components Integration

### 1. Notification Bell (in Navbar)
- Shows unread count badge
- Dropdown with notification list
- Mark as read functionality

### 2. Task Dashboard (Employee)
- Shows assigned tasks with "New" badges
- Filters for different notification types
- Direct links to task details

### 3. Toast Notifications (Optional)
- Could be added for immediate pop-up notifications
- Would use the same notification system

## 🚀 Real-time Features

### Instant Updates
- **No page refresh needed**
- **Optimistic updates** with rollback on errors
- **Connection state management** with reconnection

### User Presence
- **Active users display** in project header
- **Join/leave notifications**
- **Typing indicators** (framework ready)

### Conflict Resolution
- **Last-write-wins** for simple conflicts
- **Notification of concurrent edits**
- **Activity logging** for audit trails

## 🔍 Debugging Notifications

### Client-Side Debugging
```javascript
// In browser console:
// Check socket connection
window.socket = socketRef.current;

// Check notifications in store
useAppStore.getState().notifications;

// Monitor socket events
socket.on('task_updated', (data) => {
  console.log('Received task update:', data);
});
```

### Server-Side Debugging
```javascript
// In server console:
console.log('Broadcasting to room:', projectId);
console.log('Connected sockets:', io.sockets.sockets.size);
console.log('Room members:', io.sockets.adapter.rooms.get(projectId));
```

## 🎯 Key Benefits

### Real-time Communication
- **Instant notifications** without polling
- **Efficient bandwidth usage** with Socket.IO
- **Automatic reconnection** handling

### User Experience
- **Context-aware notifications** based on user role
- **Smart filtering** and organization
- **Visual indicators** for different notification types

### Scalability
- **Room-based broadcasting** for efficient message delivery
- **Event-driven architecture** for easy feature additions
- **State management** with Zustand for performance

The notification system provides a complete real-time communication layer that keeps all users informed of relevant changes while maintaining excellent performance and user experience! 🚀