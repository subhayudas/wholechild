import { getSupabaseClient } from '../utils/supabase';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
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
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  },

  async findById(id: string): Promise<User | null> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  },

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const { data, error } = await getSupabaseClient()
      .from('users')
      .insert({
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
      })
      .select()
      .single();

    if (error) {
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



