import React from 'react';
import { Calendar, User, Flag, Clock, Tag } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: {
    _id: string;
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

interface TaskPropertiesProps {
  task: Task;
  isReadOnly?: boolean;
  onUpdate?: (updates: Partial<Task>) => void;
}

const priorityConfig = {
  low: { color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  critical: { color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' }
};

const statusConfig = {
  'todo': { label: 'To Do', color: 'text-gray-600', bg: 'bg-gray-50' },
  'in-progress': { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' },
  'done': { label: 'Done', color: 'text-green-600', bg: 'bg-green-50' }
};

export const TaskProperties: React.FC<TaskPropertiesProps> = ({
  task,
  isReadOnly = false,
  onUpdate
}) => {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {/* Status */}
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${status.bg} ${status.color}`}>
        <div className="w-2 h-2 rounded-full bg-current opacity-60" />
        <span className="font-medium">{status.label}</span>
      </div>

      {/* Priority */}
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${priority.bg} ${priority.color}`}>
        <Flag className="h-3 w-3" />
        <span className="font-medium capitalize">{task.priority}</span>
      </div>

      {/* Assignee */}
      {task.assignedTo && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-600">
          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{task.assignedTo.name}</span>
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 text-gray-600">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">
            {new Date(task.dueDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      )}

      {/* Created Time */}
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 text-gray-500">
        <Clock className="h-3 w-3" />
        <span className="text-xs">
          {new Date(task.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      </div>
    </div>
  );
};