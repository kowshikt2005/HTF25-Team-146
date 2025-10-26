'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../lib/auth';
import { apiService } from '../../../lib/api';
import { Navbar } from '../../../components/layout/Navbar';
import { ProjectCard } from '../../../components/projects/ProjectCard';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { TaskNotifications } from '../../../components/dashboard/TaskNotifications';
import { CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';

export default function EmployeeDashboard() {
  const [user, setUser] = useState(authService.getUser());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    myTasks: 0,
    inProgress: 0,
    completed: 0
  });
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'employee') {
      router.push('/auth/login');
      return;
    }
    
    loadProjects();
  }, [user, router]);

  const loadProjects = async () => {
    try {
      const [projectsData, assignedTasks] = await Promise.all([
        apiService.getProjects(),
        apiService.getAssignedTasks(user.id)
      ]);
      
      setProjects(projectsData);
      
      // Calculate task statistics
      const stats = {
        myTasks: assignedTasks.length,
        inProgress: assignedTasks.filter(task => task.status === 'in-progress').length,
        completed: assignedTasks.filter(task => task.status === 'done').length
      };
      
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/employee/project/${projectId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <Navbar user={user} />
      
      {/* Main Layout with Sidebar Space */}
      <div className="flex">
        {/* Reserved space for future sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          {/* Placeholder for future sidebar */}
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-none mx-auto py-8 px-6 lg:px-8">
            {/* Header Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Your assigned projects and tasks overview</p>
              </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="My Tasks"
                value={userStats.myTasks}
                icon={CheckSquare}
                color="blue"
              />
              <StatsCard
                title="In Progress"
                value={userStats.inProgress}
                icon={Clock}
                color="orange"
              />
              <StatsCard
                title="Completed"
                value={userStats.completed}
                icon={CheckSquare}
                color="green"
              />
            </div>

            {/* Main Content */}
            {loading ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-16">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-16">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No projects assigned</h3>
                  <p className="text-gray-600 text-lg">Wait for your mentor to assign you to projects</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Task Notifications */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
                  <TaskNotifications userId={user.id} />
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Projects Section */}
                  <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Assigned Projects</h2>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {projects.length} projects
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {projects.map((project: any) => (
                          <ProjectCard
                            key={project._id}
                            project={project}
                            onClick={() => handleProjectClick(project._id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar Content */}
                  <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
                      <ActivityFeed />
                    </div>
                    
                    {/* Task Summary Card */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">To Do</span>
                          </div>
                          <span className="text-sm font-bold text-blue-600">{userStats.myTasks - userStats.inProgress - userStats.completed}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">In Progress</span>
                          </div>
                          <span className="text-sm font-bold text-orange-600">{userStats.inProgress}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckSquare className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Completed</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">{userStats.completed}</span>
                        </div>
                      </div>
                    </div>

                    {/* Priority Tasks Card */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Tasks</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-medium text-red-600 uppercase tracking-wide">High Priority</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">Fix authentication bug</p>
                          <p className="text-xs text-gray-500 mt-1">Due in 2 days</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Medium Priority</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">Update user interface</p>
                          <p className="text-xs text-gray-500 mt-1">Due in 5 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}