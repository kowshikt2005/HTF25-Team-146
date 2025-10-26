import React from 'react';
import { Calendar, User, Flag, MoreHorizontal } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignees?: Array<{
    name: string;
    email: string;
  }>;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
}

interface ListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

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

export const ListView: React.FC<ListViewProps> = ({ tasks, onTaskClick }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
        <div className="col-span-4">Task</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Priority</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-2">Due Date</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Task Rows */}
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <div
            key={task._id}
            onClick={() => onTaskClick(task)}
            className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Task Title & Description */}
            <div className="col-span-4">
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-1">
                  {task.description}
                </p>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {task.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="text-xs text-gray-400">+{task.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                {task.status === 'in-progress' ? 'In Progress' : 
                 task.status === 'todo' ? 'To Do' : 
                 task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
            </div>

            {/* Priority */}
            <div className="col-span-1 flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                <Flag className="h-3 w-3 mr-1" />
                {task.priority.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Assignees */}
            <div className="col-span-2 flex items-center">
              {task.assignees && task.assignees.length > 0 ? (
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    {task.assignees.slice(0, 2).map((assignee, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white"
                        title={assignee.name}
                      >
                        <span className="text-white text-xs font-medium">
                          {assignee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {task.assignees.length > 2 && (
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-white text-xs font-medium">
                          +{task.assignees.length - 2}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-400">Unassigned</span>
              )}
            </div>

            {/* Due Date */}
            <div className="col-span-2 flex items-center">
              {task.dueDate ? (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">No due date</span>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle actions menu
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500">No tasks found</p>
        </div>
      )}
    </div>
  );
};