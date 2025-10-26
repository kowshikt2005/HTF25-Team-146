import React, { useState } from 'react';
import { X, Edit, Trash2, Save, Users, MapPin, Clock } from 'lucide-react';

interface MeetingDetailModalProps {
  meeting: any;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  users: any[];
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  meeting,
  onClose,
  onUpdate,
  onDelete,
  users
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: meeting.title || '',
    description: meeting.description || '',
    location: meeting.location || '',
    notes: meeting.notes || ''
  });

  const handleSave = () => {
    onUpdate(meeting.id, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      onDelete(meeting.id);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Meeting' : 'Meeting Details'}
          </h2>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 p-2"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900">{meeting.title}</p>
            )}
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>
              {formatDate(meeting.start)} - {formatDate(meeting.end)}
            </span>
          </div>

          {/* Location */}
          {(meeting.location || isEditing) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Meeting location"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{meeting.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {(meeting.description || isEditing) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Meeting description"
                />
              ) : (
                <p className="text-gray-700">{meeting.description}</p>
              )}
            </div>
          )}

          {/* Attendees */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendees
              </label>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{meeting.attendees.length} attendees</span>
              </div>
              <div className="mt-2 space-y-1">
                {meeting.attendees.map((attendee: any, index: number) => (
                  <div key={index} className="text-sm text-gray-600">
                    {attendee.name} ({attendee.email})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agenda */}
          {meeting.agenda && meeting.agenda.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agenda
              </label>
              <ul className="list-disc list-inside space-y-1">
                {meeting.agenda.map((item: string, index: number) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Meeting notes"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {meeting.notes || 'No notes added yet.'}
              </p>
            )}
          </div>

          {/* Action Items */}
          {meeting.actionItems && meeting.actionItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Items
              </label>
              <div className="space-y-2">
                {meeting.actionItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {
                        const updatedItems = [...meeting.actionItems];
                        updatedItems[index].completed = !updatedItems[index].completed;
                        onUpdate(meeting.id, { actionItems: updatedItems });
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};