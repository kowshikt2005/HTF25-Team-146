'use client';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class NotificationService {
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'Notification' in window;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return { granted: false, denied: true, default: false };
    }

    const permission = await Notification.requestPermission();
    
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  // Check if notifications are supported and permitted
  async canNotify(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    const permission = await this.requestPermission();
    return permission.granted;
  }

  // Send a notification
  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!(await this.canNotify())) {
      console.warn('Notifications not permitted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  // Send meeting reminder notification
  async sendMeetingReminder(meeting: {
    title: string;
    start: Date;
    end: Date;
    location?: string;
  }): Promise<void> {
    const startTime = new Date(meeting.start).toLocaleTimeString();
    const title = `Meeting Reminder: ${meeting.title}`;
    const body = `Starts at ${startTime}${meeting.location ? ` at ${meeting.location}` : ''}`;

    await this.sendNotification(title, {
      body,
      tag: `meeting-${meeting.title}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Calendar'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }

  // Send meeting starting notification
  async sendMeetingStarting(meeting: {
    title: string;
    location?: string;
  }): Promise<void> {
    const title = `Meeting Starting: ${meeting.title}`;
    const body = `Your meeting is starting now${meeting.location ? ` at ${meeting.location}` : ''}`;

    await this.sendNotification(title, {
      body,
      tag: `meeting-starting-${meeting.title}`,
      requireInteraction: true,
      actions: [
        {
          action: 'join',
          title: 'Join Meeting'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }

  // Send task reminder notification
  async sendTaskReminder(task: {
    title: string;
    dueDate?: Date;
    priority: string;
  }): Promise<void> {
    const title = `Task Reminder: ${task.title}`;
    const body = task.dueDate 
      ? `Due: ${new Date(task.dueDate).toLocaleString()}`
      : `Priority: ${task.priority}`;

    await this.sendNotification(title, {
      body,
      tag: `task-${task.title}`,
      requireInteraction: true
    });
  }

  // Send general notification
  async sendGeneralNotification(title: string, message: string): Promise<void> {
    await this.sendNotification(title, {
      body: message,
      tag: 'general'
    });
  }

  // Schedule a notification for a specific time
  scheduleNotification(
    title: string, 
    options: NotificationOptions, 
    scheduledTime: Date
  ): void {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(async () => {
        await this.sendNotification(title, options);
      }, delay);
    }
  }

  // Schedule meeting reminder
  scheduleMeetingReminder(
    meeting: {
      title: string;
      start: Date;
      end: Date;
      location?: string;
    },
    reminderMinutes: number = 15
  ): void {
    const reminderTime = new Date(meeting.start.getTime() - (reminderMinutes * 60 * 1000));
    
    this.scheduleNotification(
      `Meeting Reminder: ${meeting.title}`,
      {
        body: `Your meeting starts in ${reminderMinutes} minutes`,
        tag: `meeting-reminder-${meeting.title}`,
        requireInteraction: true
      },
      reminderTime
    );
  }
}

export const notificationService = new NotificationService();
