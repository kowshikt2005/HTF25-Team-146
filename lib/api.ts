import { authService } from './auth';

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
    return this.request(`/api/tasks/${projectId}`);
  }

  async createTask(taskData: {
    title: string;
    description: string;
    project: string;
    assignedTo?: string;
    priority: string;
    dueDate?: string;
  }) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(taskId: string, updates: {
    status?: string;
    description?: string;
  }) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
}

export const apiService = new ApiService();