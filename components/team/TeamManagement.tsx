import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, MoreHorizontal, Crown, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { apiService } from '../../lib/api';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'mentor' | 'employee';
  createdAt: string;
}

export const TeamManagement: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const users = await apiService.getUsers();
      setTeamMembers(users);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    // TODO: Implement invite functionality
    console.log('Inviting:', inviteEmail);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        <Button size="sm" onClick={() => setShowInviteModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Invite Member
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    {member.role === 'mentor' ? (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <User className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.role === 'mentor' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {member.role}
                </span>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Send Invite
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};