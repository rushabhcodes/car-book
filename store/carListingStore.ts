import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarListing, FormErrors } from '@/types/car';

interface CarListingState {
  form: CarListing;
  errors: FormErrors;
  listings: CarListing[];
  setFormField: (field: keyof CarListing, value: any) => void;
  addImage: (imageUri: string) => void;
  removeImage: (index: number) => void;
  setVideo: (videoUri: string) => void;
  validateForm: () => boolean;
  submitListing: () => boolean;
  updateListing: (id: string, updatedListing: CarListing) => void;
  deleteListing: (id: string) => void;
  resetForm: () => void;
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
  video: '',
  color: '',
  ownershipHistory: '',
  kilometersDriven: '',
  fuelType: '',
  insuranceValidity: '',
  insuranceType: '',
  askingPrice: '',
  offeredPrice: '',
  youCanOffer: '',
  whatsappNumber: '',
};

// Sample listings for demo
const sampleListings: CarListing[] = [
  {
    id: '1',
    dealerId: '2',
    status: 'approved',
    registrationYear: '2019',
    manufacturingYear: '2018',
    brand: 'Honda',
    model: 'City',
    transmissionType: 'Automatic',
    rtoNumber: 'MH01 - Mumbai Central',
    images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop'],
    color: 'White',
    ownershipHistory: '1st Owner',
    kilometersDriven: '45000',
    fuelType: 'Petrol',
    insuranceValidity: '2023-12-31',
    insuranceType: 'Comprehensive',
    askingPrice: '850000',
    offeredPrice: '800000',
    youCanOffer: '820000',
    whatsappNumber: '9960456992',
  },
  {
    id: '2',
    dealerId: '2',
    status: 'pending',
    registrationYear: '2020',
    manufacturingYear: '2020',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    transmissionType: 'Manual',
    rtoNumber: 'MH02 - Mumbai West',
    images: ['https://images.unsplash.com/photo-1549399542-7e8f2e928464?q=80&w=2071&auto=format&fit=crop'],
    color: 'Red',
    ownershipHistory: '1st Owner',
    kilometersDriven: '25000',
    fuelType: 'Petrol',
    insuranceValidity: '2024-05-15',
    insuranceType: 'Comprehensive',
    askingPrice: '650000',
    offeredPrice: '600000',
    youCanOffer: '625000',
    whatsappNumber: '9960456992',
  },
];

export const useCarListingStore = create<CarListingState>()(
  persist(
    (set, get) => ({
      form: { ...initialForm },
      errors: {},
      listings: sampleListings,
      
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
      
      setVideo: (videoUri) => {
        set((state) => ({
          form: { ...state.form, video: videoUri },
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
        
        if (form.offeredPrice && !/^\d+$/.test(form.offeredPrice)) {
          errors.offeredPrice = 'Enter a valid amount';
        }
        
        if (form.youCanOffer && !/^\d+$/.test(form.youCanOffer)) {
          errors.youCanOffer = 'Enter a valid amount';
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
      
      submitListing: () => {
        const isValid = get().validateForm();
        if (isValid) {
          const newListing = {
            ...get().form,
            id: Date.now().toString(),
          };
          
          set((state) => ({
            listings: [...state.listings, newListing],
            form: { ...initialForm },
          }));
          return true;
        }
        return false;
      },
      
      updateListing: (id, updatedListing) => {
        set((state) => ({
          listings: state.listings.map((listing) => 
            listing.id === id ? { ...updatedListing } : listing
          ),
        }));
      },
      
      deleteListing: (id) => {
        set((state) => ({
          listings: state.listings.filter((listing) => listing.id !== id),
        }));
      },
      
      resetForm: () => {
        set({ form: { ...initialForm }, errors: {} });
      },
    }),
    {
      name: 'car-listing-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ listings: state.listings }),
    }
  )
);