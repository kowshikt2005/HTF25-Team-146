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
  const [mentorStats, setMentorStats] = useState({
    activeTasks: 0,
    teamMembers: 0
  });
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
      const [projectsData, allUsers] = await Promise.all([
        apiService.getProjects(),
        apiService.getAllUsers()
      ]);
      
      setProjects(projectsData);
      
      // Calculate mentor statistics
      const teamMembers = allUsers.filter(u => u.role === 'employee').length;
      const activeTasks = projectsData.reduce((total, project) => {
        // This would need to be calculated from actual task data
        // For now, we'll use a placeholder
        return total + 0; // Will be updated when we load actual task data
      }, 0);
      
      setMentorStats({
        activeTasks,
        teamMembers
      });
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome back, {user.name}!
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Manage your projects and team with ease</p>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Create New Project
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Projects"
                value={projects.length}
                icon={FolderOpen}
                color="blue"
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Active Tasks"
                value={mentorStats.activeTasks}
                icon={CheckSquare}
                color="green"
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title="Team Members"
                value={mentorStats.teamMembers}
                icon={Users}
                color="purple"
              />
            </div>

            {/* Main Content Grid */}
            {loading ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-16">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-16">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No projects yet</h3>
                  <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">Get started by creating your first project and start collaborating with your team</p>
                  <Button 
                    onClick={() => setShowCreateModal(true)} 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Create Your First Project
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Projects Section */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>
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
                  
                  {/* Additional Quick Actions Card */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 rounded-xl hover:bg-blue-50 transition-colors duration-200 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">View All Projects</span>
                        </div>
                      </button>
                      <button className="w-full text-left p-3 rounded-xl hover:bg-green-50 transition-colors duration-200 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Manage Team</span>
                        </div>
                      </button>
                      <button className="w-full text-left p-3 rounded-xl hover:bg-purple-50 transition-colors duration-200 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">View Analytics</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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