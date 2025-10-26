'use client';

import React from 'react';
import { ArrowLeft, Plus, Filter, LayoutGrid, List, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ActiveUsers } from './ActiveUsers';

type ViewType = 'kanban' | 'list' | 'calendar' | 'timeline';

interface ActiveUser {
  userId: string;
  userName: string;
  joinedAt: Date;
}

interface ProjectHeaderProps {
  title: string;
  onBack: () => void;
  onCreateTask: () => void;
  onToggleFilters: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  activeUsers?: ActiveUser[];
  currentUserId?: string;
}

const viewIcons = {
  kanban: LayoutGrid,
  list: List,
  calendar: Calendar,
  timeline: BarChart3,
};

const viewLabels = {
  kanban: 'Board',
  list: 'List',
  calendar: 'Calendar',
  timeline: 'Timeline',
};

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title,
  onBack,
  onCreateTask,
  onToggleFilters,
  currentView,
  onViewChange,
  activeUsers = [],
  currentUserId,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500">Manage and track work items</p>
              {currentUserId && (
                <ActiveUsers users={activeUsers} currentUserId={currentUserId} />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {Object.entries(viewIcons).map(([view, Icon]) => (
              <button
                key={view}
                onClick={() => onViewChange(view as ViewType)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === view
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{viewLabels[view as ViewType]}</span>
              </button>
            ))}
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={onToggleFilters}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>

          {/* Create Task Button */}
          <Button onClick={onCreateTask} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Item</span>
          </Button>
        </div>
      </div>
    </div>
  );
};