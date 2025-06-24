export interface CarListing {
  id: string;
  dealerId: string;
  status: 'pending' | 'approved' | 'rejected';
  
  // Vehicle Identity
  registrationYear: string;
  manufacturingYear: string;
  brand: string;
  model: string;
  transmissionType: string;
  rtoNumber: string;
  
  // Media
  images: string[];
  // video?: string;
  
  // Vehicle Details
  color: string;
  ownershipHistory: string;
  kilometersDriven: string;
  fuelType: string;
  insuranceValidity: string;
  insuranceType: string;
  
  // Pricing
  askingPrice: string;
  whatsappNumber: string;
  
  // Work History
  repairsNeededAudio?: string;
  repairsCompletedAudio?: string;
  
  // Timestamps (optional, from database)
  created_at?: string;
  updated_at?: string;
}

export interface FormErrors {
  [key: string]: string;
}