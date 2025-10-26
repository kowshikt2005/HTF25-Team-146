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
      const projectsData = await apiService.getProjects();
      setProjects(projectsData);
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">Your assigned projects and tasks</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="My Tasks"
              value="12"
              icon={CheckSquare}
              color="blue"
            />
            <StatsCard
              title="In Progress"
              value="4"
              icon={Clock}
              color="orange"
            />
            <StatsCard
              title="Completed"
              value="8"
              icon={CheckSquare}
              color="green"
            />
            <StatsCard
              title="Productivity"
              value="92%"
              icon={TrendingUp}
              color="purple"
              trend={{ value: 3, isPositive: true }}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h3>
              <p className="text-gray-600">Wait for your mentor to assign you to projects</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Task Notifications */}
              <TaskNotifications userId={user.id} />
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Projects Section */}
                <div className="xl:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Assigned Projects</h2>
                    <span className="text-sm text-gray-500">{projects.length} projects</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project: any) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        onClick={() => handleProjectClick(project._id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="xl:col-span-1">
                  <ActivityFeed />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}