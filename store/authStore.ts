import { supabase } from '@/lib/supabase';
import { User } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  session: any;
  isAuthenticated: boolean;
  pendingUsers: User[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string, role?: 'admin' | 'dealer') => Promise<boolean>;
  logout: () => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  getPendingUsersCount: () => number;
  fetchPendingUsers: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      pendingUsers: [],
      isLoading: false,

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Error getting session:', error);
            return;
          }

          if (session?.user) {
            // Fetch user profile
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Error fetching user profile:', profileError);
            } else if (userProfile) {
              set({
                user: userProfile,
                session,
                isAuthenticated: true,
              });
            }
          }

          // Set up auth state change listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (userProfile) {
                set({
                  user: userProfile,
                  session,
                  isAuthenticated: true,
                });
              }
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
              });
            }
          });

        } catch (error) {
          console.error('Initialization error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password,
          });

          if (error) {
            console.error('Login error:', error);
            return false;
          }

          if (data.user) {
            // Fetch user profile
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
              console.error('Profile fetch error:', profileError);
              return false;
            }

            if (userProfile?.status !== 'active') {
              await supabase.auth.signOut();
              console.error('Account not active');
              return false;
            }

            set({
              user: userProfile,
              session: data.session,
              isAuthenticated: true,
            });
            return true;
          }

          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, phone, password, role = 'dealer') => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password,
            options: {
              data: {
                name,
                phone,
                role,
              },
            },
          });

          if (error) {
            console.error('Registration error:', error);
            return false;
          }

          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      fetchPendingUsers: async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });


          if (error) {
            console.error('Error fetching pending users:', error);
            return;
          }

          set({ pendingUsers: data || [] });
        } catch (error) {
          console.error('Error fetching pending users:', error);
        }
      },

      approveUser: async (userId) => {
        try {
          const { error } = await supabase
            .from('users')
            .update({ status: 'active' })
            .eq('id', userId);

          if (error) {
            console.error('Error approving user:', error);
            return;
          }

          // Refresh pending users
          await get().fetchPendingUsers();
        } catch (error) {
          console.error('Error approving user:', error);
        }
      },

      rejectUser: async (userId) => {
        try {
          const { error } = await supabase
            .from('users')
            .update({ status: 'inactive' })
            .eq('id', userId);

          if (error) {
            console.error('Error rejecting user:', error);
            return;
          }

          // Refresh pending users
          await get().fetchPendingUsers();
        } catch (error) {
          console.error('Error rejecting user:', error);
        }
      },

      getPendingUsersCount: () => {
        return get().pendingUsers.length;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
