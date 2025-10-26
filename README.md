# Collaborative Workspace

A modern project management platform with GitHub integration, Google Calendar sync, and real-time collaboration features.

## Features

- **Project Management**: Create and manage projects with team collaboration
- **GitHub Integration**: Connect repositories, view commits, and track activity
- **Google Calendar**: Schedule meetings and sync with your calendar
- **Real-time Updates**: Live notifications and activity tracking
- **Team Collaboration**: Invite members and manage permissions

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and update the values:
```bash
cp .env.example .env.local
```

### 3. Start the Application
```bash
# Start backend server
npm run server

# Start frontend (in another terminal)
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# Google Integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub Integration (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Integrations**: GitHub API, Google Calendar API

## Usage

1. **Sign up** with Google account
2. **Create projects** and invite team members
3. **Connect GitHub repositories** to track code activity
4. **Schedule meetings** with integrated calendar
5. **Collaborate** in real-time with your team

## Scripts

```bash
npm run dev          # Start frontend development server
npm run server       # Start backend server
npm run build        # Build for production
npm start           # Start production server
```

---

Built for seamless team collaboration and project management.