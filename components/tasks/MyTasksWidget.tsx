import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, Calendar } from 'lucide-react';
import { authService } from '../../lib/auth';

interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  project: {
    title: string;
  };
}

export const MyTasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  useEffect(() => {
    // TODO: Implement API call to get user's tasks across all projects
    // For now, using mock data
    const mockTasks: Task[] = [
      {
        _id: '1',
        title: 'Setup project structure',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        project: { title: 'Hackathon Demo Project' }
      },
      {
        _id: '2',
        title: 'Design user interface',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        project: { title: 'Hackathon Demo Project' }
      },
      {
        _id: '3',
        title: 'Write API documentation',
        status: 'todo',
        priority: 'low',
        project: { title: 'Hackathon Demo Project' }
      }
    ];
    
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  };

  const statusIcons = {
    'todo': <Clock className="h-4 w-4 text-gray-500" />,
    'in-progress': <AlertCircle className="h-4 w-4 text-blue-500" />,
    'done': <CheckSquare className="h-4 w-4 text-green-500" />
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
        <span className="text-sm text-gray-500">{tasks.length} tasks</span>
      </div>

      <div className="space-y-3">
        {tasks.slice(0, 5).map((task) => (
          <div key={task._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <div className="flex-shrink-0">
              {statusIcons[task.status]}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{task.project.title}</span>
                <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
              }`}>
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all {tasks.length} tasks →
          </button>
        </div>
      )}
    </div>
  );
};