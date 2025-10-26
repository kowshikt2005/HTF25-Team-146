import React, { useState } from 'react';
import { Check, X, Trash2, User, Flag, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface BulkOperationsProps {
  selectedTasks: string[];
  onClearSelection: () => void;
  onBulkUpdate: (updates: any) => void;
  onBulkDelete: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedTasks,
  onClearSelection,
  onBulkUpdate,
  onBulkDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  if (selectedTasks.length === 0) return null;

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!showActions ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowActions(true)}
              >
                Bulk Actions
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Select
                options={statusOptions}
                onChange={(e) => onBulkUpdate({ status: e.target.value })}
                className="w-32"
              />
              <Select
                options={priorityOptions}
                onChange={(e) => onBulkUpdate({ priority: e.target.value })}
                className="w-32"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={onBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowActions(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};