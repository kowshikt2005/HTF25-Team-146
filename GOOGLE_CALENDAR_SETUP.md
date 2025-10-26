# Google Calendar Integration Setup Guide

This guide will help you set up Google Calendar integration for your collaborative workspace application.

## Prerequisites

1. A Google Cloud Platform account
2. Access to Google Cloud Console
3. Your application running locally or deployed

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your Project ID

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add the following redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Click "Create"
6. Download the JSON file and note down:
   - Client ID
   - Client Secret

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Google Calendar Integration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# JWT Secret (if not already set)
JWT_SECRET=your_jwt_secret_here

# MongoDB URI (if not already set)
MONGODB_URI=mongodb://localhost:27017/collab-workspace
```

## Step 5: Install Required Dependencies

The following packages should already be installed:
- `googleapis`
- `google-auth-library`

If not, install them:
```bash
npm install googleapis google-auth-library
```

## Step 6: Database Schema Updates

The meeting schema has been updated to include Google Calendar integration fields:

```javascript
// Meeting Schema includes:
{
  googleEventId: String, // Google Calendar event ID
  isGoogleEvent: Boolean, // Whether this is imported from Google
  // ... other fields
}
```

## Step 7: Test the Integration

1. Start your server: `npm run dev`
2. Navigate to the Calendar page
3. Click "Connect Google Calendar"
4. Complete the OAuth flow
5. Test syncing meetings to Google Calendar
6. Test importing events from Google Calendar

## Features Available

### ✅ Implemented Features

1. **OAuth 2.0 Authentication**: Secure connection to Google Calendar
2. **Meeting Sync**: Export meetings to Google Calendar
3. **Event Import**: Import existing Google Calendar events
4. **Conflict Detection**: Detect scheduling conflicts
5. **Recurring Meetings**: Support for recurring meeting patterns
6. **Real-time Updates**: Socket.IO integration for live updates

### 🔄 Meeting Management

- Create meetings with agenda
- Edit meeting details
- Add meeting notes
- Track action items
- Delete meetings
- Recurring meeting support

### 📅 Calendar Views

- Month view
- Week view  
- Day view
- Event details modal
- Meeting creation modal

## API Endpoints

### Meeting Management
- `POST /api/meetings` - Create meeting
- `GET /api/meetings` - Get user's meetings
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Google Calendar Integration
- `GET /api/calendar/google/auth` - Get OAuth URL
- `POST /api/calendar/google/callback` - Handle OAuth callback
- `POST /api/calendar/google/sync/:meetingId` - Sync meeting to Google
- `GET /api/calendar/google/import` - Import events from Google

## Troubleshooting

### Common Issues

1. **OAuth Error**: Check redirect URI matches exactly
2. **API Quota Exceeded**: Google Calendar API has usage limits
3. **Permission Denied**: Ensure proper scopes are requested
4. **Token Expired**: Implement token refresh logic

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are set
3. Test API endpoints with Postman/curl
4. Check Google Cloud Console for API usage

## Security Considerations

1. Store OAuth tokens securely (encrypted in database)
2. Implement token refresh mechanism
3. Use HTTPS in production
4. Validate all user inputs
5. Implement rate limiting

## Next Steps

1. **Email Notifications**: Send meeting reminders via email
2. **Push Notifications**: Browser push notifications for meetings
3. **Outlook Integration**: Add Microsoft Outlook calendar support
4. **Meeting Analytics**: Track meeting attendance and duration
5. **AI Integration**: Auto-generate meeting summaries

## Support

If you encounter issues:
1. Check the console logs
2. Verify your Google Cloud configuration
3. Ensure all environment variables are set correctly
4. Test with a fresh Google account

For additional help, refer to:
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
