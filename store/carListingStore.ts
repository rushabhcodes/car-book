import { carListingService } from '@/lib/services';
import { CarListing, FormErrors } from '@/types/car';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Form state interface
interface CarListingForm {
  dealerId: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationYear: string;
  manufacturingYear: string;
  brand: string;
  model: string;
  transmissionType: string;
  rtoNumber: string;
  images: string[];
  color: string;
  ownershipHistory: string;
  kilometersDriven: string;
  fuelType: string;
  insuranceValidity: string;
  insuranceType: string;
  askingPrice: string;
  whatsappNumber: string;
  repairsNeededAudio?: string;
  repairsCompletedAudio?: string;
}

// Initial form state
const initialFormState: CarListingForm = {
  dealerId: '',
  status: 'pending',
  registrationYear: '',
  manufacturingYear: '',
  brand: '',
  model: '',
  transmissionType: '',
  rtoNumber: '',
  images: [],
  color: '',
  ownershipHistory: '',
  kilometersDriven: '',
  fuelType: '',
  insuranceValidity: '',
  insuranceType: '',
  askingPrice: '',
  whatsappNumber: '',
  repairsNeededAudio: '',
  repairsCompletedAudio: '',
};

interface CarListingState {
  // Existing state
  listings: CarListing[];
  isLoading: boolean;
  error: string | null;
  
  // Form state
  form: CarListingForm;
  errors: FormErrors;
  
  // Form methods
  setFormField: (field: keyof CarListingForm, value: any) => void;
  addImage: (imageUri: string) => void;
  removeImage: (index: number) => void;
  validateForm: () => boolean;
  submitListing: () => Promise<boolean>;
  resetForm: () => void;
  
  // Fetch operations
  fetchListings: () => Promise<void>;
  fetchAllListings: () => Promise<CarListing[]>;
  fetchAllApprovedListings: () => Promise<CarListing[]>;
  fetchListingsByDealerId: (dealerId: string) => Promise<void>;
  fetchListingById: (id: string) => Promise<CarListing | null>;
  
  // CRUD operations
  createListing: (listing: Omit<CarListing, 'id'>) => Promise<CarListing | null>;
  updateListing: (id: string, updatedListing: Partial<CarListing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  
  // Filter helpers
  getPendingListings: () => CarListing[];
  getApprovedListings: () => CarListing[];
  getRejectedListings: () => CarListing[];
}

export const useCarListingStore = create<CarListingState>()(
  persist(
    (set, get) => ({
      // Existing state
      listings: [],
      isLoading: false,
      error: null,
      
      // Form state
      form: initialFormState,
      errors: {},
      
      // Form methods
      setFormField: (field, value) => {
        set(state => ({
          form: { ...state.form, [field]: value },
          errors: { ...state.errors, [field]: '' } // Clear error when field is updated
        }));
      },
      
      addImage: (imageUri) => {
        set(state => ({
          form: { ...state.form, images: [...state.form.images, imageUri] },
          errors: { ...state.errors, images: '' }
        }));
      },
      
      removeImage: (index) => {
        set(state => ({
          form: {
            ...state.form,
            images: state.form.images.filter((_, i) => i !== index)
          }
        }));
      },
      
      validateForm: () => {
        const { form } = get();
        const newErrors: FormErrors = {};
        
        // Required field validations
        if (!form.registrationYear) newErrors.registrationYear = 'Registration year is required';
        if (!form.manufacturingYear) newErrors.manufacturingYear = 'Manufacturing year is required';
        if (!form.brand) newErrors.brand = 'Brand is required';
        if (!form.model) newErrors.model = 'Model is required';
        if (!form.transmissionType) newErrors.transmissionType = 'Transmission type is required';
        if (!form.rtoNumber) newErrors.rtoNumber = 'RTO number is required';
        if (!form.color) newErrors.color = 'Color is required';
        if (!form.ownershipHistory) newErrors.ownershipHistory = 'Ownership history is required';
        if (!form.kilometersDriven) newErrors.kilometersDriven = 'Kilometers driven is required';
        if (!form.fuelType) newErrors.fuelType = 'Fuel type is required';
        if (!form.insuranceValidity) newErrors.insuranceValidity = 'Insurance validity is required';
        if (!form.insuranceType) newErrors.insuranceType = 'Insurance type is required';
        if (!form.askingPrice) newErrors.askingPrice = 'Asking price is required';
        if (!form.whatsappNumber) newErrors.whatsappNumber = 'WhatsApp number is required';
        
        // Format validations
        if (form.registrationYear && (form.registrationYear.length !== 4 || isNaN(Number(form.registrationYear)))) {
          newErrors.registrationYear = 'Enter a valid 4-digit year';
        }
        
        if (form.manufacturingYear && (form.manufacturingYear.length !== 4 || isNaN(Number(form.manufacturingYear)))) {
          newErrors.manufacturingYear = 'Enter a valid 4-digit year';
        }
        
        if (form.whatsappNumber && (form.whatsappNumber.length !== 10 || isNaN(Number(form.whatsappNumber)))) {
          newErrors.whatsappNumber = 'Enter a valid 10-digit number';
        }
        
        if (form.askingPrice && isNaN(Number(form.askingPrice))) {
          newErrors.askingPrice = 'Enter a valid price';
        }
        
        if (form.kilometersDriven && isNaN(Number(form.kilometersDriven))) {
          newErrors.kilometersDriven = 'Enter a valid number';
        }
        
        // Image validation
        if (form.images.length === 0) {
          newErrors.images = 'At least one image is required';
        }
        
        set({ errors: newErrors });
        return Object.keys(newErrors).length === 0;
      },
      
      submitListing: async () => {
        const { form, createListing, resetForm } = get();
        
        set({ isLoading: true, error: null });
        
        try {
          const listingData: Omit<CarListing, 'id'> = {
            dealerId: form.dealerId,
            status: form.status,
            registrationYear: form.registrationYear,
            manufacturingYear: form.manufacturingYear,
            brand: form.brand,
            model: form.model,
            transmissionType: form.transmissionType,
            rtoNumber: form.rtoNumber,
            images: form.images,
            color: form.color,
            ownershipHistory: form.ownershipHistory,
            kilometersDriven: form.kilometersDriven,
            fuelType: form.fuelType,
            insuranceValidity: form.insuranceValidity,
            insuranceType: form.insuranceType,
            askingPrice: form.askingPrice,
            whatsappNumber: form.whatsappNumber,
            repairsNeededAudio: form.repairsNeededAudio,
            repairsCompletedAudio: form.repairsCompletedAudio,
          };
          
          const result = await createListing(listingData);
          
          if (result) {
            resetForm();
            return true;
          }
          
          return false;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      resetForm: () => {
        set({ form: initialFormState, errors: {} });
      },
      
      // Existing fetch operations
      fetchListings: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await carListingService.getAllListings();
          set({ listings: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchAllListings: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await carListingService.getAllListings();
          set({ isLoading: false });
          return data;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return [];
        }
      },

      fetchAllApprovedListings: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await carListingService.getListingsByStatus('approved');
          set({ isLoading: false });
          return data;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return [];
        }
      },
      
      fetchListingsByDealerId: async (dealerId: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await carListingService.getListingsByDealer(dealerId);
          set({ listings: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      fetchListingById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await carListingService.getListingById(id);
          return data;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Existing CRUD operations
      createListing: async (listing) => {
        set({ isLoading: true, error: null });
        try {
          const data = await carListingService.createListing(listing);
          
          set(state => ({ 
            listings: [...state.listings, data],
            isLoading: false 
          }));
          
          return data;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      updateListing: async (id, updatedListing) => {
        set({ isLoading: true, error: null });
        try {
          await carListingService.updateListing(id, updatedListing);
          
          set(state => ({
            listings: state.listings.map(listing => 
              listing.id === id ? { ...listing, ...updatedListing } : listing
            ),
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      deleteListing: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await carListingService.deleteListing(id);
          
          set(state => ({
            listings: state.listings.filter(listing => listing.id !== id),
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      // Existing filter helpers
      getPendingListings: () => {
        return get().listings.filter(listing => listing.status === 'pending');
      },
      
      getApprovedListings: () => {
        return get().listings.filter(listing => listing.status === 'approved');
      },
      
      getRejectedListings: () => {
        return get().listings.filter(listing => listing.status === 'rejected');
      },
    }),
    {
      name: 'car-listings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        listings: state.listings 
      }),
    }
  )
);