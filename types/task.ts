export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  assignees: User[];
  createdBy: User;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Backward compatibility - computed property
  assignedTo?: User;
}

export interface CreateTaskData {
  title: string;
  description: string;
  project: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
}