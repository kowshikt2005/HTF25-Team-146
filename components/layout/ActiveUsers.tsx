'use client';

import React from 'react';
import { Users, Circle } from 'lucide-react';

interface ActiveUser {
  userId: string;
  userName: string;
  joinedAt: Date;
}

interface ActiveUsersProps {
  users: ActiveUser[];
  currentUserId: string;
}

export const ActiveUsers: React.FC<ActiveUsersProps> = ({ users, currentUserId }) => {
  const otherUsers = users.filter(user => user.userId !== currentUserId);

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <div className="flex items-center space-x-1">
        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
        <Users className="h-4 w-4" />
      </div>
      
      <div className="flex items-center space-x-2">
        {otherUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.userId}
            className="flex items-center space-x-1"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            {index < 2 && index < otherUsers.length - 1 && (
              <span className="text-gray-400">,</span>
            )}
          </div>
        ))}
        
        {otherUsers.length > 3 && (
          <span className="text-gray-500">
            +{otherUsers.length - 3} more
          </span>
        )}
        
        <span className="text-gray-500">
          {otherUsers.length === 1 ? 'is' : 'are'} online
        </span>
      </div>
    </div>
  );
};