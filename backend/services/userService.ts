import { getSupabaseClient } from '../utils/supabase';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string | null;
  role: 'parent' | 'educator' | 'therapist';
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    // If error is not a "not found" error, log it but still return null
    if (error && error.code !== 'PGRST116') {
      console.error('Error finding user by email:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data as User;
  },

  async findById(id: string): Promise<User | null> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    // If error is not a "not found" error, log it but still return null
    if (error && error.code !== 'PGRST116') {
      console.error('Error finding user by id:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data as User;
  },

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    // Hash password if provided, otherwise use null for OAuth users
    // Note: If migration 004_sync_auth_users.sql has been applied, password can be NULL
    // For OAuth users, we'll use a dummy hash since the schema might require NOT NULL
    let passwordHash: string | null = null;
    if (userData.password) {
      passwordHash = await bcrypt.hash(userData.password, 10);
    } else {
      // Use a dummy bcrypt hash for OAuth users if password is required
      // This is a valid bcrypt hash format (not used for authentication)
      passwordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    }

    const { data, error } = await getSupabaseClient()
      .from('users')
      .insert({
        ...userData,
        email: userData.email.toLowerCase(),
        password: passwordHash, // NULL for OAuth users, hashed password for regular users
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate/conflict error
      if (error.code === '23505' || 
          error.message?.includes('duplicate') || 
          error.message?.includes('already exists') ||
          error.message?.includes('unique constraint')) {
        // User already exists, try to fetch it
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
          return existingUser;
        }
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data as User;
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data as User;
  },

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};



