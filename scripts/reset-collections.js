const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env.local' });

// Define schemas to ensure collections exist with proper structure
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['mentor', 'employee'], required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  gitRepo: String,
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'review', 'done'], 
    default: 'todo' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  dueDate: Date,
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  tags: [{ type: String }],
  labels: [{
    name: String,
    color: String
  }],
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  dependencies: {
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    blocking: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  action: { 
    type: String, 
    enum: ['task_created', 'task_updated', 'task_deleted', 'user_joined', 'user_left', 'comment_added'],
    required: true 
  },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  metadata: {
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    field: String,
    description: String
  },
  timestamp: { type: Date, default: Date.now },
  sessionId: String
});

const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  socketId: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  userAgent: String,
  ipAddress: String
});

// Create models
const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);
const Activity = mongoose.model('Activity', activitySchema);
const UserSession = mongoose.model('UserSession', userSessionSchema);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-workspace');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function resetCollections() {
  try {
    console.log('🔄 Resetting database collections...');
    
    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
      console.log(`🗑️  Dropped collection: ${collection.name}`);
    }
    
    // Recreate collections with proper schemas and indexes
    console.log('\n📋 Creating fresh collections...');
    
    // Create collections by accessing them (this creates them with schemas)
    await User.createCollection();
    await Project.createCollection();
    await Task.createCollection();
    await Activity.createCollection();
    await UserSession.createCollection();
    
    // Ensure indexes
    await User.createIndexes();
    await Project.createIndexes();
    await Task.createIndexes();
    await Activity.createIndexes();
    await UserSession.createIndexes();
    
    console.log('✅ users collection created');
    console.log('✅ projects collection created');
    console.log('✅ tasks collection created');
    console.log('✅ activities collection created');
    console.log('✅ usersessions collection created');
    
    console.log('\n🎯 Database reset complete!');
    console.log('📝 All collections recreated with proper schemas');
    console.log('🔍 Indexes applied for optimal performance');
    
  } catch (error) {
    console.error('❌ Error resetting collections:', error);
  }
}

async function main() {
  await connectDB();
  await resetCollections();
  
  console.log('\n🚀 Ready to use!');
  console.log('1. Start server: node server/index.js');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Register users at /auth/register');
  
  await mongoose.connection.close();
  console.log('🔌 Connection closed');
}

main().catch(console.error);