/*
  # Simple Database Setup for Nonprofit Website

  1. New Tables
    - `donations` - Track donations with Stripe integration
    - `events` - Manage events and activities
    - `site_settings` - Store website configuration

  2. Security
    - Enable RLS on all tables
    - Add basic policies for authenticated users
    - Admin access for management

  3. Functions
    - Auto-update timestamps
    - Handle new user profile creation
*/

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create handle_new_user function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  message text,
  stripe_session_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  location text NOT NULL,
  image_url text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Donations policies
CREATE POLICY "Anyone can view donations" ON donations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert donations" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update donations" ON donations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Admins can delete donations" ON donations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Events policies
CREATE POLICY "Anyone can view published events" ON events FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all events" ON events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for new user profiles (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert some basic site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'HopeFoundation'),
  ('site_description', 'Creating positive change in communities worldwide'),
  ('contact_email', 'info@hopefoundation.org'),
  ('contact_phone', '+1 (555) 123-4567'),
  ('contact_address', '123 Hope Street, City, State 12345')
ON CONFLICT (key) DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, date, location, image_url, published) VALUES
  (
    'Annual Charity Gala',
    'Join us for an evening of celebration and fundraising to support our education initiatives.',
    '2025-03-15 19:00:00+00',
    'Grand Ballroom, City Convention Center',
    'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  ),
  (
    'Community Health Fair',
    'Free health screenings, vaccinations, and wellness education for the entire community.',
    '2025-02-28 09:00:00+00',
    'Central Park Community Center',
    'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  ),
  (
    'Volunteer Training Workshop',
    'Comprehensive training session for new volunteers.',
    '2025-02-20 10:00:00+00',
    'HopeFoundation Training Center',
    'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  )
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_session ON donations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(published);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);