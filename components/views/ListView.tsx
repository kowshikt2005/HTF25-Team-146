'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Calendar,
  User,
  Flag,
  Clock
} from 'lucide-react';

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

interface ListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

type SortField = 'title' | 'status' | 'priority' | 'assignedTo' | 'dueDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const priorityColors = {
  low: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50'
};

const statusColors = {
  'todo': 'text-gray-600 bg-gray-50',
  'in-progress': 'text-blue-600 bg-blue-50',
  'review': 'text-purple-600 bg-purple-50',
  'done': 'text-green-600 bg-green-50'
};

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle nested properties
      if (sortField === 'assignedTo') {
        aValue = a.assignedTo?.name || '';
        bValue = b.assignedTo?.name || '';
      }

      // Handle dates
      if (sortField === 'dueDate' || sortField === 'createdAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(t => t._id)));
    }
  };

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-700 hover:text-gray-900"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedTasks.size} item{selectedTasks.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button className="text-sm text-blue-700 hover:text-blue-900">
                Update Status
              </button>
              <button className="text-sm text-blue-700 hover:text-blue-900">
                Assign
              </button>
              <button className="text-sm text-red-600 hover:text-red-800">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedTasks.size === tasks.length && tasks.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-4">
            <SortButton field="title">Title</SortButton>
          </div>
          <div className="col-span-2">
            <SortButton field="status">Status</SortButton>
          </div>
          <div className="col-span-1">
            <SortButton field="priority">Priority</SortButton>
          </div>
          <div className="col-span-2">
            <SortButton field="assignedTo">Assignee</SortButton>
          </div>
          <div className="col-span-1">
            <SortButton field="dueDate">Due Date</SortButton>
          </div>
          <div className="col-span-1">
            <SortButton field="createdAt">Created</SortButton>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {sortedTasks.map((task) => (
          <div
            key={task._id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selectedTasks.has(task._id)}
                onChange={() => handleSelectTask(task._id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div className="col-span-4">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 truncate">
                  {task.title}
                </span>
                {task.description && (
                  <span className="text-sm text-gray-500 truncate mt-1">
                    {task.description}
                  </span>
                )}
              </div>
            </div>
            
            <div className="col-span-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[task.status]}`}>
                {task.status === 'in-progress' ? 'In Progress' : task.status}
              </span>
            </div>
            
            <div className="col-span-1">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${priorityColors[task.priority]}`}>
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
              </span>
            </div>
            
            <div className="col-span-2">
              {task.assignedTo ? (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {task.assignedTo.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 truncate">
                    {task.assignedTo.name}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Unassigned</span>
              )}
            </div>
            
            <div className="col-span-1">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(task.dueDate)}
              </div>
            </div>
            
            <div className="col-span-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(task.createdAt)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle task menu
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <List className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No work items</h3>
          <p className="text-gray-500">Get started by creating your first work item.</p>
        </div>
      )}
    </div>
  );
};