const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor() {
    // Ensure environment variables are loaded
    require('dotenv').config({ path: '.env.local' });
    
    console.log('Initializing Google Calendar Service...');
    console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing');
    console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback');
    
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    );
    
    this.calendar = google.calendar({ version: 'v3' });
  }

  // Generate OAuth2 URL for user authorization
  generateAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    console.log('Generating auth URL with client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI);

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId, // Pass user ID in state for callback
      prompt: 'select_account', // This forces account selection every time
      include_granted_scopes: true
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  // Set user's tokens
  setUserTokens(tokens: any): void {
    this.oauth2Client.setCredentials(tokens);
  }

  // Create event in Google Calendar
  async createEvent(eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: Array<{ email: string }>;
    location?: string;
    recurrence?: string[];
  }): Promise<any> {
    try {
      const response = await this.calendar.events.insert({
        auth: this.oauth2Client,
        calendarId: 'primary',
        resource: eventData
      });

      return response.data;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }

  // Update event in Google Calendar
  async updateEvent(eventId: string, eventData: any): Promise<any> {
    try {
      const response = await this.calendar.events.update({
        auth: this.oauth2Client,
        calendarId: 'primary',
        eventId: eventId,
        resource: eventData
      });

      return response.data;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw error;
    }
  }

  // Delete event from Google Calendar
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        auth: this.oauth2Client,
        calendarId: 'primary',
        eventId: eventId
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw error;
    }
  }

  // Get events from Google Calendar
  async getEvents(timeMin?: string, timeMax?: string): Promise<any[]> {
    try {
      const response = await this.calendar.events.list({
        auth: this.oauth2Client,
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error getting Google Calendar events:', error);
      throw error;
    }
  }

  // Sync meeting to Google Calendar
  async syncMeetingToGoogle(meeting: any): Promise<any> {
    const eventData = {
      summary: meeting.title,
      description: meeting.description || '',
      start: {
        dateTime: new Date(meeting.start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(meeting.end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: meeting.attendees?.map((attendee: any) => ({
        email: attendee.email
      })) || [],
      location: meeting.location || '',
      recurrence: meeting.isRecurring && meeting.recurringPattern ? 
        this.generateRecurrenceRule(meeting.recurringPattern) : undefined
    };

    return this.createEvent(eventData);
  }

  // Generate recurrence rule for Google Calendar
  private generateRecurrenceRule(pattern: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  }): string[] {
    const { frequency, interval, endDate } = pattern;
    
    let rule = `RRULE:FREQ=${frequency.toUpperCase()}`;
    if (interval > 1) {
      rule += `;INTERVAL=${interval}`;
    }
    if (endDate) {
      rule += `;UNTIL=${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    }
    
    return [rule];
  }

  // Convert Google Calendar event to our meeting format
  convertGoogleEventToMeeting(googleEvent: any): any {
    return {
      id: googleEvent.id,
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description || '',
      start: new Date(googleEvent.start.dateTime || googleEvent.start.date),
      end: new Date(googleEvent.end.dateTime || googleEvent.end.date),
      location: googleEvent.location || '',
      attendees: googleEvent.attendees?.map((attendee: any) => ({
        email: attendee.email,
        name: attendee.displayName || attendee.email
      })) || [],
      googleEventId: googleEvent.id,
      isGoogleEvent: true
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();
