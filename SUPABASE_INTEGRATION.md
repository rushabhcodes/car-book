# Supabase Integration Guide for Car Book App

This guide explains how to integrate Supabase with the Car Book app, including authentication, database operations, and storage.

## Table of Contents
1. [Authentication](#authentication)
2. [Database Operations](#database-operations)
3. [Storage Integration](#storage-integration)
4. [Row Level Security](#row-level-security)
5. [Troubleshooting](#troubleshooting)

## Authentication

### Setting up Authentication

The Car Book app uses Supabase Auth with custom user profiles stored in a `users` table. Our auth flow includes:

1. **Sign Up Process**:
   - Create a Supabase auth user
   - Add custom user data to the `users` table
   - New users are created with `status: 'pending'`
   - Admin approval required before activation

2. **Sign In Process**:
   - Authentication via Supabase Auth
   - Fetching additional user data from the `users` table
   - Checking user status before granting access

3. **Authentication State Management**:
   - `authStore.ts` handles auth state
   - Persistent sessions via AsyncStorage
   - Role-based routing (admin vs dealer)

### Implementation

The auth process is implemented in `lib/services/authService.ts` and `store/authStore.ts`.

## Database Operations

### Database Schema

The core tables in our schema include:

- `users`: Extends Supabase Auth with custom user data
  - Contains dealer and admin profiles
  - Tracks user status and roles

- `car_listings`: Stores vehicle listing information
  - All car details and pricing
  - Approval status
  - References to media files

- `listing_media`: Tracks media files for listings
  - Images, audio recordings, etc.
  - Linked to listings and dealers

### API Services

The services in `lib/services/` handle all database operations:

- **authService.ts**: User management
- **carListingService.ts**: Vehicle listing operations
- **dealerService.ts**: Dealer-specific operations

## Storage Integration

### Storage Buckets

Two main storage buckets are used:

1. **car-images**: Public bucket for vehicle photos
   - Structured as `dealer_id/listing_id/image_name.jpg`
   - Public access for viewing

2. **car-audio**: Private bucket for audio recordings
   - Contains repair descriptions
   - Secured with row-level security
   - Only accessible to listing owner and admins

### Media Upload Process

1. **Image Upload**:
   - Select from device library or camera
   - Compress before upload
   - Store path in the listing record

2. **Audio Recording**:
   - Record directly in the app
   - Upload to the car-audio bucket
   - Reference in the listing record

## Row Level Security

### Security Policies

Supabase RLS policies protect our data:

1. **Users Table**:
   - Users can read/update their own profiles
   - Admins can read all profiles and update status

2. **Car Listings Table**:
   - Dealers can CRUD their own listings
   - Admins can read all and update status
   - Buyers can only view approved listings

3. **Storage Buckets**:
   - Restrictive policies for private media
   - Public access for approved listing images

### SQL Examples

Examples of our RLS policies can be found in `supabase/schema.sql` and `supabase/storage.sql`.

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Check if the Supabase URL and anon key are correct in `.env`
   - Verify internet connectivity
   - Look for CORS issues on web

2. **Permission Errors**:
   - Verify RLS policies
   - Check user roles and permissions
   - Ensure user is authenticated for protected operations

3. **Storage Issues**:
   - Check storage bucket policies
   - Verify file paths are correct
   - Ensure media types are supported

### Debugging Tools

- Use `test-database.js` to verify your Supabase connection
- Check Supabase dashboard logs for errors
- Use browser developer tools to monitor network requests