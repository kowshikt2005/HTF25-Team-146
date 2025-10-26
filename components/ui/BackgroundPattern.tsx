'use client';

import React from 'react';

interface BackgroundPatternProps {
  variant?: 'default' | 'emerald';
  className?: string;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const gradientClass = variant === 'emerald' 
    ? 'bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50'
    : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';

  const blobColors = variant === 'emerald'
    ? {
        first: 'bg-emerald-200',
        second: 'bg-blue-200',
        third: 'bg-purple-200'
      }
    : {
        first: 'bg-blue-200',
        second: 'bg-purple-200',
        third: 'bg-indigo-200'
      };

  return (
    <div className={`absolute inset-0 ${gradientClass} ${className}`}>
      {/* Dot Pattern */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: 'radial-gradient(circle, #9C92AC 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.1
        }}
      />
      
      {/* Floating Elements */}
      <div className={`absolute top-20 left-20 w-72 h-72 ${blobColors.first} rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob`} />
      <div className={`absolute top-40 right-20 w-72 h-72 ${blobColors.second} rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000`} />
      <div className={`absolute -bottom-8 left-40 w-72 h-72 ${blobColors.third} rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000`} />
    </div>
  );
};