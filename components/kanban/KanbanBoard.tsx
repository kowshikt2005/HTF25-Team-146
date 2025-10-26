'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { apiService } from '../../lib/api';
import { useAppStore } from '../../lib/store';
import { useOptimisticUpdates } from '../../hooks/useOptimisticUpdates';
import { useSocket } from '../../hooks/useSocket';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
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
  onAddTask?: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  projectId, 
  onTaskClick, 
  onAddTask 
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { user, tasks, setTasks, isLoading, setLoading } = useAppStore();
  const { optimisticTaskUpdate } = useOptimisticUpdates();
  const { emitEvent, joinProject, activeUsers } = useSocket(projectId);
  const canAddTasks = user?.role === 'mentor';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await apiService.getTasks(projectId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // Find the task being moved
    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Use optimistic update
    await optimisticTaskUpdate(taskId, { status: newStatus }, task);
    
    // Emit real-time event
    emitEvent('task_updated', { ...task, status: newStatus });
  };

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full bg-gray-50 px-6 py-4 gap-6 overflow-x-auto">
        <KanbanColumn
          id="todo"
          title="Backlog"
          tasks={todoTasks}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          canAddTasks={canAddTasks}
        />
        <KanbanColumn
          id="in-progress"
          title="In Progress"
          tasks={inProgressTasks}
          onTaskClick={onTaskClick}
        />
        <KanbanColumn
          id="review"
          title="Review"
          tasks={tasks.filter(task => task.status === 'review')}
          onTaskClick={onTaskClick}
        />
        <KanbanColumn
          id="done"
          title="Done"
          tasks={doneTasks}
          onTaskClick={onTaskClick}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard
              task={activeTask}
              onClick={() => {}}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};