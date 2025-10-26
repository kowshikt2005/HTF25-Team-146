import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../lib/store';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, addNotification, updateTask } = useAppStore();

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      upgrade: false,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Task events
    socket.on('task_created', (task) => {
      if (task.assignedTo === user.id) {
        addNotification({
          type: 'info',
          message: `New task assigned: ${task.title}`
        });
      }
    });

    socket.on('task_updated', (task) => {
      updateTask(task._id, task);
      
      if (task.createdBy === user.id && task.assignedTo !== user.id) {
        addNotification({
          type: 'info',
          message: `Task "${task.title}" was updated`
        });
      }
    });

    socket.on('project_created', (project) => {
      if (project.collaborators.includes(user.id)) {
        addNotification({
          type: 'info',
          message: `Added to new project: ${project.title}`
        });
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const emitEvent = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    emitEvent,
    isConnected: socketRef.current?.connected || false,
  };
};