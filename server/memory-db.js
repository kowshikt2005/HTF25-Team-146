// Quick in-memory database for demo purposes
let users = [];
let projects = [];
let tasks = [];
let nextId = 1;

const memoryDB = {
  // Users
  createUser: (userData) => {
    const user = { ...userData, _id: (nextId++).toString(), createdAt: new Date() };
    users.push(user);
    return user;
  },
  
  findUserByEmail: (email) => users.find(u => u.email === email),
  
  findUserById: (id) => users.find(u => u._id === id),

  // Projects
  createProject: (projectData) => {
    const project = { ...projectData, _id: (nextId++).toString(), createdAt: new Date() };
    projects.push(project);
    return project;
  },
  
  findProjectsByOwner: (ownerId) => projects.filter(p => p.owner === ownerId),
  
  findProjectsByCollaborator: (userId) => projects.filter(p => 
    p.collaborators.includes(userId) || p.owner === userId
  ),

  // Tasks
  createTask: (taskData) => {
    const task = { ...taskData, _id: (nextId++).toString(), createdAt: new Date(), updatedAt: new Date() };
    tasks.push(task);
    return task;
  },
  
  findTasksByProject: (projectId) => tasks.filter(t => t.project === projectId),
  
  updateTask: (taskId, updates) => {
    const taskIndex = tasks.findIndex(t => t._id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date() };
      return tasks[taskIndex];
    }
    return null;
  },

  // Utility
  clear: () => {
    users = [];
    projects = [];
    tasks = [];
    nextId = 1;
  }
};

module.exports = memoryDB;