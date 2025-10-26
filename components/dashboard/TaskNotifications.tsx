'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, User, Calendar, Flag, ArrowRight } from 'lucide-react';
import { apiService } from '../../lib/api';
import { useAppStore } from '../../lib/store';

interface TaskNotification {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  project: {
    _id: string;
    title: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  assignedAt?: string;
  isNew?: boolean;
}

interface TaskNotificationsProps {
  userId: string;
}

export const TaskNotifications: React.FC<TaskNotificationsProps> = ({ userId }) => {
  const [assignedTasks, setAssignedTasks] = useState<TaskNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'overdue' | 'today'>('all');
  
  const { user } = useAppStore();

  useEffect(() => {
    loadAssignedTasks();
  }, [userId]);

  const loadAssignedTasks = async () => {
    try {
      setLoading(true);
      const tasks = await apiService.getAssignedTasks(userId);
      setAssignedTasks(tasks);
    } catch (error) {
      console.error('Failed to load assigned tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case 'new':
        return assignedTasks.filter(task => task.isNew);
      case 'overdue':
        return assignedTasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < now && task.status !== 'done'
        );
      case 'today':
        return assignedTasks.filter(task => 
          task.dueDate && 
          new Date(task.dueDate) >= today && 
          new Date(task.dueDate) < tomorrow
        );
      default:
        return assignedTasks;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'review': return 'text-purple-600 bg-purple-50';
      case 'done': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && assignedTasks.find(t => t.dueDate === dueDate)?.status !== 'done';
  };

  const filteredTasks = getFilteredTasks();
  const newTasksCount = assignedTasks.filter(t => t.isNew).length;
  const overdueCount = assignedTasks.filter(t => isOverdue(t.dueDate)).length;
  const todayCount = assignedTasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(t.dueDate);
    return taskDate.toDateString() === today.toDateString();
  }).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">My Assigned Tasks</h2>
            {assignedTasks.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {assignedTasks.length}
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { key: 'all', label: 'All', count: assignedTasks.length },
            { key: 'new', label: 'New', count: newTasksCount },
            { key: 'overdue', label: 'Overdue', count: overdueCount },
            { key: 'today', label: 'Due Today', count: todayCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === tab.key
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-100">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No assigned tasks' : `No ${filter} tasks`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'You don\'t have any assigned tasks yet.'
                : `You don\'t have any ${filter} tasks.`
              }
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                task.isNew ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Task Header */}
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {task.title}
                    </h3>
                    {task.isNew && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  {/* Task Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Task Meta */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{task.project.title}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>by {task.createdBy.name}</span>
                    </div>

                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 ${
                        isOverdue(task.dueDate) ? 'text-red-600' : ''
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>
                          Due {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {isOverdue(task.dueDate) && (
                          <span className="text-red-600 font-medium">(Overdue)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Status and Priority */}
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      <Flag className="h-3 w-3 mr-1" />
                      {task.priority}
                    </span>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status === 'in-progress' ? 'In Progress' : 
                       task.status === 'todo' ? 'Backlog' :
                       task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>

                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                    <span>View Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};