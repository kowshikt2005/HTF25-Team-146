const nodemailer = require('nodemailer');

class EmailService {
  private transporter: any;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // You can use other services like Outlook, SendGrid, etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use app password for Gmail
      }
    });
  }

  // Send meeting reminder email
  async sendMeetingReminder(meeting: any, attendee: any, reminderType: 'upcoming' | 'starting' | 'overdue') {
    try {
      const subject = this.getReminderSubject(meeting.title, reminderType);
      const html = this.generateReminderEmail(meeting, attendee, reminderType);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: attendee.email,
        subject: subject,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Meeting reminder sent to ${attendee.email}`);
    } catch (error) {
      console.error('Error sending meeting reminder:', error);
      throw error;
    }
  }

  // Send meeting invitation email
  async sendMeetingInvitation(meeting: any, attendee: any) {
    try {
      const subject = `Meeting Invitation: ${meeting.title}`;
      const html = this.generateInvitationEmail(meeting, attendee);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: attendee.email,
        subject: subject,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Meeting invitation sent to ${attendee.email}`);
    } catch (error) {
      console.error('Error sending meeting invitation:', error);
      throw error;
    }
  }

  // Send meeting update email
  async sendMeetingUpdate(meeting: any, attendee: any, changes: string[]) {
    try {
      const subject = `Meeting Updated: ${meeting.title}`;
      const html = this.generateUpdateEmail(meeting, attendee, changes);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: attendee.email,
        subject: subject,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Meeting update sent to ${attendee.email}`);
    } catch (error) {
      console.error('Error sending meeting update:', error);
      throw error;
    }
  }

  private getReminderSubject(title: string, type: string): string {
    switch (type) {
      case 'upcoming':
        return `Reminder: Meeting "${title}" starts soon`;
      case 'starting':
        return `Meeting "${title}" is starting now`;
      case 'overdue':
        return `Overdue: Meeting "${title}" was scheduled`;
      default:
        return `Meeting Reminder: ${title}`;
    }
  }

  private generateReminderEmail(meeting: any, attendee: any, type: string): string {
    const startTime = new Date(meeting.start).toLocaleString();
    const endTime = new Date(meeting.end).toLocaleString();
    const location = meeting.location || 'No location specified';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .meeting-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Reminder</h1>
          </div>
          <div class="content">
            <p>Hello ${attendee.name},</p>
            <p>This is a reminder about your upcoming meeting:</p>
            
            <div class="meeting-details">
              <h3>${meeting.title}</h3>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Location:</strong> ${location}</p>
              ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
              ${meeting.agenda && meeting.agenda.length > 0 ? `
                <p><strong>Agenda:</strong></p>
                <ul>
                  ${meeting.agenda.map((item: string) => `<li>${item}</li>`).join('')}
                </ul>
              ` : ''}
            </div>

            <p>Please make sure you're prepared for this meeting.</p>
            
            <a href="${process.env.FRONTEND_URL}/calendar" class="button">View Calendar</a>
          </div>
          <div class="footer">
            <p>This is an automated message from your Collaborative Workspace.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateInvitationEmail(meeting: any, attendee: any): string {
    const startTime = new Date(meeting.start).toLocaleString();
    const endTime = new Date(meeting.end).toLocaleString();
    const location = meeting.location || 'No location specified';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .meeting-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Invitation</h1>
          </div>
          <div class="content">
            <p>Hello ${attendee.name},</p>
            <p>You have been invited to a meeting:</p>
            
            <div class="meeting-details">
              <h3>${meeting.title}</h3>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Location:</strong> ${location}</p>
              ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
              ${meeting.agenda && meeting.agenda.length > 0 ? `
                <p><strong>Agenda:</strong></p>
                <ul>
                  ${meeting.agenda.map((item: string) => `<li>${item}</li>`).join('')}
                </ul>
              ` : ''}
            </div>

            <p>Please confirm your attendance and add this to your calendar.</p>
            
            <a href="${process.env.FRONTEND_URL}/calendar" class="button">View Calendar</a>
          </div>
          <div class="footer">
            <p>This is an automated message from your Collaborative Workspace.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateUpdateEmail(meeting: any, attendee: any, changes: string[]): string {
    const startTime = new Date(meeting.start).toLocaleString();
    const endTime = new Date(meeting.end).toLocaleString();
    const location = meeting.location || 'No location specified';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .meeting-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .changes { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Updated</h1>
          </div>
          <div class="content">
            <p>Hello ${attendee.name},</p>
            <p>The following meeting has been updated:</p>
            
            <div class="meeting-details">
              <h3>${meeting.title}</h3>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Location:</strong> ${location}</p>
              ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
            </div>

            <div class="changes">
              <h4>Changes Made:</h4>
              <ul>
                ${changes.map(change => `<li>${change}</li>`).join('')}
              </ul>
            </div>

            <p>Please update your calendar accordingly.</p>
            
            <a href="${process.env.FRONTEND_URL}/calendar" class="button">View Updated Calendar</a>
          </div>
          <div class="footer">
            <p>This is an automated message from your Collaborative Workspace.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
