import React from 'react';
import { TaskCard } from './TaskCard';

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

interface KanbanColumnProps {
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDrop: (taskId: string, newStatus: string) => void;
}

const statusColors = {
  'todo': 'bg-gray-100',
  'in-progress': 'bg-blue-100',
  'done': 'bg-green-100'
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  onTaskClick,
  onDrop
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onDrop(taskId, status);
  };

  return (
    <div className="flex-1 min-w-80">
      <div className={`rounded-lg p-4 ${statusColors[status]}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
            {tasks.length}
          </span>
        </div>
        
        <div
          className="min-h-96 space-y-2"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {tasks.map((task) => (
            <div
              key={task._id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', task._id)}
            >
              <TaskCard
                task={task}
                onClick={() => onTaskClick(task)}
              />
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};