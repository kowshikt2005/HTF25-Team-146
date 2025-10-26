# Database Setup Guide

## Quick Fix for MongoDB Connection Error

The error you're seeing indicates that the MongoDB Atlas connection is not working. Here are the steps to fix it:

## Option 1: Use Local MongoDB (Recommended for Development)

1. **Install MongoDB locally** (if not already installed):
   - **Windows**: Download from https://www.mongodb.com/try/download/community
   - **macOS**: `brew install mongodb-community`
   - **Linux**: Follow MongoDB installation guide for your distribution

2. **Start MongoDB service**:
   ```bash
   # Windows (run as administrator)
   net start MongoDB
   
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. **Update your `.env.local` file**:
   ```env
   # Comment out the Atlas connection
   # MONGODB_URI=mongodb+srv://hackathon-user:hackathon2024@cluster0.yxgyxsz.mongodb.net/collab-workspace?retryWrites=true&w=majority&appName=Cluster0
   
   # Use local MongoDB instead
   MONGODB_URI=mongodb://localhost:27017/collab-workspace
   
   JWT_SECRET=hackathon-jwt-secret-key-2024
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Seed the database**:
   ```bash
   npm run seed
   ```

## Option 2: Fix MongoDB Atlas Connection

If you prefer to use MongoDB Atlas:

1. **Create a new MongoDB Atlas cluster**:
   - Go to https://cloud.mongodb.com/
   - Create a free account
   - Create a new cluster
   - Create a database user
   - Whitelist your IP address (or use 0.0.0.0/0 for development)

2. **Update the connection string** in `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/collab-workspace?retryWrites=true&w=majority
   ```

3. **Seed the database**:
   ```bash
   npm run seed
   ```

## Starting the Application

1. **Start the backend server**:
   ```bash
   npm run server
   ```

2. **In a new terminal, start the frontend**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Demo Accounts

After seeding, you can use these accounts:

**Mentor Account:**
- Email: `mentor@demo.com`
- Password: `mentor123`

**Employee Accounts:**
- Email: `alice@demo.com` / Password: `employee123`
- Email: `bob@demo.com` / Password: `employee123`

## Troubleshooting

- **Port 27017 already in use**: Another MongoDB instance is running
- **Connection refused**: MongoDB service is not started
- **Authentication failed**: Check username/password in connection string
- **Network timeout**: Check firewall settings or use local MongoDB

The upgraded authentication system will work perfectly once the database connection is established!