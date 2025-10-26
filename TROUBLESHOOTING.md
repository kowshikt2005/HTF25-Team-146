# Troubleshooting Guide

## 🚨 Current Issues & Solutions

### Issue 1: "Cannot populate path `assignedTo`" Error

**Cause**: Old tasks in database with outdated schema

**Solution**:
```bash
# Clear and reseed database
npm run seed

# Restart server
npm run server
```

### Issue 2: Hydration Mismatch Error

**Cause**: Server/client rendering differences

**Solutions**:

1. **Clear browser cache**:
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"

2. **Restart development server**:
   ```bash
   # Stop both servers (Ctrl+C)
   npm run server  # Terminal 1
   npm run dev     # Terminal 2
   ```

### Issue 3: MongoDB Connection Error

**Cause**: Database not accessible

**Solutions**:

**Option A - Local MongoDB**:
```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or download from mongodb.com for Windows

# Start MongoDB
brew services start mongodb-community  # macOS
net start MongoDB  # Windows (as admin)

# Update .env.local
MONGODB_URI=mongodb://localhost:27017/collab-workspace
```

**Option B - MongoDB Atlas**:
1. Create account at https://cloud.mongodb.com
2. Create cluster and database user
3. Whitelist IP (0.0.0.0/0 for development)
4. Update connection string in `.env.local`

## 🔄 Complete Reset Process

If all else fails, here's a complete reset:

### Step 1: Stop Everything
```bash
# Stop all running processes (Ctrl+C in terminals)
```

### Step 2: Clean Installation
```bash
# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Step 3: Database Setup
```bash
# Make sure MongoDB is running (local or Atlas)
# Then seed the database
npm run seed
```

### Step 4: Clear Browser Data
- Open DevTools (F12)
- Application tab → Storage → Clear site data
- Or use incognito/private browsing

### Step 5: Restart Application
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend  
npm run dev
```

### Step 6: Test
- Go to http://localhost:3000
- Try demo accounts:
  - Mentor: `mentor@demo.com` / `mentor123`
  - Employee: `alice@demo.com` / `employee123`

## 🎯 Expected Working State

When everything is working correctly:

1. **Landing Page**: Beautiful gradient background with auth options
2. **Login/Register**: Modern forms with demo credential buttons
3. **Dashboard**: Role-based dashboards load correctly
4. **Task Management**: Create, view, and manage tasks without errors
5. **Real-time Updates**: Socket.IO connections work

## 📞 Quick Health Check

Run these commands to verify everything is working:

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"  # Should return { ok: 1 }

# Check if backend is running
curl http://localhost:5000/api/health  # Should return server status

# Check if frontend is running
curl http://localhost:3000  # Should return HTML
```

## 🔧 Common Port Issues

If ports are in use:

```bash
# Kill processes on ports
npx kill-port 3000 5000 27017

# Or change ports in package.json and .env.local
```

The upgraded authentication system is solid - these are just setup/database issues that are easily resolved!