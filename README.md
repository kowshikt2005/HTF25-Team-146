# Collaborative Workspace System

A hackathon prototype for a multi-role collaborative project management system where mentors and employees can coordinate tasks, manage projects, and track progress in real-time.

## 🚀 Features

- **Role-Based Access Control**: Separate dashboards for mentors and employees
- **Project Management**: Mentors can create and manage projects
- **Kanban Task Board**: Drag-and-drop task management with status tracking
- **Real-time Updates**: Live task updates using Socket.IO
- **Priority System**: Color-coded task priorities (Low, Medium, High, Critical)
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 with TypeScript
- Tailwind CSS for styling
- Socket.IO client for real-time updates

**Backend:**
- Express.js with TypeScript
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT authentication
- bcryptjs for password hashing

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd my-collab-workspace
npm install
```

### 2. Environment Setup

Update `.env.local` with your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/collab-workspace?retryWrites=true&w=majority
JWT_SECRET=hackathon-jwt-secret-key-2024
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start the Backend Server

```bash
node server/index.js
```

The backend will run on http://localhost:5000

### 4. Start the Frontend (in a new terminal)

```bash
npm run dev
```

The frontend will run on http://localhost:3000

## 👥 User Roles

### Mentor
- Create and manage projects
- Create and assign tasks
- Set task priorities and due dates
- View all project tasks in Kanban board
- Track team progress

### Employee  
- View assigned projects
- Update task status (drag-and-drop)
- View task details and priorities
- Track personal progress

## 🎯 Demo Flow

1. **Register** as a Mentor or Employee at `/auth/register`
2. **Login** at `/auth/login`
3. **Mentor Flow**:
   - Create a new project from dashboard
   - Click on project to view Kanban board
   - Create tasks and assign priorities
   - Drag tasks between columns (To Do → In Progress → Done)
4. **Employee Flow**:
   - View assigned projects on dashboard
   - Click on project to see tasks
   - Update task status by dragging cards

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project (mentor only)

### Tasks
- `GET /api/tasks/:projectId` - Get project tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:taskId` - Update task status

## 🎨 UI Components

The project includes reusable UI components:
- `Button` - Primary, secondary, and outline variants
- `Input` - Form input with label and error handling
- `Select` - Dropdown select component
- `TaskCard` - Individual task display
- `KanbanColumn` - Drag-and-drop task columns
- `ProjectCard` - Project overview cards

## 🔄 Real-time Features

- Live task updates when status changes
- Real-time project creation notifications
- Socket.IO integration for instant updates

## 📱 Responsive Design

- Mobile-first approach
- Responsive Kanban board
- Touch-friendly drag-and-drop on mobile

## 🚧 Future Enhancements

- GitHub integration for commit tracking
- Google Calendar integration
- Email notifications
- Weekly automated reports
- File attachments
- Task comments and chat
- Advanced analytics dashboard

## 🏗️ Project Structure

```
my-collab-workspace/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── mentor/            # Mentor dashboard and project pages
│   └── employee/          # Employee dashboard and project pages
├── components/            # Reusable React components
│   ├── auth/             # Authentication forms
│   ├── kanban/           # Kanban board components
│   ├── layout/           # Layout components
│   ├── projects/         # Project management components
│   ├── tasks/            # Task management components
│   └── ui/               # Basic UI components
├── lib/                  # Utility libraries
│   ├── api.ts           # API service layer
│   └── auth.ts          # Authentication utilities
└── server/              # Express.js backend
    └── index.js         # Main server file
```

## 🎯 Hackathon Notes

This is a rapid prototype built for a one-day hackathon. The focus was on:
- Core functionality over polish
- Working MVP with essential features
- Clean, maintainable code structure
- Real-time collaboration features
- Role-based access control

## 📄 License

MIT License - Built for hackathon demonstration purposes.