'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '../../lib/auth';
import { Button } from '../ui/Button';
import { SimpleNotificationCenter } from '../notifications/SimpleNotificationCenter';
import { Calendar, Home, Users } from 'lucide-react';

interface NavbarProps {
  user: User;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Collaborative Workspace
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(user?.role === 'mentor' ? '/mentor/dashboard' : '/employee/dashboard')}
                className="flex items-center space-x-1"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/calendar')}
                className="flex items-center space-x-1"
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/team')}
                className={`flex items-center space-x-1 ${user?.role !== 'mentor' ? 'hidden' : ''}`}
              >
                <Users className="w-4 h-4" />
                <span>Team</span>
              </Button>
            </div>
            
            <SimpleNotificationCenter />
            
            <div className="flex items-center space-x-2">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name || ''}</p>
                <p className="text-gray-500 capitalize">{user?.role || ''}</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || ''}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};