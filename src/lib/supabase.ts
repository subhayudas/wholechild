import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables. Please check your .env.local file.');
  console.error(error);
  throw error;
}

// Create Supabase client with error handling
let supabase: ReturnType<typeof createClient>;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });

  // Add global error handler for auth errors
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
      console.warn('Token refresh failed - session is null');
    }
  });

} catch (error) {
  console.error('Error initializing Supabase client:', error);
  throw new Error('Failed to initialize Supabase client. Please check your configuration.');
}

// Add global error handler for unhandled promise rejections from Supabase
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'object' && event.reason.message) {
      const message = event.reason.message.toLowerCase();
      if (message.includes('supabase') || message.includes('auth')) {
        console.error('Unhandled Supabase auth error:', event.reason);
        // Prevent the error from being logged to console as unhandled
        event.preventDefault();
      }
    }
  });
}

export { supabase };



