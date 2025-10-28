import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'educator' | 'therapist';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { name: string; email: string; password: string; role: 'parent' | 'educator' | 'therapist' }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation
          if (!email || !password) {
            throw new Error('Email and password are required');
          }
          
          const mockUser: User = {
            id: '1',
            name: 'Sarah Johnson',
            email,
            role: 'parent',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          };
          
          set({ 
            user: mockUser, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Mock validation
          if (!userData.name || !userData.email || !userData.password) {
            throw new Error('All fields are required');
          }
          
          if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          
          const newUser: User = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.role === 'parent' 
              ? 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
              : userData.role === 'educator'
                ? 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150'
                : 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150'
          };
          
          set({ 
            user: newUser, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    }),
    {
      name: 'wholechild-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);