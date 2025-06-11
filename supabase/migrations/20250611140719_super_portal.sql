/*
  # Create Demo Accounts

  1. New Data
    - Creates demo admin account (admin@hopefoundation.org)
    - Creates demo user account (user@hopefoundation.org)
    - Inserts corresponding profile records with proper roles

  2. Security
    - Uses Supabase's built-in auth system
    - Profiles are created with appropriate roles
    - Follows existing RLS policies

  Note: These are demo accounts for testing purposes with simple passwords.
  In production, use stronger passwords and proper user registration flow.
*/

-- Insert demo admin user into auth.users (this requires service role access)
-- Note: In a real migration, you would typically create these through the Supabase dashboard
-- or use the management API. For demo purposes, we'll create the profile records
-- and the actual auth users should be created manually through Supabase dashboard.

-- Insert demo profiles (the auth users need to be created separately)
-- These will be linked when the auth users are created with matching IDs

-- Demo admin profile
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@hopefoundation.org',
  'Demo Administrator',
  'admin',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();

-- Demo user profile  
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'user@hopefoundation.org',
  'Demo User',
  'user',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();