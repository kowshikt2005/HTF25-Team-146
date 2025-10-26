'use client';

import React, { useState, useEffect } from 'react';
import { Github, GitBranch, GitCommit, GitPullRequest, Users, Plus, Settings } from 'lucide-react';

interface GitHubIntegrationProps {
  projectId: string;
  projectName: string;
  gitRepo?: string;
  onRepositoryCreated: (repoData: any) => void;
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  projectId,
  projectName,
  gitRepo,
  onRepositoryCreated
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repositoryData, setRepositoryData] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [repoForm, setRepoForm] = useState({
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    description: '',
    private: false
  });

  useEffect(() => {
    if (gitRepo) {
      setIsConnected(true);
      loadRepositoryData();
    }
  }, [gitRepo]);

  const loadRepositoryData = async () => {
    if (!gitRepo) return;

    try {
      setIsLoading(true);
      const [owner, repo] = gitRepo.split('/');
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const [repoResponse, activityResponse] = await Promise.all([
        fetch(`${API_URL}/api/github/repositories/${owner}/${repo}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/api/github/projects/${projectId}/activity`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (repoResponse.ok) {
        const repoData = await repoResponse.json();
        setRepositoryData(repoData.repository);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivity(activityData.activity);
      }
    } catch (error) {
      console.error('Failed to load repository data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/github/user/repositories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          repositoryName: repoForm.name,
          description: repoForm.description,
          isPrivate: repoForm.private
        })
      });

      if (response.ok) {
        const result = await response.json();
        setRepositoryData(result.repository);
        setIsConnected(true);
        setShowCreateRepo(false);
        onRepositoryCreated(result.repository);
        alert('Repository created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create repository: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create repository:', error);
      alert('Failed to create repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectPersonalGitHub = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/github/user/auth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        alert('Failed to initiate GitHub connection');
      }
    } catch (error) {
      console.error('Failed to connect personal GitHub:', error);
      alert('Failed to connect personal GitHub');
    }
  };

  const handleAddCollaborator = async () => {
    const username = prompt('Enter GitHub username to add as collaborator:');
    if (!username) return;

    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const [owner, repo] = gitRepo!.split('/');
      
      const response = await fetch(`${API_URL}/api/github/repositories/${owner}/${repo}/collaborators`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, permission: 'push' })
      });

      if (response.ok) {
        alert(`Collaborator ${username} added successfully!`);
        loadRepositoryData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Failed to add collaborator: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to add collaborator:', error);
      alert('Failed to add collaborator');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Github className="w-6 h-6 text-gray-800" />
          <h3 className="text-lg font-semibold text-gray-900">GitHub Integration</h3>
          {isConnected && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Connected
            </span>
          )}
        </div>
        {isConnected && (
          <button
            onClick={handleAddCollaborator}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Collaborator
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect this project to GitHub to enable version control, collaboration, and automated notifications.
          </p>
          
          {/* GitHub Account Connection Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Personal Account</h4>
              <p className="text-sm text-blue-700 mb-3">
                Create repositories in your personal GitHub account
              </p>
              <button
                onClick={handleConnectPersonalGitHub}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
              >
                Connect Personal GitHub
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Organization Account</h4>
              <p className="text-sm text-gray-600 mb-3">
                Create repositories in the organization account
              </p>
              <button
                onClick={() => setShowCreateRepo(true)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm"
              >
                Use Organization Account
              </button>
            </div>
          </div>
          
          {!showCreateRepo ? null : (
            <form onSubmit={handleCreateRepository} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repoForm.name}
                  onChange={(e) => setRepoForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={repoForm.description}
                  onChange={(e) => setRepoForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Project description"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={repoForm.private}
                  onChange={(e) => setRepoForm(prev => ({ ...prev, private: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="private" className="text-sm text-gray-700">
                  Private repository
                </label>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateRepo(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Repository'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Repository Info */}
          {repositoryData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{repositoryData.full_name}</h4>
                <a
                  href={repositoryData.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View on GitHub
                </a>
              </div>
              <p className="text-gray-600 text-sm mb-3">{repositoryData.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4" />
                  {repositoryData.default_branch}
                </span>
                <span className="flex items-center gap-1">
                  <GitCommit className="w-4 h-4" />
                  {repositoryData.size} KB
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {repositoryData.forks_count} forks
                </span>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {activity && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Recent Activity</h4>
              
              {/* Recent Commits */}
              {activity.commits && activity.commits.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <GitCommit className="w-4 h-4" />
                    Recent Commits
                  </h5>
                  <div className="space-y-2">
                    {activity.commits.slice(0, 3).map((commit: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{commit.commit.message}</p>
                          <p className="text-xs text-gray-500">
                            {commit.author.login} • {new Date(commit.commit.author.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Pull Requests */}
              {activity.pullRequests && activity.pullRequests.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4" />
                    Recent Pull Requests
                  </h5>
                  <div className="space-y-2">
                    {activity.pullRequests.slice(0, 3).map((pr: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                        <div className={`w-2 h-2 rounded-full ${
                          pr.state === 'open' ? 'bg-green-500' : 
                          pr.state === 'closed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{pr.title}</p>
                          <p className="text-xs text-gray-500">
                            #{pr.number} by {pr.user.login} • {new Date(pr.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Next Steps</h5>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Clone the repository to your local machine</li>
              <li>2. Add team members as collaborators</li>
              <li>3. Set up webhooks for real-time notifications</li>
              <li>4. Start collaborating on your project!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
