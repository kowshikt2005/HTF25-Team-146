'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '../../../../lib/auth';
import { Navbar } from '../../../../components/layout/Navbar';
import { KanbanBoard } from '../../../../components/kanban/KanbanBoard';
import { CreateTaskModal } from '../../../../components/tasks/CreateTaskModal';
import { TaskDetailModal } from '../../../../components/tasks/TaskDetailModal';
import { TaskPeekOverview } from '../../../../components/tasks/TaskPeekOverview';
import { TaskFilters } from '../../../../components/views/TaskFilters';
import { ProjectAnalytics } from '../../../../components/analytics/ProjectAnalytics';
import { ProjectHeader } from '../../../../components/layout/ProjectHeader';
import { Breadcrumb } from '../../../../components/ui/Breadcrumb';
import { Button } from '../../../../components/ui/Button';
import { ClientOnly } from '../../../../components/ui/ClientOnly';

type ViewType = 'kanban' | 'list' | 'calendar' | 'timeline';

export default function MentorProjectPage() {
  const [user, setUser] = useState(authService.getUser());
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [peekTask, setPeekTask] = useState(null);
  const [filters, setFilters] = useState({});
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    if (!user || user.role !== 'mentor') {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  const handleTaskCreated = () => {
    // Refresh the kanban board
    window.location.reload();
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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <ProjectHeader
        title="Work items"
        onBack={() => router.push('/mentor/dashboard')}
        onCreateTask={() => setShowCreateTaskModal(true)}
        onToggleFilters={() => {}}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Full Width Kanban Board */}
      <div className="h-[calc(100vh-120px)]">
        <KanbanBoard
          projectId={projectId}
          onTaskClick={handleTaskClick}
          onAddTask={() => setShowCreateTaskModal(true)}
        />
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
        canEdit={true}
      />

      <TaskPeekOverview
        isOpen={!!peekTask}
        onClose={() => setPeekTask(null)}
        onOpenFull={() => {
          setSelectedTask(peekTask);
          setPeekTask(null);
        }}
        task={peekTask}
        canEdit={true}
      />
    </div>
  );
}