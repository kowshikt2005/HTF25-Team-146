import React from 'react';
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface ProjectAnalyticsProps {
  projectId: string;
  tasks: any[];
}

export const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({
  projectId,
  tasks
}) => {
  // Calculate analytics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length;
  const overdueTasks = tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Project Analytics</h3>
        <TrendingUp className="h-5 w-5 text-gray-400" />
      </div>

      {/* Progress Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(completionRate)}`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-700">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{completedTasks}</div>
        </div>
        
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-blue-700">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{inProgressTasks}</div>
        </div>
      </div>

      {/* Alerts */}
      {(highPriorityTasks > 0 || overdueTasks > 0) && (
        <div className="space-y-2">
          {highPriorityTasks > 0 && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-700">
                {highPriorityTasks} high priority task{highPriorityTasks > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {overdueTasks > 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Task Distribution */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Task Distribution</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">To Do</span>
            <span className="font-medium">{todoTasks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">In Progress</span>
            <span className="font-medium">{inProgressTasks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completed</span>
            <span className="font-medium">{completedTasks}</span>
          </div>
        </div>
      </div>
    </div>
  );
};