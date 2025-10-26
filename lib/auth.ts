export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'employee';
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'mentor' | 'employee';
    phone?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null; // Server-side check
    return localStorage.getItem('token');
  },

  setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null; // Server-side check
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};