'use client';

import React, { useState, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { apiService } from '../../lib/api';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: {
    name: string;
    email: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  dueDate?: string;
}

interface KanbanBoardProps {
  projectId: string;
  onTaskClick: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, onTaskClick }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      const tasksData = await apiService.getTasks(projectId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDrop = async (taskId: string, newStatus: string) => {
    try {
      await apiService.updateTask(taskId, { status: newStatus });
      
      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, status: newStatus as any } : task
        )
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      <KanbanColumn
        title="To Do"
        status="todo"
        tasks={todoTasks}
        onTaskClick={onTaskClick}
        onDrop={handleTaskDrop}
      />
      <KanbanColumn
        title="In Progress"
        status="in-progress"
        tasks={inProgressTasks}
        onTaskClick={onTaskClick}
        onDrop={handleTaskDrop}
      />
      <KanbanColumn
        title="Done"
        status="done"
        tasks={doneTasks}
        onTaskClick={onTaskClick}
        onDrop={handleTaskDrop}
      />
    </div>
  );
};