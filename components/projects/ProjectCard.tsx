import React from 'react';

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
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
        <span className="text-xs text-gray-500">
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description || 'No description provided'}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {project.owner.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-700">{project.owner.name}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {project.collaborators.slice(0, 3).map((collaborator, index) => (
            <div
              key={index}
              className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs font-medium">
                {collaborator.name.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
          {project.collaborators.length > 3 && (
            <span className="text-xs text-gray-500 ml-1">
              +{project.collaborators.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};