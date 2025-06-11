/*
  # Complete Database Schema for Nonprofit Website

  1. Core Tables
    - `auth.users` (Supabase built-in authentication)
    - `profiles` (Extended user information)
    - `donations` (Donation records with Stripe integration)
    - `programs` (Nonprofit programs)
    - `events` (Events and activities)
    - `volunteers` (Volunteer management)
    - `site_settings` (Website configuration)

  2. Security
    - Enable RLS on all tables
    - Create appropriate policies for admin/user access
    - Proper foreign key relationships

  3. Features
    - Stripe payment integration
    - Event registration system
    - Volunteer management
    - Content management
    - Analytics ready
*/

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS volunteer_activities CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS volunteer_status CASCADE;
DROP TYPE IF EXISTS contact_status CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS program_status CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'volunteer', 'donor');
CREATE TYPE volunteer_status AS ENUM ('pending', 'approved', 'active', 'inactive', 'suspended');
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE program_status AS ENUM ('planning', 'active', 'completed', 'suspended');

-- 1. Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role user_role DEFAULT 'user'::user_role,
  avatar_url text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'United States',
  date_of_birth date,
  bio text,
  website text,
  social_media jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Programs table
CREATE TABLE programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  long_description text,
  image_url text,
  gallery_urls text[],
  target_amount numeric(12,2),
  current_amount numeric(12,2) DEFAULT 0,
  start_date date,
  end_date date,
  location text,
  coordinates point,
  status program_status DEFAULT 'planning',
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  tags text[],
  beneficiaries_count integer DEFAULT 0,
  impact_metrics jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Donations table
CREATE TABLE donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'USD',
  message text,
  is_anonymous boolean DEFAULT false,
  is_recurring boolean DEFAULT false,
  recurring_frequency text,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  payment_status text DEFAULT 'pending',
  tax_deductible boolean DEFAULT true,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- 4. Events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  long_description text,
  date timestamptz NOT NULL,
  end_date timestamptz,
  location text NOT NULL,
  address text,
  coordinates point,
  image_url text,
  gallery_urls text[],
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  registration_fee numeric(10,2) DEFAULT 0,
  registration_deadline timestamptz,
  status event_status DEFAULT 'draft',
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  tags text[],
  requirements text[],
  agenda jsonb DEFAULT '[]',
  contact_email text,
  contact_phone text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Event registrations table
CREATE TABLE event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  dietary_restrictions text,
  special_requirements text,
  payment_status text DEFAULT 'pending',
  stripe_session_id text,
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 6. Volunteers table
CREATE TABLE volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  application_date date DEFAULT CURRENT_DATE,
  skills text[],
  interests text[],
  availability jsonb DEFAULT '{}',
  experience text,
  motivation text,
  references jsonb DEFAULT '[]',
  emergency_contact_name text,
  emergency_contact_phone text,
  background_check_completed boolean DEFAULT false,
  background_check_date date,
  orientation_completed boolean DEFAULT false,
  orientation_date date,
  status volunteer_status DEFAULT 'pending',
  hours_contributed numeric(8,2) DEFAULT 0,
  last_activity_date date,
  supervisor_id uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 7. Volunteer activities table
CREATE TABLE volunteer_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  activity_name text NOT NULL,
  description text,
  hours numeric(6,2) NOT NULL CHECK (hours > 0),
  date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  supervisor_id uuid REFERENCES auth.users(id),
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 8. Site settings table
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  category text DEFAULT 'general',
  data_type text DEFAULT 'string',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribe_token text UNIQUE DEFAULT gen_random_uuid(),
  preferences jsonb DEFAULT '{}',
  source text,
  last_email_sent timestamptz,
  bounce_count integer DEFAULT 0
);

-- 10. Contact messages table
CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  category text,
  priority text DEFAULT 'normal',
  status contact_status DEFAULT 'new',
  assigned_to uuid REFERENCES auth.users(id),
  response text,
  response_sent_at timestamptz,
  internal_notes text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 11. Blog posts table
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  gallery_urls text[],
  author_id uuid REFERENCES auth.users(id),
  published boolean DEFAULT false,
  published_at timestamptz,
  featured boolean DEFAULT false,
  tags text[],
  categories text[],
  meta_title text,
  meta_description text,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  reading_time integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
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

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
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

-- Create function to update volunteer hours
CREATE OR REPLACE FUNCTION update_volunteer_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE volunteers 
    SET hours_contributed = hours_contributed + NEW.hours,
        last_activity_date = NEW.date
    WHERE id = NEW.volunteer_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE volunteers 
    SET hours_contributed = hours_contributed - OLD.hours + NEW.hours,
        last_activity_date = NEW.date
    WHERE id = NEW.volunteer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE volunteers 
    SET hours_contributed = hours_contributed - OLD.hours
    WHERE id = OLD.volunteer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to update volunteer hours
CREATE TRIGGER update_volunteer_hours_trigger
  AFTER INSERT OR UPDATE OR DELETE ON volunteer_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_volunteer_hours();

-- Create function to update program donation amounts
CREATE OR REPLACE FUNCTION update_program_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'completed' THEN
    UPDATE programs 
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.program_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.payment_status != 'completed' AND NEW.payment_status = 'completed' THEN
      UPDATE programs 
      SET current_amount = current_amount + NEW.amount
      WHERE id = NEW.program_id;
    ELSIF OLD.payment_status = 'completed' AND NEW.payment_status != 'completed' THEN
      UPDATE programs 
      SET current_amount = current_amount - NEW.amount
      WHERE id = NEW.program_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to update program amounts
CREATE TRIGGER update_program_amount_trigger
  AFTER INSERT OR UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_program_amount();

-- RLS Policies

-- Profiles table policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Programs table policies
CREATE POLICY "Anyone can read published programs"
  ON programs FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage all programs"
  ON programs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Donations table policies
CREATE POLICY "Users can read own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Anyone can create donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all donations"
  ON donations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Events table policies
CREATE POLICY "Anyone can read published events"
  ON events FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage all events"
  ON events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Event registrations policies
CREATE POLICY "Users can read own registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own registrations"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all registrations"
  ON event_registrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Volunteers table policies
CREATE POLICY "Users can read own volunteer profile"
  ON volunteers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own volunteer profile"
  ON volunteers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own volunteer profile"
  ON volunteers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all volunteers"
  ON volunteers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Volunteer activities policies
CREATE POLICY "Users can read own activities"
  ON volunteer_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE id = volunteer_activities.volunteer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own activities"
  ON volunteer_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE id = volunteer_activities.volunteer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all activities"
  ON volunteer_activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Site settings policies
CREATE POLICY "Anyone can read public settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Admins can manage all settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Newsletter subscribers policies
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own subscription"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscribers"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Contact messages policies
CREATE POLICY "Anyone can create contact messages"
  ON contact_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages"
  ON contact_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Blog posts policies
CREATE POLICY "Anyone can read published posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage all posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX idx_donations_amount ON donations(amount);
CREATE INDEX idx_donations_payment_status ON donations(payment_status);
CREATE INDEX idx_donations_program_id ON donations(program_id);
CREATE INDEX idx_donations_stripe_session_id ON donations(stripe_session_id);
CREATE INDEX idx_programs_published ON programs(published);
CREATE INDEX idx_programs_featured ON programs(featured);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_slug ON programs(slug);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_published ON events(published);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_volunteers_status ON volunteers(status);
CREATE INDEX idx_volunteer_activities_date ON volunteer_activities(date DESC);
CREATE INDEX idx_volunteer_activities_verified ON volunteer_activities(verified);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);

-- Insert sample site settings
INSERT INTO site_settings (key, value, description, category, is_public) VALUES
  ('site_name', 'HopeFoundation', 'Name of the organization', 'general', true),
  ('site_description', 'Creating positive change in communities worldwide', 'Site description for SEO', 'general', true),
  ('contact_email', 'info@hopefoundation.org', 'Main contact email', 'contact', true),
  ('contact_phone', '+1 (555) 123-4567', 'Main contact phone', 'contact', true),
  ('contact_address', '123 Hope Street, City, State 12345', 'Physical address', 'contact', true),
  ('donation_goal', '100000', 'Annual donation goal in dollars', 'fundraising', false),
  ('volunteer_goal', '500', 'Annual volunteer goal', 'volunteers', false),
  ('facebook_url', 'https://facebook.com/hopefoundation', 'Facebook page URL', 'social', true),
  ('twitter_url', 'https://twitter.com/hopefoundation', 'Twitter profile URL', 'social', true),
  ('instagram_url', 'https://instagram.com/hopefoundation', 'Instagram profile URL', 'social', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Insert sample programs
INSERT INTO programs (title, slug, description, long_description, target_amount, location, status, published, featured) VALUES
  (
    'Education Initiative',
    'education-initiative',
    'Providing quality education and learning resources to underserved communities.',
    'Our Education Initiative focuses on building schools, training teachers, and providing educational materials to children in remote and underserved areas. We believe education is the foundation for breaking cycles of poverty and creating sustainable change.',
    50000,
    'Multiple locations worldwide',
    'active',
    true,
    true
  ),
  (
    'Clean Water Project',
    'clean-water-project',
    'Building sustainable water systems for communities in need.',
    'Access to clean water is a basic human right. Our Clean Water Project involves drilling wells, installing water purification systems, and training local communities in water system maintenance to ensure long-term sustainability.',
    75000,
    'Rural communities in Africa and Asia',
    'active',
    true,
    true
  ),
  (
    'Healthcare Access Program',
    'healthcare-access-program',
    'Ensuring basic healthcare services reach remote and marginalized areas.',
    'We operate mobile health clinics and train community health workers to provide basic medical care, preventive health education, and emergency response in areas where healthcare infrastructure is limited or non-existent.',
    60000,
    'Remote villages and urban slums',
    'active',
    true,
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample events
INSERT INTO events (title, slug, description, date, location, max_attendees, status, published) VALUES
  (
    'Annual Charity Gala',
    'annual-charity-gala-2025',
    'Join us for an evening of celebration and fundraising to support our education initiatives.',
    '2025-03-15 19:00:00+00',
    'Grand Ballroom, City Convention Center',
    200,
    'published',
    true
  ),
  (
    'Community Health Fair',
    'community-health-fair-2025',
    'Free health screenings, vaccinations, and wellness education for the entire community.',
    '2025-02-28 09:00:00+00',
    'Central Park Community Center',
    500,
    'published',
    true
  ),
  (
    'Volunteer Training Workshop',
    'volunteer-training-workshop-feb-2025',
    'Comprehensive training session for new volunteers.',
    '2025-02-20 10:00:00+00',
    'HopeFoundation Training Center',
    50,
    'published',
    true
  )
ON CONFLICT (slug) DO NOTHING;