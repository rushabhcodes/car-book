import { supabase } from '@/lib/supabase';
import { CarListing, FormErrors } from '@/types/car';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CarListingState {
  form: CarListing;
  errors: FormErrors;
  listings: CarListing[];
  isLoading: boolean;
  isSubmitting: boolean;
  setFormField: (field: keyof CarListing, value: any) => void;
  addImage: (imageUri: string) => void;
  removeImage: (index: number) => void;
  validateForm: () => boolean;
  submitListing: () => Promise<boolean>;
  updateListing: (id: string, updatedListing: CarListing) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  fetchListings: (dealerId?: string) => Promise<void>;
  uploadImages: (images: string[]) => Promise<string[]>;
  uploadImageAsBase64: (imageUri: string) => Promise<string | null>;
  resetForm: () => void;
  getTotalListingCount: () => number;
  getPendingListingCount: () => number;
}
 
const initialForm: CarListing = {
  id: '',
  dealerId: '',
  status: 'pending',
  registrationYear: '',
  manufacturingYear: '',
  brand: '',
  model: '',
  transmissionType: '',
  rtoNumber: '',
  images: [],
  // video: '',
  color: '',
  ownershipHistory: '',
  kilometersDriven: '',
  fuelType: '',
  insuranceValidity: '',
  insuranceType: '',
  askingPrice: '',
  whatsappNumber: '',
};

export const useCarListingStore = create<CarListingState>()(
  persist(
    (set, get) => ({
      form: { ...initialForm },
      errors: {},
      listings: [],
      isLoading: false,
      isSubmitting: false,

      setFormField: (field, value) => {
        set((state) => ({
          form: { ...state.form, [field]: value },
          errors: { ...state.errors, [field]: '' }, // Clear error when field is updated
        }));
      },

      addImage: (imageUri) => {
        set((state) => ({
          form: {
            ...state.form,
            images: [...state.form.images, imageUri].slice(0, 15), // Max 15 images
          },
        }));
      },

      removeImage: (index) => {
        set((state) => ({
          form: {
            ...state.form,
            images: state.form.images.filter((_, i) => i !== index),
          },
        }));
      },

      validateForm: () => {
        const { form } = get();
        const errors: FormErrors = {};
        const requiredFields: (keyof CarListing)[] = [
          'registrationYear',
          'manufacturingYear',
          'brand',
          'model',
          'transmissionType',
          'rtoNumber',
          'color',
          'ownershipHistory',
          'kilometersDriven',
          'fuelType',
          'askingPrice',
          'whatsappNumber',
          'dealerId',
        ];

        // Check required fields
        requiredFields.forEach((field) => {
          if (!form[field]) {
            errors[field] = 'This field is required';
          }
        });

        // Validate numeric fields
        if (form.registrationYear && !/^\d{4}$/.test(form.registrationYear)) {
          errors.registrationYear = 'Enter a valid 4-digit year';
        }

        if (form.manufacturingYear && !/^\d{4}$/.test(form.manufacturingYear)) {
          errors.manufacturingYear = 'Enter a valid 4-digit year';
        }

        if (form.kilometersDriven && !/^\d+$/.test(form.kilometersDriven)) {
          errors.kilometersDriven = 'Enter a valid number';
        }

        if (form.askingPrice && !/^\d+$/.test(form.askingPrice)) {
          errors.askingPrice = 'Enter a valid amount';
        }

        // Validate WhatsApp number (10 digits for India)
        if (form.whatsappNumber && !/^\d{10}$/.test(form.whatsappNumber)) {
          errors.whatsappNumber = 'Enter a valid 10-digit number';
        }

        // Check if at least one image is uploaded
        if (form.images.length === 0) {
          errors.images = 'Upload at least one image';
        }

        set({ errors });
        return Object.keys(errors).length === 0;
      },

      uploadImages: async (images: string[]) => {
        try {
          const uploadedUrls: string[] = [];

          for (const imageUri of images) {
            try {
              console.log('Uploading image:', imageUri);

              // Try the direct file upload method first
              let uploadedUrl: string | null = null;

              try {
                // Method 1: Direct file upload
                const fileExtension = imageUri.split('.').pop() || 'jpg';
                const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
                const filePath = `car-images/${filename}`;

                // Create file object compatible with React Native
                const file = {
                  uri: imageUri,
                  type: `image/${fileExtension}`,
                  name: filename,
                } as any;

                const { data, error } = await supabase.storage
                  .from('car-images')
                  .upload(filePath, file, {
                    contentType: `image/${fileExtension}`,
                    upsert: false
                  });

                if (!error && data) {
                  const { data: urlData } = supabase.storage
                    .from('car-images')
                    .getPublicUrl(filePath);

                  uploadedUrl = urlData?.publicUrl || null;
                }
              } catch (directUploadError) {
                console.log('Direct upload failed, trying base64 method:', directUploadError);
              }

              // Method 2: Fallback to base64 upload if direct upload failed
              if (!uploadedUrl) {
                uploadedUrl = await get().uploadImageAsBase64(imageUri);
              }

              if (uploadedUrl) {
                uploadedUrls.push(uploadedUrl);
                console.log('Successfully uploaded image:', uploadedUrl);
              } else {
                console.error('Failed to upload image:', imageUri);
              }

            } catch (imageError) {
              console.error('Error processing individual image:', imageError);
              continue;
            }
          }

          console.log('Total images uploaded:', uploadedUrls.length, 'out of', images.length);

          if (uploadedUrls.length === 0 && images.length > 0) {
            throw new Error('Failed to upload any images');
          }

          return uploadedUrls;
        } catch (error) {
          console.error('Error uploading images:', error);
          throw error;
        }
      },

      // Alternative upload method using base64 (fallback)
      uploadImageAsBase64: async (imageUri: string): Promise<string | null> => {
        try {
          // Convert image to base64
          const response = await fetch(imageUri);
          const blob = await response.blob();

          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String.split(',')[1]); // Remove data:image/jpeg;base64, prefix
            };
            reader.onerror = reject;
          });
          reader.readAsDataURL(blob);
          const base64Data = await base64Promise;

          // Generate unique filename
          const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const filePath = `car-images/${filename}`;

          // Convert base64 to Uint8Array
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('car-images')
            .upload(filePath, bytes, {
              contentType: 'image/jpeg',
              upsert: false
            });

          if (error) {
            console.error('Error uploading base64 image:', error);
            return null;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);

          return urlData?.publicUrl || null;
        } catch (error) {
          console.error('Error in base64 upload:', error);
          return null;
        }
      },

      submitListing: async () => {
        try {
          set({ isSubmitting: true });

          const isValid = get().validateForm();
          if (!isValid) {
            return false;
          }

          const { form } = get();

          // Upload images first (with better error handling)
          let uploadedImageUrls: string[] = [];
          try {
            if (form.images.length > 0) {
              uploadedImageUrls = await get().uploadImages(form.images);
              console.log('Successfully uploaded images:', uploadedImageUrls.length);
            }
          } catch (imageError) {
            console.error('Image upload failed:', imageError);
            // You can choose to continue without images or fail the submission
            // For now, let's continue without images but log the error
            uploadedImageUrls = [];
          }

          // Prepare listing data for Supabase
          const listingData = {
            dealer_id: form.dealerId,
            status: 'pending',
            registration_year: form.registrationYear,
            manufacturing_year: form.manufacturingYear,
            brand: form.brand,
            model: form.model,
            transmission_type: form.transmissionType,
            rto_number: form.rtoNumber,
            color: form.color,
            ownership_history: form.ownershipHistory,
            kilometers_driven: form.kilometersDriven,
            fuel_type: form.fuelType,
            insurance_validity: form.insuranceValidity,
            insurance_type: form.insuranceType,
            asking_price: form.askingPrice,
            whatsapp_number: form.whatsappNumber,
          };

          // Insert listing into Supabase
          const { data: listing, error: listingError } = await supabase
            .from('car_listings')
            .insert([listingData])
            .select()
            .single();

          if (listingError) {
            console.error('Error creating listing:', listingError);
            throw listingError;
          }

          // Insert images into listing_media table
          if (uploadedImageUrls.length > 0) {
            const mediaData = uploadedImageUrls.map(url => ({
              listing_id: listing.id,
              file_url: url,
              file_type: 'image',
              file_name: url.split('/').pop() || 'image.jpg'
            }));

            const { error: mediaError } = await supabase
              .from('listing_media')
              .insert(mediaData);

            if (mediaError) {
              console.error('Error saving media:', mediaError);
              // Continue anyway, listing is created
            }
          }

          // Refresh listings
          await get().fetchListings(form.dealerId);

          // Reset form
          set({ form: { ...initialForm }, errors: {} });

          return true;
        } catch (error) {
          console.error('Error submitting listing:', error);
          return false;
        } finally {
          set({ isSubmitting: false });
        }
      },

      fetchListings: async (dealerId?: string) => {
        try {
          set({ isLoading: true });

          let query = supabase
            .from('car_listings')
            .select(`
              *,
              listing_media (
                file_url,
                file_type,
                file_name
              )
            `)
            .order('created_at', { ascending: false });

          // Filter by dealer if dealerId is provided
          if (dealerId) {
            query = query.eq('dealer_id', dealerId);
          }

          const { data, error } = await query;

          if (error) {
            console.error('Error fetching listings:', error);
            throw error;
          }

          // Transform data to match CarListing interface
          const transformedListings: CarListing[] = (data || []).map(listing => ({
            id: listing.id,
            dealerId: listing.dealer_id,
            status: listing.status,
            registrationYear: listing.registration_year,
            manufacturingYear: listing.manufacturing_year,
            brand: listing.brand,
            model: listing.model,
            transmissionType: listing.transmission_type,
            rtoNumber: listing.rto_number,
            color: listing.color,
            ownershipHistory: listing.ownership_history,
            kilometersDriven: listing.kilometers_driven,
            fuelType: listing.fuel_type,
            insuranceValidity: listing.insurance_validity,
            insuranceType: listing.insurance_type,
            askingPrice: listing.asking_price,
            whatsappNumber: listing.whatsapp_number,
            images: listing.listing_media
              ?.filter((media: any) => media.file_type === 'image')
              ?.map((media: any) => media.file_url) || []
          }));

          set({ listings: transformedListings });
        } catch (error) {
          console.error('Error fetching listings:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateListing: async (id, updatedListing) => {
        try {
          // Prepare data for Supabase update
          const updateData = {
            registration_year: updatedListing.registrationYear,
            manufacturing_year: updatedListing.manufacturingYear,
            brand: updatedListing.brand,
            model: updatedListing.model,
            transmission_type: updatedListing.transmissionType,
            rto_number: updatedListing.rtoNumber,
            color: updatedListing.color,
            ownership_history: updatedListing.ownershipHistory,
            kilometers_driven: updatedListing.kilometersDriven,
            fuel_type: updatedListing.fuelType,
            insurance_validity: updatedListing.insuranceValidity,
            insurance_type: updatedListing.insuranceType,
            asking_price: updatedListing.askingPrice,
            whatsapp_number: updatedListing.whatsappNumber,
          };

          const { error } = await supabase
            .from('car_listings')
            .update(updateData)
            .eq('id', id);

          if (error) {
            console.error('Error updating listing:', error);
            throw error;
          }

          // Update local state
          set((state) => ({
            listings: state.listings.map((listing) =>
              listing.id === id ? { ...updatedListing } : listing
            ),
          }));

          return true;
        } catch (error) {
          console.error('Error updating listing:', error);
          return false;
        }
      },

      deleteListing: async (id) => {
        try {
          const { error } = await supabase
            .from('car_listings')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error deleting listing:', error);
            throw error;
          }

          // Update local state
          set((state) => ({
            listings: state.listings.filter((listing) => listing.id !== id),
          }));

          return true;
        } catch (error) {
          console.error('Error deleting listing:', error);
          return false;
        }
      },

      resetForm: () => {
        set({ form: { ...initialForm }, errors: {} });
      },

      getTotalListingCount: () => {
        const { listings } = get();
        return listings.length;
      },

      getPendingListingCount: () => {
        
        const { listings } = get();
        return listings.filter(listing => listing.status === 'pending').length;
      },
    }),
    {
      name: 'car-listing-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist listings, not form data or loading states
        listings: state.listings
      }),
    }
  )
);