'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/auth';
import { apiService } from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Users, UserPlus, Mail, Trash2, Crown } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'mentor' | 'employee';
  createdAt: string;
  avatar?: string;
}

export default function TeamPage() {
  const [user, setUser] = useState(authService.getUser());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (user.role !== 'mentor') {
      router.push('/employee/dashboard');
      return;
    }
    
    loadTeamMembers();
  }, [user, router]);

  const loadTeamMembers = async () => {
    try {
      const members = await apiService.getAllUsers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      // This would send an invitation email
      // For now, we'll just show a success message
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      // This would remove the member from the team
      setTeamMembers(prev => prev.filter(member => member._id !== memberId));
      alert('Team member removed successfully');
    } catch (error) {
      console.error('Failed to remove team member:', error);
      alert('Failed to remove team member');
    }
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Team Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Manage your team members and invitations</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-6 h-6" />
                  <span className="text-lg font-semibold">{teamMembers.length} members</span>
                </div>
              </div>
            </div>

            {/* Invite New Member */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite New Member</h2>
              <form onSubmit={handleInviteMember} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
            </div>

            {/* Team Members List */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Members</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No team members yet</p>
                  <p className="text-gray-500">Invite members to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-lg">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{member.name}</h3>
                            {member.role === 'mentor' && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-gray-600">{member.email}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            Joined {new Date(member.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          member.role === 'mentor' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {member.role}
                        </span>
                        
                        {member.role === 'employee' && (
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
