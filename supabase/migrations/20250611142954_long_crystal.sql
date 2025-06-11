/*
  # Clean Database Schema

  1. New Tables
    - `donations` - Store donation records with Stripe integration
    - `events` - Store event information
    - `site_settings` - Store site configuration
    - `contact_messages` - Store contact form submissions
    - `newsletter_subscribers` - Store newsletter subscriptions

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Admin role checking for management operations

  3. Features
    - Stripe payment integration
    - Event management
    - Contact form handling
    - Newsletter subscriptions
    - Site settings management
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
  currency text DEFAULT 'USD',
  message text,
  is_anonymous boolean DEFAULT false,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  payment_status text DEFAULT 'pending',
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
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  registration_fee numeric(10,2) DEFAULT 0,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribe_token text UNIQUE DEFAULT gen_random_uuid()
);

-- Enable RLS on all tables
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Donations policies
DROP POLICY IF EXISTS "Anyone can view donations" ON donations;
DROP POLICY IF EXISTS "Anyone can insert donations" ON donations;
DROP POLICY IF EXISTS "Admins can update donations" ON donations;
DROP POLICY IF EXISTS "Admins can delete donations" ON donations;

CREATE POLICY "Anyone can view donations" ON donations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert donations" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage donations" ON donations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Events policies
DROP POLICY IF EXISTS "Anyone can view published events" ON events;
DROP POLICY IF EXISTS "Admins can view all events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

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
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;

CREATE POLICY "Anyone can view public settings" ON site_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can view all settings" ON site_settings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Admins can manage settings" ON site_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Contact messages policies
CREATE POLICY "Anyone can create contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage contact messages" ON contact_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Newsletter subscribers policies
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own subscription" ON newsletter_subscribers FOR SELECT USING (
  email = (SELECT email FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage subscribers" ON newsletter_subscribers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for new user profiles (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert basic site settings
INSERT INTO site_settings (key, value, description, is_public) VALUES
  ('site_name', 'HopeFoundation', 'Name of the organization', true),
  ('site_description', 'Creating positive change in communities worldwide', 'Site description', true),
  ('contact_email', 'info@hopefoundation.org', 'Main contact email', true),
  ('contact_phone', '+1 (555) 123-4567', 'Main contact phone', true),
  ('contact_address', '123 Hope Street, City, State 12345', 'Physical address', true),
  ('facebook_url', 'https://facebook.com/hopefoundation', 'Facebook page URL', true),
  ('twitter_url', 'https://twitter.com/hopefoundation', 'Twitter profile URL', true),
  ('instagram_url', 'https://instagram.com/hopefoundation', 'Instagram profile URL', true),
  ('donation_goal', '100000', 'Annual donation goal in dollars', false),
  ('volunteer_goal', '500', 'Annual volunteer goal', false)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public,
  updated_at = now();

-- Insert sample events
INSERT INTO events (title, description, date, location, image_url, max_attendees, published, featured) VALUES
  (
    'Annual Charity Gala',
    'Join us for an evening of celebration and fundraising to support our education initiatives. Featuring dinner, entertainment, and inspiring stories from our beneficiaries.',
    '2025-03-15 19:00:00+00',
    'Grand Ballroom, City Convention Center',
    'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
    200,
    true,
    true
  ),
  (
    'Community Health Fair',
    'Free health screenings, vaccinations, and wellness education for the entire community. Healthcare professionals will be available for consultations.',
    '2025-02-28 09:00:00+00',
    'Central Park Community Center',
    'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg?auto=compress&cs=tinysrgb&w=800',
    500,
    true,
    false
  ),
  (
    'Volunteer Training Workshop',
    'Comprehensive training session for new volunteers. Learn about our programs, safety protocols, and how to make the biggest impact.',
    '2025-02-20 10:00:00+00',
    'HopeFoundation Training Center',
    'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
    50,
    true,
    false
  ),
  (
    'Clean Water Project Launch',
    'Ceremony to launch our new clean water initiative in rural communities. Learn about the project and how you can contribute.',
    '2025-04-10 14:00:00+00',
    'Project Site, Rural District',
    'https://images.pexels.com/photos/6962024/pexels-photo-6962024.jpeg?auto=compress&cs=tinysrgb&w=800',
    100,
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_session ON donations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(published);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_public ON site_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);