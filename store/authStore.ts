import { authService } from '@/lib/services';
import { User } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth operations
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;

  // Admin operations
  getPendingUsers: () => Promise<User[]>;
  getPendingUsersCount: () => number;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          // Check if user is already logged in
          const session = await authService.getSession();
          
          if (session.session) {
            // Fetch additional user data from custom users table
            const userData = await authService.getUserProfile(session.session.user.id);
            
            set({ 
              user: userData as User, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ isAuthenticated: false, isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.signIn(email, password);
          
          if (data.user) {
            // Fetch additional user data
            const userData = await authService.getUserProfile(data.user.id);
            
            set({ 
              user: userData as User, 
              isAuthenticated: true, 
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      signUp: async (email, password, userData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.signUp(email, password, userData);
          
          if (data.user) {
            set({ 
              user: null, // User is pending, don't set user data yet
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.signOut();
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authService.resetPassword(email);
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      updateUserProfile: async (userData) => {
        const { user } = get();
        if (!user?.id) return;
        
        set({ isLoading: true, error: null });
        try {
          await authService.updateUserProfile(user.id, userData);
          
          set(state => ({ 
            user: state.user ? { ...state.user, ...userData } : null,
            isLoading: false 
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      getPendingUsers: async () => {
        try {
          return await authService.getPendingUsers();
        } catch (error: any) {
          set({ error: error.message });
          return [];
        }
      },
      
      getPendingUsersCount: () => {
        // This would ideally be fetched from the server
        // For now, we're returning a placeholder
        return 0;
      },
      
      approveUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          await authService.updateUserStatus(userId, 'active');
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      rejectUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          await authService.updateUserStatus(userId, 'inactive');
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
