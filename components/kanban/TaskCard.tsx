import React from 'react';
import { MoreHorizontal } from 'lucide-react';

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

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onPeek?: () => void;
  isDragging?: boolean;
}

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600', 
  high: 'text-orange-600',
  critical: 'text-red-600'
};

const statusColors = {
  'todo': 'text-gray-500',
  'in-progress': 'text-blue-600',
  'review': 'text-purple-600',
  'done': 'text-green-600'
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onPeek, isDragging = false }) => {
  const taskId = `${task._id.slice(-4).toUpperCase()}`;
  
  return (
    <div
      onClick={onClick}
      className={`group/kanban-block relative mb-2 block rounded border border-gray-200 bg-white p-3 text-sm transition-all hover:border-gray-300 hover:shadow-sm cursor-pointer ${
        isDragging ? 'shadow-lg border-blue-300 bg-blue-50' : ''
      }`}
    >
      {/* Header with ID and Actions */}
      <div className="relative mb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">{taskId}</span>
          <div className="opacity-0 group-hover/kanban-block:opacity-100 transition-opacity">
            <button 
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Title */}
      <div className="mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 leading-5">
          {task.title}
        </h4>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-4">
          {task.description}
        </p>
      )}

      {/* Properties Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Status */}
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              task.status === 'todo' ? 'bg-gray-400' :
              task.status === 'in-progress' ? 'bg-blue-500' :
              task.status === 'review' ? 'bg-purple-500' : 'bg-green-500'
            }`} />
            <span className={`capitalize ${statusColors[task.status]}`}>
              {task.status === 'in-progress' ? 'In Progress' : 
               task.status === 'todo' ? 'Backlog' : 
               task.status === 'review' ? 'Review' : 'Done'}
            </span>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1">
            <span className={`capitalize ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Assignee */}
        {task.assignedTo && (
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {task.assignedTo.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className="mt-2 text-xs text-gray-400">
          {new Date(task.dueDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      )}
    </div>
  );
};