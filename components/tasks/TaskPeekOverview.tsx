import React, { useState } from 'react';
import { X, ExternalLink, MessageSquare, Paperclip } from 'lucide-react';
import { TaskProperties } from './TaskProperties';
import { Button } from '../ui/Button';

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

interface TaskPeekOverviewProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFull: () => void;
  canEdit?: boolean;
}

export const TaskPeekOverview: React.FC<TaskPeekOverviewProps> = ({
  task,
  isOpen,
  onClose,
  onOpenFull,
  canEdit = false
}) => {
  const [workNote, setWorkNote] = useState('');

  if (!isOpen || !task) return null;

  const taskId = `TASK-${task._id.slice(-4).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-gray-500">{taskId}</span>
            <button
              onClick={onOpenFull}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
              title="Open full view"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {task.title}
          </h2>

          {/* Properties */}
          <div className="mb-4">
            <TaskProperties task={task} />
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mb-4">
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4 mr-1" />
              Comment
            </Button>
            <Button size="sm" variant="outline">
              <Paperclip className="h-4 w-4 mr-1" />
              Attach
            </Button>
          </div>

          {/* Quick Work Note (for employees) */}
          {!canEdit && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add Work Progress</h3>
              <textarea
                value={workNote}
                onChange={(e) => setWorkNote(e.target.value)}
                placeholder="What did you work on today?"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" disabled={!workNote.trim()}>
                  Add Progress
                </Button>
              </div>
            </div>
          )}

          {/* Creator Info */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Created by</span>
              <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {task.createdBy.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{task.createdBy.name}</span>
              <span>•</span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};