# 🚀 Complete Setup and Run Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

## 📋 Step-by-Step Setup

### 1. Navigate to Project Directory
```bash
cd HTF25-Team-146
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Update the `.env.local` file with your MongoDB Atlas connection string:

```env
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/collab-workspace?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret Key (keep this secure in production)
JWT_SECRET=hackathon-jwt-secret-key-2024

# API URL for frontend to connect to backend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**To get your MongoDB Atlas connection string:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster if you don't have one
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<password>` with your database password

### 4. Start the Backend Server
**Terminal 1 (Backend):**
```bash
cd HTF25-Team-146
node server/index.js
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

### 5. Start the Frontend Development Server
**Terminal 2 (Frontend):**
```bash
cd HTF25-Team-146
npm run dev
```

You should see:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.1s
```

## 🌐 Access the Application

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000

## 👥 User Registration

Since we've removed the seed data dependency, you'll need to create real user accounts:

### Create a Mentor Account
1. Go to http://localhost:3000
2. Click "Register" or navigate to `/auth/register`
3. Fill in the form:
   - **Name**: Your name
   - **Email**: your-email@example.com
   - **Password**: your-password
   - **Role**: Select "Mentor"
   - **Phone**: (optional)
4. Click "Register"

### Create Employee Accounts
1. Register additional users with **Role**: "Employee"
2. These users can be assigned to tasks by mentors

## 🎯 Testing the Features

### 1. Kanban Board
- Create a new project (mentors only)
- Add work items using the "+" button
- Drag and drop tasks between columns:
  - **Backlog** → **In Progress** → **Review** → **Done**
- Assign tasks to team members

### 2. List View
- Click the "List" button in the header
- Sort by clicking column headers
- Select multiple tasks for bulk operations
- Switch back to "Board" view anytime

### 3. Real-time Collaboration
- Open the same project in multiple browser tabs/windows
- Make changes in one tab and see them instantly in others
- See active users indicator in the project header

### 4. User Management
- Mentors can create projects and assign tasks
- Employees can view assigned projects and update task status
- Real-time notifications for task assignments and updates

## 🔧 Available Commands

### Development
```bash
# Start frontend development server
npm run dev

# Start backend server
npm run server

# Run both (if you have concurrently installed)
npm run dev:all
```

### Production
```bash
# Build the frontend
npm run build

# Start production frontend
npm start

# Backend (same command)
node server/index.js
```

### Database
```bash
# Seed demo data (optional - not needed for real users)
npm run seed
```

## 📱 Mobile Testing

The application is fully responsive. Test on mobile by:
1. Opening http://localhost:3000 on your mobile device
2. Or using browser dev tools to simulate mobile devices

## 🔍 Troubleshooting

### Common Issues

#### 1. "Cannot connect to MongoDB"
- Check your MongoDB Atlas connection string in `.env.local`
- Ensure your IP address is whitelisted in MongoDB Atlas
- Verify your database password is correct

#### 2. "CORS Error"
- Make sure backend is running on port 5000
- Check that `NEXT_PUBLIC_API_URL=http://localhost:5000` in `.env.local`

#### 3. "Socket.IO Connection Failed"
- Ensure backend server is running
- Check browser console for connection errors
- Verify firewall isn't blocking port 5000

#### 4. "Tasks not loading"
- Check browser network tab for API errors
- Verify you're logged in with correct role
- Check backend console for error messages

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
DEBUG=socket.io:*
NODE_ENV=development
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secure-jwt-secret
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NODE_ENV=production
```

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: Railway, Render, or AWS EC2
- **Database**: MongoDB Atlas (already cloud-based)

## 📊 Features Overview

### ✅ Implemented Features
- **Full-screen Kanban board** with 4 columns (Backlog, In Progress, Review, Done)
- **List view** with sorting, filtering, and bulk operations
- **Real-time collaboration** with Socket.IO
- **User presence indicators** showing active collaborators
- **Responsive design** for mobile and desktop
- **Real user management** (no seed data dependency)
- **Activity tracking** stored in MongoDB Atlas
- **Optimistic updates** with rollback on errors
- **Enhanced task properties** (assignees, priorities, due dates)

### 🔄 Real-time Features
- Live task updates across all connected users
- User join/leave notifications
- Active user presence indicators
- Instant drag-and-drop synchronization
- Real-time activity logging

### 📱 Mobile Features
- Touch-friendly drag and drop
- Responsive Kanban columns
- Mobile-optimized list view
- Adaptive navigation

## 🎉 Success!

If everything is working correctly, you should see:
1. ✅ Backend server running on port 5000
2. ✅ Frontend accessible at http://localhost:3000
3. ✅ User registration and login working
4. ✅ Real-time updates between browser tabs
5. ✅ Smooth drag-and-drop in Kanban board
6. ✅ List view with sorting and filtering
7. ✅ Mobile-responsive design

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MongoDB Atlas is properly configured
4. Check browser console and backend logs for errors

The application is now production-ready with comprehensive real-time collaboration features!