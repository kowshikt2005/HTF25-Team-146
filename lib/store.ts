import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'employee';
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: {
    name: string;
    email: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  dueDate?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  owner: {
    name: string;
    email: string;
  };
  collaborators: Array<{
    name: string;
    email: string;
  }>;
  createdAt: string;
  gitRepo?: string;
}

interface AppState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  
  // Tasks State
  tasks: Task[];
  selectedTask: Task | null;
  
  // Projects State
  projects: Project[];
  currentProject: Project | null;
  
  // UI State
  isLoading: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>;
  
  // Actions
  setUser: (user: User | null) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setSelectedTask: (task: Task | null) => void;
  
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  setCurrentProject: (project: Project | null) => void;
  
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  
  // Optimistic Updates
  optimisticUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        isAuthenticated: false,
        tasks: [],
        selectedTask: null,
        projects: [],
        currentProject: null,
        isLoading: false,
        notifications: [],
        
        // Auth Actions
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user 
        }, false, 'setUser'),
        
        // Task Actions
        setTasks: (tasks) => set({ tasks }, false, 'setTasks'),
        
        updateTask: (taskId, updates) => set((state) => ({
          tasks: state.tasks.map(task =>
            task._id === taskId ? { ...task, ...updates } : task
          )
        }), false, 'updateTask'),
        
        addTask: (task) => set((state) => ({
          tasks: [...state.tasks, task]
        }), false, 'addTask'),
        
        removeTask: (taskId) => set((state) => ({
          tasks: state.tasks.filter(task => task._id !== taskId)
        }), false, 'removeTask'),
        
        setSelectedTask: (task) => set({ selectedTask: task }, false, 'setSelectedTask'),
        
        // Project Actions
        setProjects: (projects) => set({ projects }, false, 'setProjects'),
        
        addProject: (project) => set((state) => ({
          projects: [...state.projects, project]
        }), false, 'addProject'),
        
        setCurrentProject: (project) => set({ currentProject: project }, false, 'setCurrentProject'),
        
        // UI Actions
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        
        addNotification: (notification) => set((state) => ({
          notifications: [...state.notifications, {
            ...notification,
            id: Date.now().toString(),
            timestamp: Date.now()
          }]
        }), false, 'addNotification'),
        
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }), false, 'removeNotification'),
        
        // Optimistic Updates
        optimisticUpdateTask: async (taskId, updates) => {
          const originalTask = get().tasks.find(t => t._id === taskId);
          if (!originalTask) return;
          
          // Optimistic update
          get().updateTask(taskId, updates);
          
          try {
            // API call would go here
            // await apiService.updateTask(taskId, updates);
            get().addNotification({
              type: 'success',
              message: 'Task updated successfully'
            });
          } catch (error) {
            // Rollback on error
            get().updateTask(taskId, originalTask);
            get().addNotification({
              type: 'error',
              message: 'Failed to update task'
            });
          }
        }
      }),
      {
        name: 'collab-workspace-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'collab-workspace-store',
    }
  )
);