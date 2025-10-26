import React from 'react';
import { AlertTriangle, Clock, User } from 'lucide-react';

interface Conflict {
  userId: string;
  userName: string;
  conflictingMeeting: {
    title: string;
    start: Date;
    end: Date;
  };
}

interface ConflictDetectionProps {
  conflicts: Conflict[];
  onResolveConflict: (userId: string, action: 'reschedule' | 'proceed') => void;
}

export const ConflictDetection: React.FC<ConflictDetectionProps> = ({
  conflicts,
  onResolveConflict
}) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h3 className="text-lg font-semibold text-red-800">
          Scheduling Conflicts Detected
        </h3>
      </div>

      <p className="text-red-700 mb-4">
        The following attendees have conflicting meetings:
      </p>

      <div className="space-y-4">
        {conflicts.map((conflict, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">{conflict.userName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Conflicts with "{conflict.conflictingMeeting.title}" 
                    ({new Date(conflict.conflictingMeeting.start).toLocaleString()} - 
                    {new Date(conflict.conflictingMeeting.end).toLocaleString()})
                  </span>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onResolveConflict(conflict.userId, 'reschedule')}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => onResolveConflict(conflict.userId, 'proceed')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const detectConflicts = (newMeeting: any, existingMeetings: any[]): Conflict[] => {
  const conflicts: Conflict[] = [];
  const newStart = new Date(newMeeting.start);
  const newEnd = new Date(newMeeting.end);

  // Check each attendee for conflicts
  newMeeting.attendees?.forEach((attendeeId: string) => {
    existingMeetings.forEach(meeting => {
      if (meeting.attendees?.includes(attendeeId)) {
        const existingStart = new Date(meeting.start);
        const existingEnd = new Date(meeting.end);

        // Check for time overlap
        if (
          (newStart < existingEnd && newEnd > existingStart) ||
          (existingStart < newEnd && existingEnd > newStart)
        ) {
          conflicts.push({
            userId: attendeeId,
            userName: `User ${attendeeId}`, // You might want to get actual user name
            conflictingMeeting: {
              title: meeting.title,
              start: existingStart,
              end: existingEnd
            }
          });
        }
      }
    });
  });

  return conflicts;
};