import React from 'react';
import { Clock, CheckCircle, Plus, User, GitBranch } from 'lucide-react';

interface Activity {
  id: string;
  type: 'task_created' | 'task_completed' | 'project_created' | 'user_assigned';
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    user: 'Alice Employee',
    action: 'completed task',
    target: 'Setup project structure',
    timestamp: '2 minutes ago'
  },
  {
    id: '2',
    type: 'task_created',
    user: 'John Mentor',
    action: 'created task',
    target: 'Implement authentication',
    timestamp: '15 minutes ago'
  },
  {
    id: '3',
    type: 'user_assigned',
    user: 'John Mentor',
    action: 'assigned',
    target: 'Bob Employee to Design user interface',
    timestamp: '1 hour ago'
  },
  {
    id: '4',
    type: 'project_created',
    user: 'John Mentor',
    action: 'created project',
    target: 'Hackathon Demo Project',
    timestamp: '2 hours ago'
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task_completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'task_created':
      return <Plus className="h-4 w-4 text-blue-500" />;
    case 'user_assigned':
      return <User className="h-4 w-4 text-purple-500" />;
    case 'project_created':
      return <GitBranch className="h-4 w-4 text-orange-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export const ActivityFeed: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>
                {' '}{activity.action}{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};