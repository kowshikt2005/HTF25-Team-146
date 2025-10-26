'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, Clock, Edit3, Save, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { apiService } from '../../lib/api';
import { useAppStore } from '../../lib/store';
import { useSocket } from '../../hooks/useSocket';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  assignees?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  project: {
    _id: string;
    title: string;
  };
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  canEdit: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  canEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    assignedTo: '',
    dueDate: '',
    estimatedHours: 0,
    actualHours: 0
  });

  const { user, updateTask } = useAppStore();
  const { emitEvent } = useSocket();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?._id || task.assignees?.[0]?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0
      });
    }
  }, [task]);

  useEffect(() => {
    if (isOpen && canEdit) {
      loadUsers();
    }
  }, [isOpen, canEdit]);

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedHours' || name === 'actualHours' ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    if (!task) return;

    setLoading(true);
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        estimatedHours: formData.estimatedHours,
        actualHours: formData.actualHours
      };

      const updatedTask = await apiService.updateTask(task._id, updates);
      updateTask(task._id, updatedTask);

      // Check if task was reassigned
      const wasReassigned = task.assignedTo?._id !== formData.assignedTo && formData.assignedTo;
      
      // Emit real-time event
      emitEvent('task_updated', {
        ...updatedTask,
        wasReassigned,
        previousAssignee: task.assignedTo,
        updatedBy: user?.name
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  };

  const statusColors = {
    'todo': 'text-gray-600 bg-gray-50 border-gray-200',
    'in-progress': 'text-blue-600 bg-blue-50 border-blue-200',
    'review': 'text-purple-600 bg-purple-50 border-purple-200',
    'done': 'text-green-600 bg-green-50 border-green-200'
  };

  const statusOptions = [
    { value: 'todo', label: 'Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map(u => ({ value: u._id, label: u.name }))
  ];

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500 font-medium">
              #{task._id.slice(-6).toUpperCase()}
            </div>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-1"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </Button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            {isEditing ? (
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="text-lg font-semibold"
              />
            ) : (
              <h1 className="text-xl font-semibold text-gray-900">{task.title}</h1>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              {isEditing ? (
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={statusOptions}
                />
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[task.status]}`}>
                  {statusOptions.find(s => s.value === task.status)?.label}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              {isEditing ? (
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  options={priorityOptions}
                />
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[task.priority]}`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
            {isEditing ? (
              <Select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                options={userOptions}
              />
            ) : (
              <div className="flex items-center space-x-2">
                {task.assignedTo ? (
                  <>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {task.assignedTo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{task.assignedTo.name}</p>
                      <p className="text-sm text-gray-500">{task.assignedTo.email}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500">Unassigned</span>
                )}
              </div>
            )}
          </div>

          {/* Timeline Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              {isEditing ? (
                <Input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {task.dueDate 
                      ? new Date(task.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No due date set'
                    }
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
              <div className="flex items-center space-x-2 text-gray-700">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
              {isEditing ? (
                <Input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                />
              ) : (
                <span className="text-gray-700">{task.estimatedHours || 0}h</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actual Hours</label>
              {isEditing ? (
                <Input
                  type="number"
                  name="actualHours"
                  value={formData.actualHours}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                />
              ) : (
                <span className="text-gray-700">{task.actualHours || 0}h</span>
              )}
            </div>
          </div>

          {/* Created By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {task.createdBy.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{task.createdBy.name}</p>
                <p className="text-sm text-gray-500">{task.createdBy.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};