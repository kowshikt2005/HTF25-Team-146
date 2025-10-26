const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    require('dotenv').config({ path: '.env.local' });
    
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    );
  }

  // Generate OAuth2 URL for user authentication
  generateAuthUrl(state: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state,
      prompt: 'select_account',
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

  // Get user info from Google
  async getUserInfo(tokens: any): Promise<any> {
    try {
      this.oauth2Client.setCredentials(tokens);
      
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      
      return data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  // Check if tokens have calendar permissions
  hasCalendarPermissions(tokens: any): boolean {
    if (!tokens || !tokens.scope) return false;
    
    const scopes = tokens.scope.split(' ');
    return scopes.includes('https://www.googleapis.com/auth/calendar') ||
           scopes.includes('https://www.googleapis.com/auth/calendar.events');
  }
}

export const googleAuthService = new GoogleAuthService();
