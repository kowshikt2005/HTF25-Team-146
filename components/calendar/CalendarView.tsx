import React, { useState } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CreateMeetingModal } from './CreateMeetingModal';
import { MeetingDetailModal } from './MeetingDetailModal';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  meetings: any[];
  onCreateMeeting: (meeting: any) => void;
  onUpdateMeeting: (id: string, updates: any) => void;
  onDeleteMeeting: (id: string) => void;
  users: any[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  meetings,
  onCreateMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  users
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [view, setView] = useState<View>('month');

  const events = meetings.map(meeting => ({
    id: meeting.id,
    title: meeting.title,
    start: new Date(meeting.start),
    end: new Date(meeting.end),
    resource: meeting
  }));

  const handleSelectSlot = ({ start, end }: any) => {
    setSelectedSlot({ start, end });
    setShowCreateModal(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedMeeting(event.resource);
  };

  return (
    <div className="h-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Calendar</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          New Meeting
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        view={view}
        onView={setView}
        views={['month', 'week', 'day']}
      />

      {showCreateModal && (
        <CreateMeetingModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSlot(null);
          }}
          onCreateMeeting={onCreateMeeting}
          users={users}
          initialSlot={selectedSlot}
        />
      )}

      {selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onUpdate={onUpdateMeeting}
          onDelete={onDeleteMeeting}
          users={users}
        />
      )}
    </div>
  );
};