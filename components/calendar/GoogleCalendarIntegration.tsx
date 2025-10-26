import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';

interface GoogleCalendarIntegrationProps {
  onMeetingsImported: (meetings: any[]) => void;
}

export const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  onMeetingsImported
}) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Calendar Integration</h3>
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Available</span>
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">
          Calendar integration is available. You can create and manage meetings directly in the calendar.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Coming Soon:</strong> Google Calendar sync and GitHub integration for project management.
          </p>
        </div>
      </div>
    </div>
  );
};