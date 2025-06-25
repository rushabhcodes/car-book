import { supabase } from '@/lib/supabase';
import { Subscription } from '@/types/dealer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SubscriptionState {
  subscriptions: Subscription[];
  currentUserSubscription: Subscription | null;
  isLoading: boolean;
  isUpdating: boolean;
  
  // Subscription management actions
  fetchSubscriptions: () => Promise<void>;
  fetchUserSubscription: (userId: string) => Promise<void>;
  createSubscription: (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<boolean>;
  activateSubscription: (id: string) => Promise<boolean>;
  deactivateSubscription: (id: string) => Promise<boolean>;
  extendSubscription: (id: string, days: number) => Promise<boolean>;
  changePlan: (id: string, newPlan: 'basic' | 'premium' | 'enterprise') => Promise<boolean>;
  
  // Utility functions
  isSubscriptionActive: (subscription: Subscription) => boolean;
  isSubscriptionExpired: (subscription: Subscription) => boolean;
  getRemainingDays: (subscription: Subscription) => number;
  getRemainingListings: (userId: string) => Promise<number>;
  canCreateListing: (userId: string) => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      currentUserSubscription: null,
      isLoading: false,
      isUpdating: false,

      fetchSubscriptions: async () => {
        try {
          set({ isLoading: true });
          
          const { data, error } = await supabase
            .from('subscriptions')
            .select(`
              *,
              users:user_id (
                id,
                name,
                email,
                phone
              )
            `)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching subscriptions:', error);
            return;
          }

          set({ subscriptions: data || [] });
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUserSubscription: async (userId: string) => {
        try {
          set({ isLoading: true });
          
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching user subscription:', error);
            return;
          }

          set({ currentUserSubscription: data || null });
        } catch (error) {
          console.error('Error fetching user subscription:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      createSubscription: async (subscription) => {
        try {
          set({ isUpdating: true });
          
          const { data, error } = await supabase
            .from('subscriptions')
            .insert([subscription])
            .select()
            .single();

          if (error) {
            console.error('Error creating subscription:', error);
            return false;
          }

          // Update the subscriptions list
          const { subscriptions } = get();
          set({ subscriptions: [data, ...subscriptions] });
          
          return true;
        } catch (error) {
          console.error('Error creating subscription:', error);
          return false;
        } finally {
          set({ isUpdating: false });
        }
      },

      updateSubscription: async (id, updates) => {
        try {
          set({ isUpdating: true });
          
          const { data, error } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            console.error('Error updating subscription:', error);
            return false;
          }

          // Update the subscriptions list
          const { subscriptions, currentUserSubscription } = get();
          const updatedSubscriptions = subscriptions.map(sub => 
            sub.id === id ? data : sub
          );
          
          set({ 
            subscriptions: updatedSubscriptions,
            currentUserSubscription: currentUserSubscription?.id === id ? data : currentUserSubscription
          });
          
          return true;
        } catch (error) {
          console.error('Error updating subscription:', error);
          return false;
        } finally {
          set({ isUpdating: false });
        }
      },

      activateSubscription: async (id) => {
        return get().updateSubscription(id, { status: 'active' });
      },

      deactivateSubscription: async (id) => {
        return get().updateSubscription(id, { status: 'inactive' });
      },

      extendSubscription: async (id, days) => {
        try {
          const { subscriptions } = get();
          const subscription = subscriptions.find(sub => sub.id === id);
          
          if (!subscription) {
            console.error('Subscription not found');
            return false;
          }

          const currentEndDate = new Date(subscription.end_date);
          const newEndDate = new Date(currentEndDate.getTime() + (days * 24 * 60 * 60 * 1000));
          
          return get().updateSubscription(id, { 
            end_date: newEndDate.toISOString().split('T')[0] 
          });
        } catch (error) {
          console.error('Error extending subscription:', error);
          return false;
        }
      },

      changePlan: async (id, newPlan) => {
        // Define listing limits for each plan
        const planLimits = {
          basic: 15,
          premium: 50,
          enterprise: 100
        };

        return get().updateSubscription(id, { 
          plan: newPlan,
          listing_limit: planLimits[newPlan]
        });
      },

      isSubscriptionActive: (subscription) => {
        if (subscription.status !== 'active') return false;
        
        const today = new Date();
        const endDate = new Date(subscription.end_date);
        
        return endDate >= today;
      },

      isSubscriptionExpired: (subscription) => {
        const today = new Date();
        const endDate = new Date(subscription.end_date);
        
        return endDate < today;
      },

      getRemainingDays: (subscription) => {
        const today = new Date();
        const endDate = new Date(subscription.end_date);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
      },

      getRemainingListings: async (userId) => {
        try {
          // Get user's subscription
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (subError || !subscription) {
            return 0;
          }

          // Check if subscription is active
          const { isSubscriptionActive } = get();
          if (!isSubscriptionActive(subscription)) {
            return 0;
          }

          // Get current listings count
          const { data: listings, error: listingsError } = await supabase
            .from('car_listings')
            .select('id')
            .eq('dealer_id', userId);

          if (listingsError) {
            console.error('Error fetching listings count:', listingsError);
            return 0;
          }

          const currentListings = listings?.length || 0;
          return Math.max(0, subscription.listing_limit - currentListings);
        } catch (error) {
          console.error('Error getting remaining listings:', error);
          return 0;
        }
      },

      canCreateListing: async (userId) => {
        const remainingListings = await get().getRemainingListings(userId);
        return remainingListings > 0;
      },
    }),
    {
      name: 'subscription-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUserSubscription: state.currentUserSubscription,
      }),
    }
  )
);
