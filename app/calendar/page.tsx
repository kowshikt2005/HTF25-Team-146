'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/auth';
import { apiService } from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { CalendarView } from '../../components/calendar/CalendarView';
import { ConflictDetection, detectConflicts } from '../../components/calendar/ConflictDetection';
import { GoogleCalendarIntegration } from '../../components/calendar/GoogleCalendarIntegration';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  attendees: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  agenda?: string[];
  location?: string;
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  actionItems?: Array<{
    id: string;
    description: string;
    assignedTo: string;
    dueDate: Date;
    completed: boolean;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function CalendarPage() {
  const [user, setUser] = useState(authService.getUser());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const [meetingsData, usersData] = await Promise.all([
        apiService.getMeetings(),
        apiService.getAllUsers()
      ]);
      
      setMeetings(meetingsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      // Detect conflicts before creating
      const detectedConflicts = detectConflicts(meetingData, meetings);
      
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
        return;
      }

      const newMeeting = await apiService.createMeeting(meetingData);
      setMeetings(prev => [...prev, newMeeting]);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const handleUpdateMeeting = async (id: string, updates: Partial<Meeting>) => {
    try {
      const updatedMeeting = await apiService.updateMeeting(id, updates);
      setMeetings(prev => 
        prev.map(meeting => 
          meeting.id === id ? updatedMeeting : meeting
        )
      );
    } catch (error) {
      console.error('Failed to update meeting:', error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await apiService.deleteMeeting(id);
      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
    } catch (error) {
      console.error('Failed to delete meeting:', error);
    }
  };

  const handleResolveConflict = (userId: string, action: 'reschedule' | 'proceed') => {
    if (action === 'proceed') {
      // Remove this user's conflicts and proceed
      setConflicts(prev => prev.filter(conflict => conflict.userId !== userId));
    } else {
      // Handle rescheduling logic
      console.log('Reschedule meeting for user:', userId);
    }
  };

  const handleMeetingsImported = (importedMeetings: any[]) => {
    // Add imported meetings to the existing meetings
    setMeetings(prev => [...prev, ...importedMeetings]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar user={user} />
      
      <div className="flex">
        {/* Reserved space for future sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          {/* Placeholder for future sidebar */}
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-none mx-auto py-8 px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Calendar & Meetings
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Schedule meetings and manage your calendar</p>
            </div>

            {/* Google Calendar Integration */}
            <div className="mb-8">
              <GoogleCalendarIntegration
                onMeetingsImported={handleMeetingsImported}
              />
            </div>

            {/* Conflict Detection */}
            {conflicts.length > 0 && (
              <div className="mb-8">
                <ConflictDetection
                  conflicts={conflicts}
                  onResolveConflict={handleResolveConflict}
                />
              </div>
            )}

            {/* Calendar View */}
            {loading ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-16">
                <div className="flex justify-center items-center">
                  <LoadingSpinner />
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl h-[800px]">
                <CalendarView
                  meetings={meetings}
                  onCreateMeeting={handleCreateMeeting}
                  onUpdateMeeting={handleUpdateMeeting}
                  onDeleteMeeting={handleDeleteMeeting}
                  users={users}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
