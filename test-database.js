// Test Supabase database connection
const { supabase } = require('./lib/supabase');

async function testDatabase() {
  console.log('🧪 Testing Supabase Database Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth connection failed:', authError.message);
      return;
    }
    console.log('✅ Basic connection successful\n');

    // Test 2: Check if tables exist
    console.log('2️⃣ Testing if tables exist...');
    
    // Test users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table not found:', usersError.message);
      console.log('🔧 Please run the database schema in Supabase SQL Editor first');
      return;
    }
    console.log('✅ Users table exists');

    // Test car_listings table
    const { data: listingsData, error: listingsError } = await supabase
      .from('car_listings')
      .select('count')
      .limit(1);
    
    if (listingsError) {
      console.log('❌ Car listings table not found:', listingsError.message);
      return;
    }
    console.log('✅ Car listings table exists');

    // Test listing_media table
    const { data: mediaData, error: mediaError } = await supabase
      .from('listing_media')
      .select('count')
      .limit(1);
    
    if (mediaError) {
      console.log('❌ Listing media table not found:', mediaError.message);
      return;
    }
    console.log('✅ Listing media table exists\n');

    // Test 3: Check storage buckets
    console.log('3️⃣ Testing storage buckets...');
    
    const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage error:', bucketsError.message);
      return;
    }

    const bucketNames = bucketsData.map(bucket => bucket.name);
    const requiredBuckets = ['car-images', 'car-videos', 'car-audio'];
    
    for (const bucket of requiredBuckets) {
      if (bucketNames.includes(bucket)) {
        console.log(`✅ ${bucket} bucket exists`);
      } else {
        console.log(`❌ ${bucket} bucket missing`);
      }
    }

    // Test 4: Test RLS policies
    console.log('\n4️⃣ Testing Row Level Security...');
    
    // This should work (no auth required for counting)
    const { data: publicTest, error: publicError } = await supabase
      .from('car_listings')
      .select('id')
      .eq('status', 'approved')
      .limit(1);
    
    if (publicError) {
      console.log('❌ RLS policy error:', publicError.message);
    } else {
      console.log('✅ RLS policies working');
    }

    console.log('\n🎉 Database setup test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Register a user in your app');
    console.log('2. Create an admin account');
    console.log('3. Test car listing creation');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct Supabase credentials');
    console.log('2. Verify you ran the database schema in Supabase SQL Editor');
    console.log('3. Check your internet connection');
  }
}

// Run the test
testDatabase();
