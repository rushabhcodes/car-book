export interface Subscription {
  id: string;
  user_id: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  listing_limit: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
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