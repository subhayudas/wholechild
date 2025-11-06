import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  session: any | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (supabaseUser: SupabaseUser | null) => void;
  setSession: (session: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      session: null,
      
      signInWithGoogle: async () => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}`,
            },
          });
          
          if (error) {
            throw error;
          }
          
          // The actual authentication will happen after redirect
          // We'll handle it in the auth state listener
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.message || 'Sign in failed';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },
      
      signOut: async () => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            throw error;
          }
          
          set({ 
            user: null, 
            isAuthenticated: false,
            session: null,
            isLoading: false 
          });
          
          toast.success('Signed out successfully');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error('Error signing out');
          throw error;
        }
      },
      
      setUser: (supabaseUser: SupabaseUser | null) => {
        if (!supabaseUser) {
          set({ 
            user: null, 
            isAuthenticated: false 
          });
          return;
        }
        
        // Extract user metadata (role might be in metadata or default to parent)
        const userMetadata = supabaseUser.user_metadata || {};
        const role = (userMetadata.role as 'parent' | 'educator' | 'therapist') || 'parent';
        
        const user: User = {
          id: supabaseUser.id,
          name: userMetadata.full_name || userMetadata.name || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email || '',
          role: role,
          avatar: userMetadata.avatar_url || userMetadata.picture || supabaseUser.identities?.[0]?.identity_data?.avatar_url,
        };
        
        set({ 
          user, 
          isAuthenticated: true 
        });
      },
      
      setSession: (session: any) => {
        set({ session, isLoading: false });
        
        if (session?.user) {
          // Only refresh if session is actually expiring soon (within 5 minutes)
          // This prevents unnecessary refreshes right after sign-in
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          
          if (expiresAt && expiresAt > now) {
            // Session is valid
            const timeUntilExpiry = expiresAt - now;
            
            // Only refresh if session expires within 5 minutes (300 seconds)
            // This gives enough buffer while avoiding immediate refreshes after sign-in
            if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
              // Session expires soon, refresh in background
              // Only refresh if session is valid and has required properties
              if (session && session.refresh_token && session.access_token) {
                supabase.auth.refreshSession(session).then(({ data: { session: refreshedSession }, error }) => {
                  if (!error && refreshedSession) {
                    set({ session: refreshedSession });
                    get().setUser(refreshedSession.user);
                  } else {
                    // Refresh failed, but session is still valid, use current session
                    console.warn('Session refresh failed, but session is still valid:', error);
                    get().setUser(session.user);
                  }
                }).catch((error) => {
                  console.error('Error refreshing session:', error);
                  // Session is still valid, use it
                  get().setUser(session.user);
                });
              } else {
                // Session doesn't have required properties, just set the user
                get().setUser(session.user);
              }
            } else {
              // Session is valid and not expiring soon, just set the user
              get().setUser(session.user);
            }
          } else if (expiresAt && expiresAt <= now) {
            // Session is expired, try to refresh once
            // Only refresh if session has required properties
            if (session && session.refresh_token && session.access_token) {
              supabase.auth.refreshSession(session).then(({ data: { session: refreshedSession }, error }) => {
                if (!error && refreshedSession) {
                  set({ session: refreshedSession });
                  get().setUser(refreshedSession.user);
                } else {
                  // Refresh failed and session expired, clear user
                  console.error('Session expired and refresh failed:', error);
                  set({ 
                    user: null, 
                    isAuthenticated: false,
                    session: null 
                  });
                }
              }).catch((error) => {
                console.error('Error refreshing expired session:', error);
                set({ 
                  user: null, 
                  isAuthenticated: false,
                  session: null 
                });
              });
            } else {
              // Session expired and doesn't have refresh token, clear user
              console.error('Session expired and no refresh token available');
              set({ 
                user: null, 
                isAuthenticated: false,
                session: null 
              });
            }
          } else {
            // No expiry info, just set the user (session should be valid)
            get().setUser(session.user);
          }
        } else {
          get().setUser(null);
        }
      },
    }),
    {
      name: 'wholechild-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);