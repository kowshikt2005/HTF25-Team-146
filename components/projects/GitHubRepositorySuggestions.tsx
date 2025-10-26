'use client';

import React from 'react';
import { Github, Star, GitFork } from 'lucide-react';

interface GitHubRepositorySuggestionsProps {
  onSelectRepository: (url: string) => void;
}

export const GitHubRepositorySuggestions: React.FC<GitHubRepositorySuggestionsProps> = ({
  onSelectRepository
}) => {
  const popularRepositories = [
    {
      name: 'facebook/react',
      description: 'The library for web and native user interfaces',
      stars: '228k',
      language: 'JavaScript'
    },
    {
      name: 'microsoft/vscode',
      description: 'Visual Studio Code',
      stars: '163k',
      language: 'TypeScript'
    },
    {
      name: 'vercel/next.js',
      description: 'The React Framework',
      stars: '125k',
      language: 'JavaScript'
    },
    {
      name: 'nodejs/node',
      description: 'Node.js JavaScript runtime',
      stars: '107k',
      language: 'JavaScript'
    },
    {
      name: 'tailwindlabs/tailwindcss',
      description: 'A utility-first CSS framework',
      stars: '82k',
      language: 'TypeScript'
    }
  ];

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Or try these popular repositories:</h4>
      <div className="grid grid-cols-1 gap-2">
        {popularRepositories.map((repo) => (
          <button
            key={repo.name}
            onClick={() => onSelectRepository(`https://github.com/${repo.name}`)}
            className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Github className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-sm text-gray-900">{repo.name}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{repo.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>{repo.stars}</span>
                  </div>
                  <span>{repo.language}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};