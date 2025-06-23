# Supabase Setup Instructions

## Prerequisites Completed ✅
- [x] Supabase project created
- [x] Dependencies installed
- [x] Configuration files created
- [x] Database schema ready
- [x] Storage buckets ready
- [x] AuthStore updated

## Next Steps to Complete Setup

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Update Environment Variables

1. Open `.env` file in your project root
2. Replace the placeholder values:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/schema.sql`
3. Click **Run** to create all tables and policies
4. Copy and paste the contents of `supabase/storage.sql`  
5. Click **Run** to create storage buckets and policies

### 4. Create Admin Account

Run this SQL in Supabase SQL Editor to create an admin account:

```sql
-- First sign up through your app with these credentials:
-- Email: admin@carbook.com
-- Password: admin123456
-- Then run this SQL to make them admin:

UPDATE public.users 
SET role = 'admin', status = 'active' 
WHERE email = 'admin@carbook.com';
```

### 5. Update Import Paths

Replace the old authStore import in these files:
- `app/index.tsx`
- `app/(auth)/register.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(admin)/_layout.tsx`

Change from:
```typescript
import { useAuthStore } from '@/store/authStore';
```

To:
```typescript
import { useAuthStore } from '@/store/authStore';
```

### 6. Test the Setup

1. Start your development server:
```bash
npm start
```

2. Try registering a new dealer account
3. Login as admin to approve the dealer
4. Test creating car listings

### 7. Optional: Remove Mock Data

Once everything is working:
1. Delete `store/authStore.ts` (the old file)
2. Rename `store/authStore-supabase.ts` to `store/authStore.ts` ✅ DONE
3. Update all imports back to `@/store/authStore` ✅ DONE

## Storage Setup

Your storage buckets are configured for:
- **car-images**: Public bucket for car photos
- **car-videos**: Public bucket for car videos  
- **car-audio**: Private bucket for repair audio recordings

## Security Features Enabled

- ✅ Row Level Security (RLS) on all tables
- ✅ Users can only access their own data
- ✅ Admins can access all data
- ✅ File storage with proper access controls
- ✅ Automatic user profile creation on signup

## Real-time Features Available

- User approval notifications for admins
- Live car listing status updates
- Real-time pending user count

## Troubleshooting

### Common Issues:

1. **"Invalid JWT"**: Check your anon key is correct
2. **"Schema not found"**: Run the schema.sql file
3. **"Storage bucket not found"**: Run the storage.sql file
4. **Login fails**: Check user status is 'active' in users table

### Useful SQL Queries:

```sql
-- Check all users
SELECT * FROM public.users;

-- Check all car listings  
SELECT * FROM public.car_listings;

-- Make user active
UPDATE public.users SET status = 'active' WHERE email = 'user@example.com';
```

## Production Checklist

Before deploying:
- [ ] Environment variables set in production
- [ ] Database backups enabled  
- [ ] RLS policies tested
- [ ] Admin account created
- [ ] Storage limits configured
- [ ] Email templates customized (optional)

Your Car-Book app is now ready with full Supabase integration! 🚀
