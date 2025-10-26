const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-workspace')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas (same as in index.js)
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
  description: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

async function seedData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log('Cleared existing data');

    // Create demo users
    const mentorPassword = await bcrypt.hash('mentor123', 10);
    const employeePassword = await bcrypt.hash('employee123', 10);

    const mentor = new User({
      name: 'John Mentor',
      email: 'mentor@demo.com',
      password: mentorPassword,
      role: 'mentor',
      phone: '+1234567890'
    });

    const employee1 = new User({
      name: 'Alice Employee',
      email: 'alice@demo.com',
      password: employeePassword,
      role: 'employee',
      phone: '+1234567891'
    });

    const employee2 = new User({
      name: 'Bob Employee',
      email: 'bob@demo.com',
      password: employeePassword,
      role: 'employee',
      phone: '+1234567892'
    });

    await mentor.save();
    await employee1.save();
    await employee2.save();

    console.log('Created demo users');

    // Create demo project
    const project = new Project({
      title: 'Hackathon Demo Project',
      description: 'A sample project to demonstrate the collaborative workspace system',
      owner: mentor._id,
      collaborators: [employee1._id, employee2._id],
      gitRepo: 'https://github.com/demo/hackathon-project'
    });

    await project.save();
    console.log('Created demo project');

    // Create demo tasks
    const tasks = [
      {
        title: 'Setup project structure',
        description: 'Initialize the project with basic folder structure and dependencies',
        project: project._id,
        assignees: [employee1._id],
        createdBy: mentor._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'Design user interface',
        description: 'Create wireframes and mockups for the main user interface',
        project: project._id,
        assignees: [employee2._id],
        createdBy: mentor._id,
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        title: 'Implement authentication',
        description: 'Build login and registration functionality with JWT tokens',
        project: project._id,
        assignees: [employee1._id],
        createdBy: mentor._id,
        status: 'todo',
        priority: 'critical',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        title: 'Write API documentation',
        description: 'Document all API endpoints with examples and response formats',
        project: project._id,
        assignees: [employee2._id],
        createdBy: mentor._id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
      },
      {
        title: 'Setup database schema',
        description: 'Design and implement MongoDB schemas for users, projects, and tasks',
        project: project._id,
        assignees: [employee1._id],
        createdBy: mentor._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    ];

    for (const taskData of tasks) {
      const task = new Task(taskData);
      await task.save();
    }

    console.log('Created demo tasks');

    console.log('\n=== DEMO ACCOUNTS ===');
    console.log('Mentor Account:');
    console.log('  Email: mentor@demo.com');
    console.log('  Password: mentor123');
    console.log('\nEmployee Account 1:');
    console.log('  Email: alice@demo.com');
    console.log('  Password: employee123');
    console.log('\nEmployee Account 2:');
    console.log('  Email: bob@demo.com');
    console.log('  Password: employee123');
    console.log('\nDemo data seeded successfully!');
    console.log('You can now test the application at http://localhost:3000');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();