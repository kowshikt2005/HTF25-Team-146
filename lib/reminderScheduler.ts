const cron = require('node-cron');
const { emailService } = require('../lib/emailService');
const Meeting = require('../models/Meeting');

class ReminderScheduler {
  private scheduledJobs: Map<string, any> = new Map();

  constructor() {
    this.startScheduler();
  }

  // Start the main scheduler that runs every minute
  private startScheduler() {
    // Run every minute to check for upcoming meetings
    cron.schedule('* * * * *', async () => {
      await this.checkUpcomingMeetings();
    });

    console.log('Reminder scheduler started');
  }

  // Check for meetings that need reminders
  private async checkUpcomingMeetings() {
    try {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find meetings starting in the next hour
      const upcomingMeetings = await Meeting.find({
        start: {
          $gte: now,
          $lte: oneHourFromNow
        }
      }).populate('attendees', 'name email');

      for (const meeting of upcomingMeetings) {
        const meetingStart = new Date(meeting.start);
        const timeUntilStart = meetingStart.getTime() - now.getTime();
        const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));

        // Send 15-minute reminder
        if (minutesUntilStart <= 15 && minutesUntilStart > 14) {
          await this.sendReminders(meeting, '15-minute');
        }

        // Send 5-minute reminder
        if (minutesUntilStart <= 5 && minutesUntilStart > 4) {
          await this.sendReminders(meeting, '5-minute');
        }

        // Send starting now notification
        if (minutesUntilStart <= 0 && minutesUntilStart > -5) {
          await this.sendReminders(meeting, 'starting');
        }
      }

      // Check for overdue meetings (past due but not completed)
      const overdueMeetings = await Meeting.find({
        start: {
          $lt: now
        },
        status: { $ne: 'completed' }
      }).populate('attendees', 'name email');

      for (const meeting of overdueMeetings) {
        // Send overdue reminder (only once per meeting)
        if (!meeting.overdueReminderSent) {
          await this.sendReminders(meeting, 'overdue');
          meeting.overdueReminderSent = true;
          await meeting.save();
        }
      }

    } catch (error) {
      console.error('Error checking upcoming meetings:', error);
    }
  }

  // Send reminders to all attendees
  private async sendReminders(meeting: any, reminderType: string) {
    try {
      for (const attendee of meeting.attendees) {
        await emailService.sendMeetingReminder(meeting, attendee, reminderType);
        
        // Also send push notification if user has notifications enabled
        // This would require storing user notification preferences
        console.log(`Sent ${reminderType} reminder to ${attendee.email}`);
      }
    } catch (error) {
      console.error(`Error sending ${reminderType} reminders:`, error);
    }
  }

  // Schedule a specific reminder for a meeting
  scheduleMeetingReminder(meetingId: string, reminderTime: Date, reminderType: string) {
    const jobId = `meeting-${meetingId}-${reminderType}`;
    
    // Cancel existing job if it exists
    if (this.scheduledJobs.has(jobId)) {
      this.scheduledJobs.get(jobId).destroy();
    }

    // Schedule new reminder
    const job = cron.schedule(reminderTime, async () => {
      try {
        const meeting = await Meeting.findById(meetingId).populate('attendees', 'name email');
        if (meeting) {
          await this.sendReminders(meeting, reminderType);
        }
        this.scheduledJobs.delete(jobId);
      } catch (error) {
        console.error('Error in scheduled reminder:', error);
      }
    }, {
      scheduled: false
    });

    this.scheduledJobs.set(jobId, job);
    job.start();
  }

  // Cancel a scheduled reminder
  cancelMeetingReminder(meetingId: string, reminderType: string) {
    const jobId = `meeting-${meetingId}-${reminderType}`;
    
    if (this.scheduledJobs.has(jobId)) {
      this.scheduledJobs.get(jobId).destroy();
      this.scheduledJobs.delete(jobId);
    }
  }

  // Schedule reminders for a new meeting
  scheduleMeetingReminders(meeting: any) {
    const meetingStart = new Date(meeting.start);
    const now = new Date();

    // Schedule 15-minute reminder
    const fifteenMinReminder = new Date(meetingStart.getTime() - 15 * 60 * 1000);
    if (fifteenMinReminder > now) {
      this.scheduleMeetingReminder(meeting._id, fifteenMinReminder, '15-minute');
    }

    // Schedule 5-minute reminder
    const fiveMinReminder = new Date(meetingStart.getTime() - 5 * 60 * 1000);
    if (fiveMinReminder > now) {
      this.scheduleMeetingReminder(meeting._id, fiveMinReminder, '5-minute');
    }

    // Schedule starting notification
    if (meetingStart > now) {
      this.scheduleMeetingReminder(meeting._id, meetingStart, 'starting');
    }
  }

  // Update reminders when meeting is updated
  updateMeetingReminders(meeting: any) {
    // Cancel existing reminders
    this.cancelMeetingReminder(meeting._id, '15-minute');
    this.cancelMeetingReminder(meeting._id, '5-minute');
    this.cancelMeetingReminder(meeting._id, 'starting');

    // Schedule new reminders
    this.scheduleMeetingReminders(meeting);
  }

  // Cancel all reminders for a meeting
  cancelAllMeetingReminders(meetingId: string) {
    this.cancelMeetingReminder(meetingId, '15-minute');
    this.cancelMeetingReminder(meetingId, '5-minute');
    this.cancelMeetingReminder(meetingId, 'starting');
  }

  // Get all scheduled jobs (for debugging)
  getScheduledJobs() {
    return Array.from(this.scheduledJobs.keys());
  }
}

export const reminderScheduler = new ReminderScheduler();
