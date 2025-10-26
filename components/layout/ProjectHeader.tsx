import React from 'react';
import { ChevronLeft, MoreHorizontal, Plus, Filter, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { ViewSwitcher } from '../views/ViewSwitcher';

type ViewType = 'kanban' | 'list' | 'calendar' | 'timeline';

interface ProjectHeaderProps {
  title: string;
  onBack: () => void;
  onCreateTask: () => void;
  onToggleFilters?: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title,
  onBack,
  onCreateTask,
  onToggleFilters,
  currentView,
  onViewChange
}) => {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <ViewSwitcher
            currentView={currentView}
            onViewChange={onViewChange}
          />

          {/* Filters */}
          <Button variant="outline" size="sm" onClick={onToggleFilters}>
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Add Task */}
          <Button size="sm" onClick={onCreateTask}>
            <Plus className="h-4 w-4 mr-1" />
            Add work item
          </Button>

          {/* More Options */}
          <button className="p-2 hover:bg-gray-100 rounded text-gray-600">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};