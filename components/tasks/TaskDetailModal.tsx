'use client';

import React, { useState } from 'react';
import { X, Calendar, User, Flag, MessageSquare, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

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

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdateTask?: (taskId: string, updates: any) => void;
  canEdit?: boolean;
}

const priorityConfig = {
  low: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  high: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  critical: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' }
};

const statusConfig = {
  'todo': { label: 'To Do', color: 'text-gray-700', bg: 'bg-gray-50' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50' },
  'done': { label: 'Done', color: 'text-green-700', bg: 'bg-green-50' }
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateTask,
  canEdit = false
}) => {
  const [workDescription, setWorkDescription] = useState('');
  const [isAddingWork, setIsAddingWork] = useState(false);

  if (!isOpen || !task) return null;

  const taskId = `TASK-${task._id.slice(-4).toUpperCase()}`;
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];

  const handleAddWorkDescription = () => {
    if (workDescription.trim() && onUpdateTask) {
      // This would typically add to a work log array
      onUpdateTask(task._id, { 
        workDescription: workDescription.trim(),
        lastUpdated: new Date().toISOString()
      });
      setWorkDescription('');
      setIsAddingWork(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">{taskId}</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color} ${priority.border} border`}>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
                {task.priority}
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              {task.title}
            </h1>

            {/* Description */}
            {task.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            {/* Work Progress Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Work Progress</h3>
                {!canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingWork(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Add Progress
                  </Button>
                )}
              </div>

              {isAddingWork && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <textarea
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Describe what you worked on today..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={handleAddWorkDescription}>
                      Add Progress
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingWork(false);
                        setWorkDescription('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Sample work entries */}
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {task.assignedTo?.name.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Task created and initial setup completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
            <div className="space-y-6">
              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Assignee
                </label>
                <div className="flex items-center gap-2">
                  {task.assignedTo ? (
                    <>
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.assignedTo.name}</p>
                        <p className="text-xs text-gray-500">{task.assignedTo.email}</p>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Unassigned</span>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Due Date
                </label>
                {task.dueDate ? (
                  <p className="text-sm text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                ) : (
                  <span className="text-sm text-gray-500">No due date</span>
                )}
              </div>

              {/* Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Created
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">by {task.createdBy.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};