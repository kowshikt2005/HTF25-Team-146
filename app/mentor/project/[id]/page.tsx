'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '../../../../lib/auth';
import { Navbar } from '../../../../components/layout/Navbar';
import { KanbanBoard } from '../../../../components/kanban/KanbanBoard';
import { ListView } from '../../../../components/views/ListView';
import { CreateTaskModal } from '../../../../components/tasks/CreateTaskModal';
import { TaskDetailModal } from '../../../../components/tasks/TaskDetailModal';
import { ProjectHeader } from '../../../../components/layout/ProjectHeader';
import { useAppStore } from '../../../../lib/store';
import { apiService } from '../../../../lib/api';
import { useSocket } from '../../../../hooks/useSocket';

type ViewType = 'kanban' | 'list' | 'calendar' | 'timeline';

export default function MentorProjectPage() {
  const [user, setUser] = useState<any>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  const { tasks, setTasks, isLoading, setLoading } = useAppStore();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    // Get user data on client side only
    const userData = authService.getUser();
    setUser(userData);
    
    if (!userData || userData.role !== 'mentor') {
      router.push('/auth/login');
      return;
    }
    
    // Load tasks when component mounts
    loadTasks();
  }, [router, projectId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await apiService.getTasks(projectId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get socket data for real-time features
  const { activeUsers } = useSocket(projectId);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  const handleTaskCreated = () => {
    // Reload tasks instead of full page refresh
    loadTasks();
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      await apiService.updateTask(taskId, updates);
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      
      <ProjectHeader
        title="Work items"
        onBack={() => router.push('/mentor/dashboard')}
        onCreateTask={() => setShowCreateTaskModal(true)}
        onToggleFilters={() => {}}
        currentView={currentView}
        onViewChange={setCurrentView}
        activeUsers={activeUsers}
        currentUserId={user?.id}
      />

      {/* Main Content Area - Full Height */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'kanban' ? (
          <div className="h-full">
            <KanbanBoard
              projectId={projectId}
              onTaskClick={handleTaskClick}
              onAddTask={() => setShowCreateTaskModal(true)}
            />
          </div>
        ) : currentView === 'list' ? (
          <div className="h-full p-6">
            <ListView
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onTaskUpdate={handleTaskUpdate}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
              </h3>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
      />

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        canEdit={user?.role === 'mentor'}
      />
    </div>
  );
}