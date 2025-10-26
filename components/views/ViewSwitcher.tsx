import React from 'react';
import { LayoutGrid, List, Calendar, BarChart3 } from 'lucide-react';

type ViewType = 'kanban' | 'list' | 'calendar' | 'timeline';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const views = [
  { id: 'list' as ViewType, name: 'List', icon: List },
  { id: 'kanban' as ViewType, name: 'Board', icon: LayoutGrid },
  { id: 'calendar' as ViewType, name: 'Calendar', icon: Calendar },
  { id: 'timeline' as ViewType, name: 'Timeline', icon: BarChart3 },
];

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <div className="flex items-center border border-gray-200 rounded-md">
      {views.map((view, index) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        const isFirst = index === 0;
        const isLast = index === views.length - 1;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
              ${!isFirst ? 'border-l border-gray-200' : ''}
              ${isFirst ? 'rounded-l-md' : ''}
              ${isLast ? 'rounded-r-md' : ''}
            `}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.name}</span>
          </button>
        );
      })}
    </div>
  );
};