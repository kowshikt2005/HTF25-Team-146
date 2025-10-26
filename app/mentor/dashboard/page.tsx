'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../lib/auth';
import { apiService } from '../../../lib/api';
import { Navbar } from '../../../components/layout/Navbar';
import { ProjectCard } from '../../../components/projects/ProjectCard';
import { CreateProjectModal } from '../../../components/projects/CreateProjectModal';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { Button } from '../../../components/ui/Button';
import { FolderOpen, CheckSquare, Users, TrendingUp } from 'lucide-react';

export default function MentorDashboard() {
  const [user, setUser] = useState(authService.getUser());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'mentor') {
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
    router.push(`/mentor/project/${projectId}`);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">Manage your projects and team</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              Create New Project
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Projects"
              value={projects.length}
              icon={FolderOpen}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Active Tasks"
              value="24"
              icon={CheckSquare}
              color="green"
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Team Members"
              value="6"
              icon={Users}
              color="purple"
            />
            <StatsCard
              title="Completion Rate"
              value="87%"
              icon={TrendingUp}
              color="orange"
              trend={{ value: 5, isPositive: true }}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No projects yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Get started by creating your first project and start collaborating with your team</p>
              <Button onClick={() => setShowCreateModal(true)} size="lg">
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Projects Section */}
              <div className="xl:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
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
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={loadProjects}
      />
    </div>
  );
}