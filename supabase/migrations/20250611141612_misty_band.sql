/*
  # Complete Database Schema for Nonprofit Website

  1. New Tables
    - `profiles` - User profiles with roles (admin/user)
    - `donations` - Donation records with Stripe integration
    - `events` - Event management with publishing status
    - `site_settings` - Configurable site settings
    - `volunteers` - Volunteer registration and tracking
    - `programs` - Program information and management
    - `newsletter_subscribers` - Email newsletter subscriptions
    - `contact_messages` - Contact form submissions

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Create admin-only and user-specific access controls

  3. Functions and Triggers
    - Auto-update timestamps
    - User profile creation trigger
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE volunteer_status AS ENUM ('pending', 'approved', 'active', 'inactive');
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'user'::user_role,
  avatar_url text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  message text,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  is_anonymous boolean DEFAULT false,
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
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  phone text,
  special_requirements text,
  payment_status text DEFAULT 'pending',
  stripe_session_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  image_url text,
  target_amount numeric(12,2),
  current_amount numeric(12,2) DEFAULT 0,
  start_date date,
  end_date date,
  location text,
  status text DEFAULT 'active',
  published boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skills text[],
  availability text,
  experience text,
  motivation text,
  emergency_contact_name text,
  emergency_contact_phone text,
  background_check_completed boolean DEFAULT false,
  status volunteer_status DEFAULT 'pending',
  hours_contributed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create volunteer activities table
CREATE TABLE IF NOT EXISTS volunteer_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  activity_name text NOT NULL,
  description text,
  hours numeric(4,2) NOT NULL CHECK (hours > 0),
  date date NOT NULL,
  verified_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribe_token text UNIQUE DEFAULT gen_random_uuid()
);

-- Create contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status contact_status DEFAULT 'new',
  assigned_to uuid REFERENCES profiles(id),
  response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author_id uuid REFERENCES profiles(id),
  published boolean DEFAULT false,
  published_at timestamptz,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
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

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
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

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for donations
CREATE POLICY "Anyone can create donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for events
CREATE POLICY "Anyone can read published events"
  ON events
  FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage all events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for event registrations
CREATE POLICY "Users can read own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own registrations"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for programs
CREATE POLICY "Anyone can read published programs"
  ON programs
  FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage all programs"
  ON programs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for volunteers
CREATE POLICY "Users can read own volunteer profile"
  ON volunteers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own volunteer profile"
  ON volunteers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own volunteer profile"
  ON volunteers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all volunteers"
  ON volunteers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for volunteer activities
CREATE POLICY "Users can read own activities"
  ON volunteer_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE id = volunteer_activities.volunteer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own activities"
  ON volunteer_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE id = volunteer_activities.volunteer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all activities"
  ON volunteer_activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for site settings
CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for newsletter subscribers
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for contact messages
CREATE POLICY "Anyone can create contact messages"
  ON contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages"
  ON contact_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- RLS Policies for blog posts
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage all blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Insert demo data
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@hopefoundation.org', 'Demo Administrator', 'admin', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'user@hopefoundation.org', 'Demo User', 'user', now(), now())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();

-- Insert sample site settings
INSERT INTO site_settings (key, value, description, category) VALUES
  ('site_name', 'HopeFoundation', 'Name of the organization', 'general'),
  ('site_description', 'Creating positive change in communities worldwide', 'Site description for SEO', 'general'),
  ('contact_email', 'info@hopefoundation.org', 'Main contact email', 'contact'),
  ('contact_phone', '+1 (555) 123-4567', 'Main contact phone', 'contact'),
  ('contact_address', '123 Hope Street, City, State 12345', 'Physical address', 'contact'),
  ('donation_goal', '100000', 'Annual donation goal in dollars', 'fundraising'),
  ('volunteer_goal', '500', 'Annual volunteer goal', 'volunteers'),
  ('facebook_url', 'https://facebook.com/hopefoundation', 'Facebook page URL', 'social'),
  ('twitter_url', 'https://twitter.com/hopefoundation', 'Twitter profile URL', 'social'),
  ('instagram_url', 'https://instagram.com/hopefoundation', 'Instagram profile URL', 'social')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Insert sample programs
INSERT INTO programs (title, description, long_description, target_amount, location, published) VALUES
  (
    'Education Initiative',
    'Providing quality education and learning resources to underserved communities.',
    'Our Education Initiative focuses on building schools, training teachers, and providing educational materials to children in remote and underserved areas. We believe education is the foundation for breaking cycles of poverty and creating sustainable change.',
    50000,
    'Multiple locations worldwide',
    true
  ),
  (
    'Clean Water Project',
    'Building sustainable water systems for communities in need.',
    'Access to clean water is a basic human right. Our Clean Water Project involves drilling wells, installing water purification systems, and training local communities in water system maintenance to ensure long-term sustainability.',
    75000,
    'Rural communities in Africa and Asia',
    true
  ),
  (
    'Healthcare Access Program',
    'Ensuring basic healthcare services reach remote and marginalized areas.',
    'We operate mobile health clinics and train community health workers to provide basic medical care, preventive health education, and emergency response in areas where healthcare infrastructure is limited or non-existent.',
    60000,
    'Remote villages and urban slums',
    true
  )
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, date, location, max_attendees, published) VALUES
  (
    'Annual Charity Gala',
    'Join us for an evening of celebration and fundraising to support our education initiatives.',
    '2025-03-15 19:00:00+00',
    'Grand Ballroom, City Convention Center',
    200,
    true
  ),
  (
    'Community Health Fair',
    'Free health screenings, vaccinations, and wellness education for the entire community.',
    '2025-02-28 09:00:00+00',
    'Central Park Community Center',
    500,
    true
  ),
  (
    'Volunteer Training Workshop',
    'Comprehensive training session for new volunteers.',
    '2025-02-20 10:00:00+00',
    'HopeFoundation Training Center',
    50,
    true
  )
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(published);
CREATE INDEX IF NOT EXISTS idx_programs_published ON programs(published);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_activities_date ON volunteer_activities(date DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);