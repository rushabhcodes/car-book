-- Create custom users table that extends Supabase Auth
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'dealer')) NOT NULL DEFAULT 'dealer',
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Subscription Plan Details
  plan TEXT CHECK (plan IN ('basic', 'premium', 'enterprise')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')) NOT NULL DEFAULT 'inactive',
  
  -- Listing Limit for the Subscription Tier
  listing_limit INTEGER NOT NULL DEFAULT 0,

  -- Validity Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_listings table
CREATE TABLE public.car_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES public.users(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
  
  -- Vehicle Identity
  registration_year TEXT NOT NULL,
  manufacturing_year TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  transmission_type TEXT NOT NULL,
  rto_number TEXT NOT NULL,
  
  -- Vehicle Details
  color TEXT NOT NULL,
  ownership_history TEXT NOT NULL,
  kilometers_driven TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  insurance_validity TEXT NOT NULL,
  insurance_type TEXT NOT NULL,
  
  -- Pricing
  asking_price TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listing_media table for images, videos, audio
CREATE TABLE public.listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.car_listings(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('image', 'video', 'audio_repairs_needed', 'audio_repairs_completed')) NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for car_listings table
CREATE POLICY "Dealers can view their own listings" ON public.car_listings
  FOR SELECT USING (dealer_id = auth.uid());

CREATE POLICY "Dealers can create their own listings" ON public.car_listings
  FOR INSERT WITH CHECK (dealer_id = auth.uid());

CREATE POLICY "Dealers can update their own listings" ON public.car_listings
  FOR UPDATE USING (dealer_id = auth.uid());

CREATE POLICY "Admins can view all listings" ON public.car_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view approved listings" ON public.car_listings
  FOR SELECT USING (status = 'approved');

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view and manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for listing_media table
CREATE POLICY "Users can view media for accessible listings" ON public.listing_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.car_listings cl
      WHERE cl.id = listing_id
      AND (
        cl.dealer_id = auth.uid() 
        OR cl.status = 'approved'
        OR EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Dealers can manage media for their listings" ON public.listing_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.car_listings cl
      WHERE cl.id = listing_id AND cl.dealer_id = auth.uid()
    )
  );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'dealer'),
    'pending'
  );

  -- Create default subscription (basic, inactive, 5 listing limit)
  INSERT INTO public.subscriptions (user_id, plan, status, listing_limit, start_date, end_date)
  VALUES (
    NEW.id, 'basic', 'inactive', 15, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_car_listings_updated_at
  BEFORE UPDATE ON public.car_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
