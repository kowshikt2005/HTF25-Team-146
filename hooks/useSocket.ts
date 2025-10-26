import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../lib/store';

interface ActiveUser {
  userId: string;
  userName: string;
  joinedAt: Date;
}

export const useSocket = (projectId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user, addNotification, updateTask, addTask } = useAppStore();

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Join project room if projectId is provided
      if (projectId) {
        socket.emit('join_project', {
          projectId,
          userId: user.id,
          userName: user.name
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setActiveUsers([]);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      addNotification({
        type: 'error',
        message: 'Connection to server lost. Trying to reconnect...'
      });
    });

    socket.on('reconnect', () => {
      addNotification({
        type: 'success',
        message: 'Reconnected to server'
      });
    });

    // User presence events
    socket.on('active_users', (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    socket.on('user_joined', (userData: ActiveUser) => {
      setActiveUsers(prev => [...prev, userData]);
      addNotification({
        type: 'info',
        message: `${userData.userName} joined the project`
      });
    });

    socket.on('user_left', (userData: { userId: string; userName: string }) => {
      setActiveUsers(prev => prev.filter(u => u.userId !== userData.userId));
      addNotification({
        type: 'info',
        message: `${userData.userName} left the project`
      });
    });

    // Task events
    socket.on('task_created', (task) => {
      addTask(task);
      
      if (task.assignees?.some((assignee: any) => assignee._id === user.id)) {
        addNotification({
          type: 'info',
          message: `New task assigned: ${task.title}`
        });
      } else if (task.createdBy._id !== user.id) {
        addNotification({
          type: 'info',
          message: `New task created: ${task.title}`
        });
      }
    });

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
      } else if (task.updatedBy && task.updatedBy !== user.name) {
        // Regular update notification
        addNotification({
          type: 'info',
          message: `Task "${task.title}" was updated by ${task.updatedBy}`
        });
      }
    });

    socket.on('project_created', (project) => {
      if (project.collaborators.some((collab: any) => collab._id === user.id)) {
        addNotification({
          type: 'info',
          message: `Added to new project: ${project.title}`
        });
      }
    });

    // Typing indicators
    socket.on('user_typing', (data) => {
      // Handle typing indicators in UI
      console.log(`${data.userName} is typing on task ${data.taskId}`);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setActiveUsers([]);
    };
  }, [user?.id, projectId]);

  const emitEvent = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const joinProject = (newProjectId: string) => {
    if (socketRef.current?.connected && user) {
      socketRef.current.emit('join_project', {
        projectId: newProjectId,
        userId: user.id,
        userName: user.name
      });
    }
  };

  return {
    socket: socketRef.current,
    emitEvent,
    joinProject,
    isConnected,
    activeUsers,
  };
};