import { supabase } from '@/lib/supabase';
import { CarListing } from '@/types/car';

/**
 * Service for handling car listing operations with Supabase
 */
export const carListingService = {
  /**
   * Get all car listings
   */
  getAllListings: async () => {
    const { data, error } = await supabase
      .from('car_listings')
      .select('*');
      
    if (error) throw error;
    return data as CarListing[];
  },
  
  /**
   * Get car listings by status
   */
  getListingsByStatus: async (status: 'pending' | 'approved' | 'rejected') => {
    const { data, error } = await supabase
      .from('car_listings')
      .select('*')
      .eq('status', status);
      
    if (error) throw error;
    return data as CarListing[];
  },
  
  /**
   * Get car listings for a specific dealer
   */
  getListingsByDealer: async (dealerId: string) => {
    const { data, error } = await supabase
      .from('car_listings')
      .select('*')
      .eq('dealerId', dealerId);
      
    if (error) throw error;
    return data as CarListing[];
  },
  
  /**
   * Get a single car listing by ID
   */
  getListingById: async (id: string) => {
    const { data, error } = await supabase
      .from('car_listings')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as CarListing;
  },
  
  /**
   * Create a new car listing
   */
  createListing: async (listing: Omit<CarListing, 'id'>) => {
    const { data, error } = await supabase
      .from('car_listings')
      .insert([listing])
      .select()
      .single();
      
    if (error) throw error;
    return data as CarListing;
  },
  
  /**
   * Update an existing car listing
   */
  updateListing: async (id: string, updatedListing: Partial<CarListing>) => {
    const { error } = await supabase
      .from('car_listings')
      .update(updatedListing)
      .eq('id', id);
      
    if (error) throw error;
  },
  
  /**
   * Delete a car listing
   */
  deleteListing: async (id: string) => {
    const { error } = await supabase
      .from('car_listings')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },
  
  /**
   * Upload an image for a car listing
   */
  uploadImage: async (file: any, dealerId: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('car-images')
      .upload(`${dealerId}/${fileName}`, file);
      
    if (error) throw error;
    return data;
  },
  
  /**
   * Upload audio recording for a car listing
   */
  uploadAudio: async (file: any, dealerId: string, listingId: string, type: 'repairs-needed' | 'repairs-completed') => {
    const { data, error } = await supabase.storage
      .from('car-audio')
      .upload(`${dealerId}/${listingId}/${type}.m4a`, file);
      
    if (error) throw error;
    return data;
  },
  
  /**
   * Get public URL for an image
   */
  getImageUrl: async (path: string) => {
    const { data } = supabase.storage
      .from('car-images')
      .getPublicUrl(path);
      
    return data.publicUrl;
  },
};
