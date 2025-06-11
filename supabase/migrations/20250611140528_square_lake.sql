/*
  # Create Demo User Accounts

  1. New Users
    - Creates demo admin account: admin@hopefoundation.org
    - Creates demo user account: user@hopefoundation.org
  
  2. Authentication Setup
    - Inserts users into auth.users table with hashed passwords
    - Sets up email confirmation as confirmed
    - Creates corresponding profile records
  
  3. Security
    - Uses proper password hashing
    - Sets appropriate user roles (admin/user)
    - Links auth users to profile records
*/

-- Insert demo admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@hopefoundation.org',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Insert demo regular user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'user@hopefoundation.org',
  crypt('user123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo User"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create profiles for demo users (these will be created automatically by the trigger)
-- The handle_new_user trigger should create the profiles, but we'll ensure they exist

DO $$
DECLARE
  admin_user_id uuid;
  demo_user_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@hopefoundation.org';
  
  -- Get demo user ID
  SELECT id INTO demo_user_id 
  FROM auth.users 
  WHERE email = 'user@hopefoundation.org';
  
  -- Insert admin profile if it doesn't exist
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (admin_user_id, 'admin@hopefoundation.org', 'Admin User', 'admin')
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      full_name = 'Admin User';
  END IF;
  
  -- Insert demo user profile if it doesn't exist
  IF demo_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (demo_user_id, 'user@hopefoundation.org', 'Demo User', 'user')
    ON CONFLICT (id) DO UPDATE SET
      role = 'user',
      full_name = 'Demo User';
  END IF;
END $$;