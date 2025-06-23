export interface Subscription {
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
  amount: number;
  listingLimit: number;
}

export interface Dealer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'dealer';
  status: 'active' | 'inactive' | 'pending';
  companyName?: string;
  address?: string;
  subscription?: Subscription;
}