'use client';

import React, { useState } from 'react';
import { Github, ArrowRight, X, MousePointer } from 'lucide-react';

export const GitHubAccessGuide: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">GitHub Integration</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <MousePointer className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-700">How to access GitHub features:</p>
          </div>
        </div>
        
        <div className="pl-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
            <span>Click on any project card</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
            <span>Click the "GitHub" tab</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
            <span>Add repository URL or view details</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            💡 Projects with GitHub show a green "GitHub Connected" badge
          </p>
        </div>
      </div>
    </div>
  );
};