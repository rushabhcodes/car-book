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
  video?: string;
  
  // Vehicle Details
  color: string;
  ownershipHistory: string;
  kilometersDriven: string;
  fuelType: string;
  insuranceValidity: string;
  insuranceType: string;
  
  // Pricing
  askingPrice: string;
  offeredPrice: string;
  youCanOffer: string;
  whatsappNumber: string;
  
  // Work History
  repairsNeededAudio?: string;
  repairsCompletedAudio?: string;
}

export interface FormErrors {
  [key: string]: string;
}