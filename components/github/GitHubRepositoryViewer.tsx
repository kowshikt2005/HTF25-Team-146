'use client';

import React, { useState, useEffect } from 'react';
import { 
  Github, GitBranch, GitCommit, GitPullRequest, Users, Star, 
  Eye, GitFork, Calendar, Code, Tag, AlertCircle, ExternalLink,
  Activity, TrendingUp, Clock, User
} from 'lucide-react';

interface GitHubRepositoryViewerProps {
  gitUrl: string;
  projectName: string;
}

export const GitHubRepositoryViewer: React.FC<GitHubRepositoryViewerProps> = ({
  gitUrl,
  projectName
}) => {
  const [repoData, setRepoData] = useState<any>(null);
  const [commitActivity, setCommitActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'activity'>('overview');

  useEffect(() => {
    if (gitUrl) {
      loadRepositoryData();
    }
  }, [gitUrl]);

  const loadRepositoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const [repoResponse, activityResponse] = await Promise.all([
        fetch(`${API_URL}/api/github-viewer/repository-info`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ gitUrl })
        }),
        fetch(`${API_URL}/api/github-viewer/commit-activity`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ gitUrl })
        })
      ]);

      if (repoResponse.ok) {
        const repoResult = await repoResponse.json();
        setRepoData(repoResult.data);
      } else {
        const repoError = await repoResponse.json();
        throw new Error(repoError.error || 'Failed to fetch repository data');
      }

      if (activityResponse.ok) {
        const activityResult = await activityResponse.json();
        setCommitActivity(activityResult.data);
      }
    } catch (error) {
      console.error('Failed to load repository data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load repository data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
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

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading repository information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Failed to load repository</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!repoData) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
        <div className="text-center text-gray-500">
          <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No repository data available</p>
        </div>
      </div>
    );
  }

  const { repository, commits, branches, contributors, releases, languages, issues, pullRequests } = repoData;

  return (
    <div className="space-y-6">
      {/* Repository Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Github className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{repository.name}</h2>
                {repository.isPrivate && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Private
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">{repository.description || 'No description available'}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {repository.owner.login}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(repository.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated {formatRelativeTime(repository.updatedAt)}
                </span>
              </div>
            </div>
          </div>
          <a
            href={repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
        </div>

        {/* Repository Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="font-semibold">{repository.stars.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Stars</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <GitFork className="w-4 h-4" />
              <span className="font-semibold">{repository.forks.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Forks</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Eye className="w-4 h-4" />
              <span className="font-semibold">{repository.watchers.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Watchers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">{repository.openIssues.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Issues</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
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
              onClick={() => setActiveTab('commits')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'commits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              Recent Commits
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              Activity
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Languages */}
              {Object.keys(languages).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(languages).map(([language, bytes]) => {
                      const total = Object.values(languages).reduce((sum: number, b: any) => sum + b, 0);
                      const percentage = ((bytes as number) / total * 100).toFixed(1);
                      return (
                        <div
                          key={language}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getLanguageColor(language) }}
                          ></div>
                          <span className="text-sm font-medium">{language}</span>
                          <span className="text-xs text-gray-500">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Branches */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Branches ({branches.length})</h3>
                <div className="space-y-2">
                  {branches.slice(0, 5).map((branch: any) => (
                    <div key={branch.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <GitBranch className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{branch.name}</span>
                        {branch.name === repository.defaultBranch && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {branch.protected && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Protected
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributors */}
              {contributors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contributors.slice(0, 6).map((contributor: any) => (
                      <div key={contributor.login} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={contributor.avatarUrl}
                          alt={contributor.login}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{contributor.login}</p>
                          <p className="text-sm text-gray-500">{contributor.contributions} contributions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Releases */}
              {releases.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Releases</h3>
                  <div className="space-y-3">
                    {releases.slice(0, 3).map((release: any) => (
                      <div key={release.tagName} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">{release.name || release.tagName}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(release.publishedAt)}
                          </span>
                        </div>
                        {release.body && (
                          <p className="text-sm text-gray-600 line-clamp-2">{release.body}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'commits' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Commits</h3>
              <div className="space-y-3">
                {commits.map((commit: any) => (
                  <div key={commit.sha} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {commit.author.avatarUrl ? (
                          <img
                            src={commit.author.avatarUrl}
                            alt={commit.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 mb-1">{commit.message}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{commit.author.name}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(commit.author.date)}</span>
                            <span>•</span>
                            <code className="px-2 py-1 bg-gray-200 rounded text-xs">
                              {commit.sha.substring(0, 7)}
                            </code>
                          </div>
                        </div>
                      </div>
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && commitActivity && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 30 Days Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <GitCommit className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Commits</p>
                        <p className="text-2xl font-bold text-blue-900">{commitActivity.totalCommits}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-green-600 font-medium">Active Contributors</p>
                        <p className="text-2xl font-bold text-green-900">{commitActivity.topContributors.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Active Days</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {Object.keys(commitActivity.commitsByDate).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Contributors */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Top Contributors (Last 30 Days)</h4>
                <div className="space-y-2">
                  {commitActivity.topContributors.map((contributor: any, index: number) => (
                    <div key={contributor.login || contributor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        {contributor.avatarUrl ? (
                          <img
                            src={contributor.avatarUrl}
                            alt={contributor.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <span className="font-medium">{contributor.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{contributor.commits} commits</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};