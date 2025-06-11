/*
  # Create Demo User Accounts

  1. New Tables
    - No new tables, working with existing profiles table
  
  2. Demo Data
    - Creates demo admin and user profiles with proper IDs
    - Sets up the accounts referenced in the login form
  
  3. Security
    - Maintains existing RLS policies
    - Uses proper role assignments
*/

-- First, let's ensure we have the demo user profiles
-- We'll use specific UUIDs that we can reference consistently

-- Insert demo admin profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@hopefoundation.org',
  'Admin User',
  'admin',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();

-- Insert demo regular user profile  
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'user@hopefoundation.org',
  'Demo User',
  'user',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();