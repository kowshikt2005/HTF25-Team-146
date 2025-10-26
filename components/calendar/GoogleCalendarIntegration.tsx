import React, { useState, useEffect } from 'react';
import { Calendar, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleCalendarIntegrationProps {
  onMeetingsImported: (meetings: any[]) => void;
}

export const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  onMeetingsImported
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'syncing' | 'importing'>('idle');

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/calendar/google/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const { connected } = await response.json();
        setIsConnected(connected);
      }
    } catch (error) {
      console.error('Failed to check Google Calendar status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setStatus('connecting');
    
    try {
      // Get OAuth URL from backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/calendar/google/auth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      
      const { authUrl } = await response.json();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
      setStatus('idle');
      setIsLoading(false);
    }
  };

  const handleSyncToGoogle = async () => {
    setIsLoading(true);
    setStatus('syncing');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/calendar/google/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setStatus('idle');
        // Show success message
      }
    } catch (error) {
      console.error('Failed to sync to Google Calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromGoogle = async () => {
    setIsLoading(true);
    setStatus('importing');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/calendar/google/import`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const importedMeetings = await response.json();
        onMeetingsImported(importedMeetings);
        setStatus('idle');
      }
    } catch (error) {
      console.error('Failed to import from Google Calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Google Calendar Integration</h3>
        {isConnected && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Connected</span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Google Calendar is not connected. Sign in with Google to enable calendar integration.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Sign out and sign back in using "Sign in with Google" to connect your calendar automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleSyncToGoogle}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {status === 'syncing' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            ) : (
              <Upload className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm font-medium">
              {status === 'syncing' ? 'Syncing...' : 'Sync to Google'}
            </span>
          </button>

          <button
            onClick={handleImportFromGoogle}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {status === 'importing' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
            ) : (
              <Download className="w-4 h-4 text-green-600" />
            )}
            <span className="text-sm font-medium">
              {status === 'importing' ? 'Importing...' : 'Import from Google'}
            </span>
          </button>
        </div>
      )}

      {!isConnected && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-800">
              <strong>New!</strong> Google Calendar now connects automatically when you sign in with Google. No separate setup needed!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};