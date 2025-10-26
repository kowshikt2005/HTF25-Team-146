import React, { useState } from 'react';
import { Filter, X, Search, Calendar, User, Flag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface TaskFiltersProps {
  onFiltersChange: (filters: any) => void;
  activeFilters: any;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  onFiltersChange,
  activeFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(activeFilters.search || '');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="relative">
      {/* Filter Button */}
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-1" />
        Filters
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Filter Tasks</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleFilterChange('search', e.target.value);
                    }}
                    placeholder="Search tasks..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={activeFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={statusOptions}
                />
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Select
                  value={activeFilters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  options={priorityOptions}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">Active filters:</span>
          {activeFilters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
              <Search className="h-3 w-3" />
              "{activeFilters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {activeFilters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
              Status: {statusOptions.find(s => s.value === activeFilters.status)?.label}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="text-green-500 hover:text-green-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {activeFilters.priority && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs">
              <Flag className="h-3 w-3" />
              {priorityOptions.find(p => p.value === activeFilters.priority)?.label}
              <button
                onClick={() => handleFilterChange('priority', '')}
                className="text-orange-500 hover:text-orange-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};