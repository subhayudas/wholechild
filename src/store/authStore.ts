import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

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
  token: string | null;
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
      token: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await authService.login({ email, password });
          
          // Store token in localStorage
          localStorage.setItem('token', response.token);
          
          set({ 
            user: response.user as User, 
            isAuthenticated: true,
            token: response.token,
            isLoading: false 
          });
          
          toast.success('Login successful!');
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.msg || error.message || 'Login failed';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const response = await authService.register(userData);
          
          // Store token in localStorage
          localStorage.setItem('token', response.token);
          
          set({ 
            user: response.user as User, 
            isAuthenticated: true,
            token: response.token,
            isLoading: false 
          });
          
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.msg || error.message || 'Registration failed';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ 
          user: null, 
          isAuthenticated: false,
          token: null,
          isLoading: false 
        });
        toast.success('Logged out successfully');
      }
    }),
    {
      name: 'wholechild-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token
      }),
    }
  )
);