'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/auth';
import { apiService } from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { GitHubIntegration } from '../../components/github/GitHubIntegration';
import { GitHubRepositoryViewer } from '../../components/github/GitHubRepositoryViewer';
import { AddGitUrlForm } from '../../components/github/AddGitUrlForm';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Github, Calendar, Users, Settings } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  gitRepo?: string;
  githubUrl?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState(authService.getUser());
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'github' | 'team'>('overview');
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    loadProject();
  }, [user, router, params.id]);

  const loadProject = async () => {
    try {
      const projectData = await apiService.getProject(params.id);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRepositoryCreated = (repoData: any) => {
    if (project) {
      setProject(prev => prev ? {
        ...prev,
        gitRepo: `${repoData.owner.login}/${repoData.name}`,
        githubUrl: repoData.html_url
      } : null);
    }
  };

  const handleGitUrlAdded = (gitUrl: string) => {
    // Reload project to get updated data
    loadProject();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar user={user} />
      
      <div className="flex">
        {/* Reserved space for future sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          {/* Placeholder for future sidebar */}
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-none mx-auto py-8 px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {project.title}
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">{project.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Created by {project.owner.name}</span>
                      <span>•</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      {project.gitRepo && (
                        <>
                          <span>•</span>
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <Github className="w-4 h-4" />
                            {project.gitRepo}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('github')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === 'github'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </button>
                  <button
                    onClick={() => setActiveTab('team')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === 'team'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Team
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="text-sm text-blue-600 font-medium">Created</p>
                              <p className="text-lg font-semibold text-blue-900">
                                {new Date(project.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Github className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="text-sm text-green-600 font-medium">Repository</p>
                              <p className="text-lg font-semibold text-green-900">
                                {project.gitRepo ? 'Connected' : 'Not Connected'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-purple-600" />
                            <div>
                              <p className="text-sm text-purple-600 font-medium">Owner</p>
                              <p className="text-lg font-semibold text-purple-900">
                                {project.owner.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Description</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {project.description || 'No description provided for this project.'}
                      </p>
                    </div>

                    {project.gitRepo && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">GitHub Repository</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Github className="w-5 h-5 text-gray-600" />
                              <span className="font-mono text-sm">{project.gitRepo}</span>
                            </div>
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              View on GitHub →
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'github' && (
                  <>
                    {project.gitRepo || project.githubUrl ? (
                      <GitHubRepositoryViewer
                        gitUrl={project.githubUrl || `https://github.com/${project.gitRepo}`}
                        projectName={project.title}
                      />
                    ) : (
                      <AddGitUrlForm
                        projectId={project._id}
                        onGitUrlAdded={handleGitUrlAdded}
                      />
                    )}
                  </>
                )}

                {activeTab === 'team' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {project.owner.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{project.owner.name}</p>
                            <p className="text-sm text-gray-500">{project.owner.email}</p>
                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">
                              Owner
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Coming Soon:</strong> Team management features including member invitations, 
                        role assignments, and collaboration tools.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
