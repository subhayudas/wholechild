import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createChildLogger } from './logger';

const logger = createChildLogger({ service: 'supabase' });

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 */
export const initSupabase = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    const error = new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    logger.error({ error }, 'Supabase configuration error');
    throw error;
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  logger.info({ url: supabaseUrl }, 'Supabase client initialized');
  return supabaseClient;
};

/**
 * Get Supabase client instance
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
};

/**
 * Health check for Supabase connection
 */
export const checkSupabaseHealth = async (): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    // Use a simple query that works with service key (bypasses RLS)
    const { error } = await client.from('users').select('id').limit(1);
    
    if (error) {
      logger.error({ error }, 'Supabase health check failed');
      return false;
    }
    
    logger.debug('Supabase health check passed');
    return true;
  } catch (error) {
    logger.error({ error }, 'Supabase health check error');
    return false;
  }
};

export type { SupabaseClient };

