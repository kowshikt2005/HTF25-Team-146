'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '../../../../lib/auth';
import { Navbar } from '../../../../components/layout/Navbar';
import { KanbanBoard } from '../../../../components/kanban/KanbanBoard';
import { CreateTaskModal } from '../../../../components/tasks/CreateTaskModal';
import { Button } from '../../../../components/ui/Button';

export default function MentorProjectPage() {
  const [user, setUser] = useState(authService.getUser());
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
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
    // TODO: Open task detail modal
  };

  const handleTaskCreated = () => {
    // Refresh the kanban board
    window.location.reload();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Tasks</h1>
                <p className="text-gray-600">Manage tasks and track progress</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateTaskModal(true)}>
              Create New Task
            </Button>
          </div>

          <KanbanBoard
            projectId={projectId}
            onTaskClick={handleTaskClick}
          />
        </div>
      </div>

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
      />
    </div>
  );
}