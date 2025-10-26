'use client';

import React, { useState } from 'react';
import { Github, Plus, X, ExternalLink } from 'lucide-react';

interface AddGitUrlFormProps {
  projectId: string;
  onGitUrlAdded: (gitUrl: string) => void;
}

export const AddGitUrlForm: React.FC<AddGitUrlFormProps> = ({
  projectId,
  onGitUrlAdded
}) => {
  const [showForm, setShowForm] = useState(false);
  const [gitUrl, setGitUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gitUrl.trim()) {
      setError('Please enter a GitHub URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      // First validate the URL
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
      
      // Update project with Git URL
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
        onGitUrlAdded(gitUrl.trim());
        setShowForm(false);
        setGitUrl('');
      } else {
        const updateError = await updateResponse.json();
        setError(updateError.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error adding Git URL:', error);
      setError('Failed to add GitHub repository');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
        <div className="text-center">
          <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect GitHub Repository</h3>
          <p className="text-gray-600 mb-6">
            Add a GitHub repository URL to view comprehensive repository information, 
            commit history, contributors, and activity.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add GitHub Repository
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Github className="w-6 h-6 text-gray-800" />
          <h3 className="text-lg font-semibold text-gray-900">Add GitHub Repository</h3>
        </div>
        <button
          onClick={() => {
            setShowForm(false);
            setGitUrl('');
            setError(null);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter the full GitHub repository URL (e.g., https://github.com/facebook/react)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setGitUrl('');
              setError(null);
            }}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Validating...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Add Repository
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Repository overview with stats (stars, forks, issues)</li>
          <li>• Recent commits with author information</li>
          <li>• Branch and contributor information</li>
          <li>• Language breakdown and recent releases</li>
          <li>• 30-day activity and contribution insights</li>
        </ul>
      </div>
    </div>
  );
};