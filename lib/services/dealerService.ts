import { supabase } from '@/lib/supabase';
import { Dealer, Subscription } from '@/types/dealer';

/**
 * Service for handling dealer operations with Supabase
 */
export const dealerService = {
  /**
   * Get all dealers
   */
  getAllDealers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'dealer');
      
    if (error) throw error;
    return data as Dealer[];
  },
  
  /**
   * Get a single dealer by ID
   */
  getDealerById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'dealer')
      .single();
      
    if (error) throw error;
    return data as Dealer;
  },
  
  /**
   * Update dealer information
   */
  updateDealer: async (id: string, dealerData: Partial<Dealer>) => {
    const { error } = await supabase
      .from('users')
      .update(dealerData)
      .eq('id', id)
      .eq('role', 'dealer');
      
    if (error) throw error;
  },

  /**
   * Create a new dealer
   */
  createDealer: async (dealerData: Omit<Dealer, 'id'>) => {
    const { data, error } = await supabase
      .from('users')
      .insert([dealerData])
      .select()
      .single();
      
    if (error) throw error;
    return data as Dealer;
  },

  /**
   * Delete a dealer
   */
  deleteDealer: async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'dealer');
      
    if (error) throw error;
  },
  
  /**
   * Update dealer subscription
   */
  updateSubscription: async (dealerId: string, subscription: Subscription) => {
    // In a real app, this would have a separate subscriptions table
    // For simplicity, we're storing it in the dealer record
    const { error } = await supabase
      .from('users')
      .update({ subscription })
      .eq('id', dealerId)
      .eq('role', 'dealer');
      
    if (error) throw error;
  },
  
  /**
   * Get dealer listing limits based on subscription
   */
  getDealerListingLimit: async (dealerId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('users')
      .select('subscription')
      .eq('id', dealerId)
      .eq('role', 'dealer')
      .single();
      
    if (error) throw error;
    
    const dealer = data as Dealer;
    if (!dealer.subscription) return 0;
    
    return dealer.subscription.listingLimit;
  },
  
  /**
   * Count current listings for a dealer
   */
  countDealerListings: async (dealerId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('dealerId', dealerId);
      
    if (error) throw error;
    
    return count || 0;
  },
};
