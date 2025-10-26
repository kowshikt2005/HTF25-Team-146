import React from 'react';
import { Calendar, Users, GitBranch, MoreHorizontal } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  owner: {
    name: string;
    email: string;
  };
  collaborators: Array<{
    name: string;
    email: string;
  }>;
  createdAt: string;
  gitRepo?: string;
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const projectId = `PRJ-${project._id.slice(-4).toUpperCase()}`;
  
  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">{projectId}</span>
            {project.gitRepo && (
              <div className="flex items-center gap-1 text-gray-400">
                <GitBranch className="h-3 w-3" />
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {project.title}
          </h3>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
        {project.description || 'No description provided'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Owner */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {project.owner.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{project.owner.name}</span>
            <span className="text-xs text-gray-500">Owner</span>
          </div>
        </div>

        {/* Collaborators and Date */}
        <div className="flex items-center gap-4">
          {/* Collaborators */}
          {project.collaborators.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-400" />
              <div className="flex -space-x-1">
                {project.collaborators.slice(0, 3).map((collaborator, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center border-2 border-white"
                    title={collaborator.name}
                  >
                    <span className="text-white text-xs font-medium">
                      {collaborator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {project.collaborators.length > 3 && (
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-gray-600 text-xs font-medium">
                      +{project.collaborators.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">
              {new Date(project.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-100 transition-colors pointer-events-none" />
    </div>
  );
};