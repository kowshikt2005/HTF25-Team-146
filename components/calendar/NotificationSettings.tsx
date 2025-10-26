'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Bell, Mail, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { notificationService } from '../../lib/notificationService';

interface NotificationSettingsProps {
  userId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const [settings, setSettings] = useState({
    emailReminders: true,
    pushNotifications: false,
    reminderMinutes: [15, 5],
    emailFrequency: 'all',
    meetingReminders: true,
    taskReminders: true,
    systemNotifications: true
  });

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, []);

  const loadSettings = async () => {
    try {
      // Load user notification settings from API
      // const userSettings = await apiService.getNotificationSettings(userId);
      // setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const checkNotificationPermission = async () => {
    const permission = await notificationService.requestPermission();
    setPermissionStatus(permission.granted ? 'granted' : permission.denied ? 'denied' : 'default');
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReminderMinutesChange = (minutes: number, checked: boolean) => {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        reminderMinutes: [...prev.reminderMinutes, minutes]
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        reminderMinutes: prev.reminderMinutes.filter(m => m !== minutes)
      }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      // Save settings to API
      // await apiService.updateNotificationSettings(userId, settings);
      
      // Test notification if enabled
      if (settings.pushNotifications && permissionStatus === 'granted') {
        await notificationService.sendGeneralNotification(
          'Settings Updated',
          'Your notification settings have been saved successfully!'
        );
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    await checkNotificationPermission();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Push Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
                disabled={permissionStatus === 'denied'}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {permissionStatus === 'denied' && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Notifications are blocked. Please enable them in your browser settings.</span>
            </div>
          )}
          
          {permissionStatus === 'default' && (
            <div className="flex items-center space-x-2 text-yellow-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Click to enable notifications</span>
              <Button
                size="sm"
                onClick={handleRequestPermission}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enable
              </Button>
            </div>
          )}
          
          {permissionStatus === 'granted' && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Notifications are enabled</span>
            </div>
          )}
        </div>

        {/* Email Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Email Reminders</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailReminders}
                onChange={(e) => handleSettingChange('emailReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Reminder Timing */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Reminder Timing (minutes before meeting)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[60, 30, 15, 5].map((minutes) => (
              <label key={minutes} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.reminderMinutes.includes(minutes)}
                  onChange={(e) => handleReminderMinutesChange(minutes, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{minutes}m</span>
              </label>
            ))}
          </div>
        </div>

        {/* Email Frequency */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Email Frequency
          </label>
          <Select
            value={settings.emailFrequency}
            onChange={(value) => handleSettingChange('emailFrequency', value)}
            options={[
              { value: 'all', label: 'All notifications' },
              { value: 'important', label: 'Important only' },
              { value: 'daily', label: 'Daily digest' },
              { value: 'weekly', label: 'Weekly digest' }
            ]}
          />
        </div>

        {/* Notification Types */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Notification Types
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.meetingReminders}
                onChange={(e) => handleSettingChange('meetingReminders', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Meeting reminders</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.taskReminders}
                onChange={(e) => handleSettingChange('taskReminders', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Task reminders</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.systemNotifications}
                onChange={(e) => handleSettingChange('systemNotifications', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">System notifications</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
