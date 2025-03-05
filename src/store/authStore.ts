import { create } from 'zustand';
import { User } from '../types';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  checkAuth: () => void;
}

// For demo purposes, we'll use a mock user
const mockUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      checkAuth: () => {
        // This function is just a placeholder since the persist middleware
        // will automatically restore the state from localStorage
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you would validate credentials with a backend
        if (email && password) {
          set({ user: mockUser, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid credentials');
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you would register the user with a backend
        if (name && email && password) {
          const newUser = { ...mockUser, name, email };
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid registration data');
        }
      }
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);