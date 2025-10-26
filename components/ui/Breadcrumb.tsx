import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Home className="h-4 w-4" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-gray-900 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : 'hover:text-gray-900'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};