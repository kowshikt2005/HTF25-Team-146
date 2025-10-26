import { authService } from './auth';
import { processTasksForCompatibility, addBackwardCompatibility } from './taskUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (error) {
      // Handle network errors or JSON parsing errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running on http://localhost:5000');
      }
      throw error;
    }
  }

  // Projects
  async getProjects() {
    return this.request('/api/projects');
  }

  async createProject(projectData: {
    title: string;
    description: string;
    gitRepo?: string;
    collaborators?: string[];
  }) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  // Tasks
  async getTasks(projectId: string) {
    const tasks = await this.request(`/api/tasks/${projectId}`);
    return processTasksForCompatibility(tasks);
  }

  async createTask(taskData: {
    title: string;
    description: string;
    project: string;
    assignedTo?: string;
    priority: string;
    dueDate?: string;
  }) {
    const task = await this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
    return addBackwardCompatibility(task);
  }

  async updateTask(taskId: string, updates: {
    status?: string;
    description?: string;
  }) {
    const task = await this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return addBackwardCompatibility(task);
  }

  // Users
  async getUsers() {
    return this.request('/api/users');
  }
}

export const apiService = new ApiService();