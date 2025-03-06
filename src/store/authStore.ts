import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      checkAuth: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (profile) {
              set({
                user: {
                  id: user.id,
                  name: profile.name,
                  email: user.email!,
                  avatar: profile.avatar_url
                },
                isAuthenticated: true
              });
            }
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;

          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (profile) {
              set({
                user: {
                  id: user.id,
                  name: profile.name,
                  email: user.email!,
                  avatar: profile.avatar_url
                },
                isAuthenticated: true
              });
            }
          }
        } catch (error) {
          console.error('Error logging in:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Error logging out:', error);
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data: { user }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
              }
            }
          });

          if (error) throw error;

          if (user) {
            set({
              user: {
                id: user.id,
                name,
                email: user.email!,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
              },
              isAuthenticated: true
            });
          }
        } catch (error) {
          console.error('Error registering:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
