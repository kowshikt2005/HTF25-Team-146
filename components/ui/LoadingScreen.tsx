'use client';

import React from 'react';
import { Users, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center animate-fade-in">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          CollabSpace
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {message}
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};