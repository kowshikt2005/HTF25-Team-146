'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Users, Github, GitBranch, GitCommit, Star, 
  Eye, GitFork, AlertCircle, ExternalLink, User, Clock,
  Code, Tag, Activity, TrendingUp, Plus
} from 'lucide-react';
import { GitHubRepositorySuggestions } from './GitHubRepositorySuggestions';

interface Project {
  _id: string;
  title: string;
  description: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  collaborators: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
  gitRepo?: string;
  githubUrl?: string;
}

interface ProjectDetailsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

const AddGitHubUrlForm: React.FC<{ projectId: string; onSuccess: () => void }> = ({ projectId, onSuccess }) => {
  const [gitUrl, setGitUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for external URL updates
  useEffect(() => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target && target.type === 'url') {
        setGitUrl(target.value);
      }
    };

    document.addEventListener('input', handleInput);
    return () => document.removeEventListener('input', handleInput);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitUrl.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      // Validate URL
      const validateResponse = await fetch(`${API_URL}/api/github-viewer/validate-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gitUrl: gitUrl.trim() })
      });
      
      const validateResult = await validateResponse.json();
      
      if (!validateResult.valid) {
        setError(validateResult.error || 'Invalid GitHub URL');
        return;
      }
      
      // Update project
      const updateResponse = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          gitRepo: `${validateResult.owner}/${validateResult.repo}`,
          githubUrl: gitUrl.trim()
        })
      });
      
      if (updateResponse.ok) {
        onSuccess();
        setGitUrl('');
      } else {
        const updateError = await updateResponse.json();
        setError(updateError.error || 'Failed to update project');
      }
    } catch (error) {
      setError('Failed to add GitHub repository');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="url"
          value={gitUrl}
          onChange={(e) => setGitUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </form>
  );
};

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose
}) => {
  const [githubData, setGithubData] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'project' | 'github' | 'activity'>('project');

  useEffect(() => {
    if (isOpen && (project.gitRepo || project.githubUrl)) {
      loadGithubData();
    }
  }, [isOpen, project.gitRepo, project.githubUrl]);

  const loadGithubData = async () => {
    if (!project.gitRepo && !project.githubUrl) return;

    try {
      setGithubLoading(true);
      setGithubError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const gitUrl = project.githubUrl || `https://github.com/${project.gitRepo}`;
      
      const response = await fetch(`${API_URL}/api/github-viewer/repository-info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gitUrl })
      });

      if (response.ok) {
        const result = await response.json();
        setGithubData(result.data);
      } else {
        const error = await response.json();
        setGithubError(error.error || 'Failed to load GitHub data');
      }
    } catch (error) {
      console.error('Failed to load GitHub data:', error);
      setGithubError('Failed to load GitHub data');
    } finally {
      setGithubLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#239120',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33'
    };
    return colors[language] || '#6b7280';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
              <p className="text-gray-500">PRJ-{project._id.slice(-4).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('project')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'project'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Details
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
              Repository
            </button>
            {githubData && (
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <GitCommit className="w-4 h-4" />
                Commits
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'project' && (
            <div className="space-y-6">
              {/* Project Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                      <Users className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-green-600 font-medium">Team Size</p>
                        <p className="text-lg font-semibold text-green-900">
                          {project.collaborators.length + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Github className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Repository</p>
                        <p className="text-lg font-semibold text-purple-900">
                          {project.gitRepo ? 'Connected' : 'Not Connected'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Description</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {project.description || 'No description provided for this project.'}
                </p>
              </div>

              {/* Team Members */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Team Members</h4>
                <div className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold">
                        {project.owner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{project.owner.name}</p>
                      <p className="text-sm text-gray-500">{project.owner.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Owner
                    </span>
                  </div>

                  {/* Collaborators */}
                  {project.collaborators.map((collaborator) => (
                    <div key={collaborator._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{collaborator.name}</p>
                        <p className="text-sm text-gray-500">{collaborator.email}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        Collaborator
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Timeline */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-6">
              {githubLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600">Loading GitHub data...</span>
                </div>
              ) : githubError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">Repository Connection Issue</h3>
                      <div className="text-sm text-red-700 whitespace-pre-line mb-4">
                        {githubError}
                      </div>
                      
                      {(project.gitRepo || project.githubUrl) && (
                        <div className="bg-white rounded-lg p-3 border border-red-200 mb-4">
                          <p className="text-sm text-gray-600 mb-2">Current repository:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {project.gitRepo || 'Repository URL configured'}
                            </code>
                            {(project.githubUrl || project.gitRepo) && (
                              <a
                                href={project.githubUrl || `https://github.com/${project.gitRepo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-sm text-red-700">Try adding a different repository:</p>
                          <button
                            onClick={async () => {
                              // Quick fix: try with Facebook React repository
                              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                              const token = localStorage.getItem('token');
                              
                              try {
                                const response = await fetch(`${API_URL}/api/projects/${project._id}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ 
                                    gitRepo: 'facebook/react',
                                    githubUrl: 'https://github.com/facebook/react'
                                  })
                                });
                                
                                if (response.ok) {
                                  loadGithubData();
                                }
                              } catch (error) {
                                console.error('Quick fix failed:', error);
                              }
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                          >
                            Quick Fix: Use React Repo
                          </button>
                        </div>
                        <AddGitHubUrlForm projectId={project._id} onSuccess={loadGithubData} />
                        <GitHubRepositorySuggestions 
                          onSelectRepository={(url) => {
                            // Auto-fill the form with selected repository
                            const event = new Event('input', { bubbles: true });
                            const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                            if (input) {
                              input.value = url;
                              input.dispatchEvent(event);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : githubData ? (
                <>
                  {/* Repository Header */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                          <Github className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{githubData.repository.fullName}</h3>
                          <p className="text-gray-600">{githubData.repository.description}</p>
                        </div>
                      </div>
                      <a
                        href={githubData.repository.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on GitHub
                      </a>
                    </div>
                    
                    {/* Basic Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center bg-white rounded-lg p-3">
                        <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                          <Star className="w-4 h-4" />
                          <span className="font-semibold">{githubData.repository.stars.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">Stars</p>
                      </div>
                      <div className="text-center bg-white rounded-lg p-3">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <GitFork className="w-4 h-4" />
                          <span className="font-semibold">{githubData.repository.forks.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">Forks</p>
                      </div>
                      <div className="text-center bg-white rounded-lg p-3">
                        <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                          <Code className="w-4 h-4" />
                          <span className="font-semibold">{githubData.repository.language || 'Mixed'}</span>
                        </div>
                        <p className="text-xs text-gray-500">Language</p>
                      </div>
                    </div>
                  </div>

                  {/* README Section */}
                  {githubData.readme && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">README</h4>
                        <a
                          href={githubData.readme.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on GitHub
                        </a>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                          {githubData.readme.content.substring(0, 2000)}
                          {githubData.readme.content.length > 2000 && (
                            <span className="text-gray-500">
                              ... (truncated, view full README on GitHub)
                            </span>
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Github className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect GitHub Repository</h3>
                  <p className="text-gray-500 mb-6">Add a GitHub repository to track commits, view README, and manage your project code.</p>
                  <AddGitHubUrlForm projectId={project._id} onSuccess={loadGithubData} />
                  
                  {/* Quick Setup Options */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Or try these popular repositories:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        { name: 'React', url: 'https://github.com/facebook/react', desc: 'JavaScript Library' },
                        { name: 'Vue.js', url: 'https://github.com/vuejs/vue', desc: 'Progressive Framework' },
                        { name: 'Node.js', url: 'https://github.com/nodejs/node', desc: 'JavaScript Runtime' }
                      ].map((repo) => (
                        <button
                          key={repo.name}
                          onClick={async () => {
                            try {
                              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                              const token = localStorage.getItem('token');
                              
                              const response = await fetch(`${API_URL}/api/projects/${project._id}`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ 
                                  gitRepo: repo.url.replace('https://github.com/', ''),
                                  githubUrl: repo.url
                                })
                              });
                              
                              if (response.ok) {
                                loadGithubData();
                              }
                            } catch (error) {
                              console.error('Failed to set repository:', error);
                            }
                          }}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                        >
                          <div className="font-medium">{repo.name}</div>
                          <div className="text-xs text-gray-500">{repo.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <GitHubRepositorySuggestions 
                      onSelectRepository={(url) => {
                        const event = new Event('input', { bubbles: true });
                        const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                        if (input) {
                          input.value = url;
                          input.dispatchEvent(event);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && githubData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Commit History</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {githubData.commits.length} recent commits
                </span>
              </div>
              
              <div className="space-y-3">
                {githubData.commits.map((commit: any, index: number) => (
                  <div key={commit.sha} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    {/* Commit Number */}
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    
                    {/* Author Avatar */}
                    {commit.author.avatarUrl ? (
                      <img
                        src={commit.author.avatarUrl}
                        alt={commit.author.name}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    
                    {/* Commit Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2 leading-tight">
                            {commit.message}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-medium text-blue-600">
                              {commit.author.name}
                            </span>
                            <span>committed</span>
                            <span className="font-medium">
                              {formatRelativeTime(commit.author.date)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                            {commit.sha.substring(0, 7)}
                          </code>
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View commit on GitHub"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {githubData.commits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <GitCommit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No commits found in this repository</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};