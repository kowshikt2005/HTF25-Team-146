import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { DraggableTaskCard } from './DraggableTaskCard';

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
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
  canAddTasks?: boolean;
}

const statusConfig = {
  'todo': {
    color: 'text-gray-600',
    bgColor: 'bg-gray-50/50',
    count: 'bg-gray-100 text-gray-600'
  },
  'in-progress': {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50/30',
    count: 'bg-blue-100 text-blue-600'
  },
  'done': {
    color: 'text-green-600',
    bgColor: 'bg-green-50/30',
    count: 'bg-green-100 text-green-600'
  }
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
  onAddTask,
  canAddTasks = false
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const config = statusConfig[id as keyof typeof statusConfig] || statusConfig.todo;
  const taskIds = tasks.map(task => task._id);

  return (
    <div className="flex flex-col h-full min-w-80 max-w-80">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/60">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium text-sm ${config.color}`}>
            {title}
          </h3>
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${config.count}`}>
            {tasks.length}
          </span>
        </div>
        
        {canAddTasks && onAddTask && (
          <button
            onClick={onAddTask}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`flex-1 px-3 py-2 ${config.bgColor} min-h-96 transition-colors ${
          isOver ? 'bg-blue-50' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-0">
            {tasks.map((task) => (
              <DraggableTaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
            
            {/* Add New Task Button */}
            {canAddTasks && onAddTask && (
              <button
                onClick={onAddTask}
                className="w-full p-2 mt-2 text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors"
              >
                + New work item
              </button>
            )}
            
            {tasks.length === 0 && (!canAddTasks || !onAddTask) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-gray-400">No tasks</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};