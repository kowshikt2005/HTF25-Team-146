const { google } = require('googleapis');

class GoogleCalendarService {
  constructor() {
    // Ensure environment variables are loaded
    require('dotenv').config({ path: '.env.local' });
    
    console.log('Initializing Google Calendar Service...');
    console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing');
    console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback');
    
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    );
    
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  generateAuthUrl(userId) {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    console.log('Generating auth URL with client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI);

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId, // Pass user ID for callback
      prompt: 'select_account', // This forces account selection every time
      include_granted_scopes: true
    });
  }

  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  setUserTokens(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  async syncMeetingToGoogle(meeting) {
    const event = {
      summary: meeting.title,
      description: meeting.description,
      location: meeting.location,
      start: {
        dateTime: meeting.start.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: meeting.end.toISOString(),
        timeZone: 'UTC',
      },
      attendees: meeting.attendees.map(attendee => ({
        email: attendee.email
      }))
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.data;
  }

  async getEvents(timeMin, timeMax) {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  convertGoogleEventToMeeting(googleEvent) {
    return {
      title: googleEvent.summary,
      description: googleEvent.description,
      start: new Date(googleEvent.start.dateTime || googleEvent.start.date),
      end: new Date(googleEvent.end.dateTime || googleEvent.end.date),
      location: googleEvent.location,
      googleEventId: googleEvent.id,
      isGoogleEvent: true
    };
  }
}

const googleCalendarService = new GoogleCalendarService();

module.exports = { googleCalendarService };