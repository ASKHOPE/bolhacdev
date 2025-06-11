/*
  # Remove all authentication and RLS policies

  1. Disable RLS on all tables
  2. Drop all existing policies
  3. Remove authentication requirements
  
  This migration removes all security restrictions to allow the site to work without authentication.
*/

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Drop all existing policies on donations table
DROP POLICY IF EXISTS "Admins can manage donations" ON donations;
DROP POLICY IF EXISTS "Anyone can insert donations" ON donations;
DROP POLICY IF EXISTS "Anyone can view donations" ON donations;

-- Drop all existing policies on events table
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Admins can view all events" ON events;
DROP POLICY IF EXISTS "Anyone can view published events" ON events;

-- Drop all existing policies on site_settings table
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can view public settings" ON site_settings;

-- Drop all existing policies on contact_messages table
DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;

-- Drop all existing policies on newsletter_subscribers table
DROP POLICY IF EXISTS "Admins can manage subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscribers;