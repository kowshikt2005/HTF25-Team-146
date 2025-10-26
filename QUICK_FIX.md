# Quick Fix for Current Issues

## 🔧 Issues to Fix

### 1. Database Schema Mismatch
The error "Cannot populate path `assignedTo`" suggests there are still old tasks in the database with the old schema.

### 2. Hydration Mismatch
React hydration error due to server/client rendering differences.

## ✅ Quick Solution

### Step 1: Clear and Reseed Database
```bash
# Stop the server if running (Ctrl+C)

# Clear and reseed the database
npm run seed
```

### Step 2: Restart the Application
```bash
# Start the backend server
npm run server

# In a new terminal, start the frontend
npm run dev
```

### Step 3: Test with Fresh Data
- Go to http://localhost:3000
- Use the demo credentials:
  - **Mentor**: `mentor@demo.com` / `mentor123`
  - **Employee**: `alice@demo.com` / `employee123`

## 🔍 If Issues Persist

### Option A: Use Local MongoDB
1. **Update `.env.local`**:
   ```env
   # Use local MongoDB
   MONGODB_URI=mongodb://localhost:27017/collab-workspace
   JWT_SECRET=hackathon-jwt-secret-key-2024
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

2. **Install and start MongoDB locally**:
   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   
   # Windows - Download from MongoDB website
   # Linux - Follow MongoDB installation guide
   ```

3. **Seed the database**:
   ```bash
   npm run seed
   ```

### Option B: Reset Everything
If you want to start completely fresh:

1. **Delete node_modules and reinstall**:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Clear browser cache and storage**:
   - Open DevTools (F12)
   - Go to Application tab
   - Clear all storage for localhost:3000

3. **Restart everything**:
   ```bash
   npm run seed
   npm run server  # Terminal 1
   npm run dev     # Terminal 2
   ```

## 🎯 Expected Result
After following these steps:
- ✅ No schema errors
- ✅ No hydration errors  
- ✅ Beautiful auth system works
- ✅ Task creation/management works
- ✅ Demo accounts work perfectly

The issue is likely just old data in the database that needs to be cleared!