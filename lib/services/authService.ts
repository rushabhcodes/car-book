import { supabase } from '@/lib/supabase';
import { User } from '@/types/auth';

/**
 * Service for handling authentication operations with Supabase
 */
export const authService = {
  /**
   * Sign in a user with email and password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Sign up a new user
   */
  signUp: async (email: string, password: string, userData: Partial<User>) => {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Create user profile in custom users table
      const newUser: Partial<User> = {
        ...userData,
        id: data.user.id,
        email,
        status: 'pending', // New users start as pending
      };
      
      const { error: profileError } = await supabase
        .from('users')
        .insert([newUser]);
        
      if (profileError) throw profileError;
    }
    
    return data;
  },
  
  /**
   * Sign out the current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  /**
   * Get the current session
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },
  
  /**
   * Send a password reset email
   */
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
  
  /**
   * Get user profile data
   */
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data as User;
  },
  
  /**
   * Update user profile data
   */
  updateUserProfile: async (userId: string, userData: Partial<User>) => {
    const { error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId);
      
    if (error) throw error;
  },
  
  /**
   * Get all pending users (admin only)
   */
  getPendingUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending');
      
    if (error) throw error;
    return data as User[];
  },
  
  /**
   * Update user status (admin only)
   */
  updateUserStatus: async (userId: string, status: 'active' | 'inactive' | 'pending') => {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);
      
    if (error) throw error;
  },
};
