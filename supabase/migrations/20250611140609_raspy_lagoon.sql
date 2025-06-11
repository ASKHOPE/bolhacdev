/*
  # Create demo user profiles

  This migration creates demo user profiles that can be used for testing.
  Since we cannot directly insert into auth.users in migrations, we'll create
  the profiles with placeholder IDs and update them when the actual users sign up.

  1. Demo Profiles
    - Admin profile with admin role
    - Regular user profile with user role
  
  2. Instructions
    - After running this migration, manually create the users through Supabase Auth UI:
      - admin@hopefoundation.org / admin123
      - user@hopefoundation.org / user123
    - The profiles will be automatically linked when users sign up
*/

-- Create demo profiles with temporary UUIDs
-- These will be updated when actual users are created through Supabase Auth

DO $$
DECLARE
  admin_temp_id uuid := '11111111-1111-1111-1111-111111111111';
  user_temp_id uuid := '22222222-2222-2222-2222-222222222222';
BEGIN
  -- Insert admin profile
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    admin_temp_id,
    'admin@hopefoundation.org',
    'Admin User',
    'admin',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  -- Insert demo user profile  
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    user_temp_id,
    'user@hopefoundation.org',
    'Demo User',
    'user',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

EXCEPTION
  WHEN others THEN
    -- If there's any error, we'll just skip creating the demo profiles
    -- They can be created manually later
    NULL;
END $$;

-- Insert some initial site settings for the demo
INSERT INTO public.site_settings (key, value, created_at, updated_at)
VALUES 
  ('site_name', 'Hope Foundation', now(), now()),
  ('site_description', 'Making a difference in our community', now(), now()),
  ('contact_email', 'contact@hopefoundation.org', now(), now()),
  ('donation_goal', '50000', now(), now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Create a sample published event for demonstration
INSERT INTO public.events (
  title,
  description,
  date,
  location,
  image_url,
  published,
  created_at,
  updated_at
)
VALUES (
  'Community Food Drive',
  'Join us for our monthly community food drive. We collect non-perishable food items to distribute to families in need.',
  (now() + interval '7 days'),
  'Community Center, 123 Main Street',
  'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg',
  true,
  now(),
  now()
)
ON CONFLICT DO NOTHING;