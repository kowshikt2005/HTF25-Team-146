import React from 'react';
import { Calendar, Users, GitBranch, TrendingUp, Clock, CheckCircle } from 'lucide-react';

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

interface ProjectOverviewProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projects,
  onProjectClick
}) => {
  const totalProjects = projects.length;
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Project Overview</h3>
        <TrendingUp className="h-5 w-5 text-gray-400" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-900">{totalProjects}</div>
          <div className="text-sm text-blue-700">Total Projects</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-900">
            {projects.reduce((acc, p) => acc + p.collaborators.length, 0)}
          </div>
          <div className="text-sm text-green-700">Team Members</div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Projects</h4>
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => onProjectClick(project._id)}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-gray-900 truncate">
                  {project.title}
                </h5>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>{project.collaborators.length}</span>
                  </div>
                  {project.gitRepo && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <GitBranch className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex -space-x-1">
                {project.collaborators.slice(0, 3).map((collaborator, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white"
                    title={collaborator.name}
                  >
                    <span className="text-white text-xs font-medium">
                      {collaborator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {project.collaborators.length > 3 && (
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs font-medium">
                      +{project.collaborators.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalProjects > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all {totalProjects} projects →
          </button>
        </div>
      )}
    </div>
  );
};