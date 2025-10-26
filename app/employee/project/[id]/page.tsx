'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '../../../../lib/auth';
import { Navbar } from '../../../../components/layout/Navbar';
import { KanbanBoard } from '../../../../components/kanban/KanbanBoard';
import { TaskDetailModal } from '../../../../components/tasks/TaskDetailModal';

export default function EmployeeProjectPage() {
  const [user, setUser] = useState(authService.getUser());
  const [selectedTask, setSelectedTask] = useState(null);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    if (!user || user.role !== 'employee') {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
              <p className="text-gray-600">View and update your assigned tasks</p>
            </div>
          </div>

          <KanbanBoard
            projectId={projectId}
            onTaskClick={handleTaskClick}
          />
        </div>
      </div>

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        canEdit={false}
      />
    </div>
  );
}