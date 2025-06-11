/*
  # Create site_stats and response_times tables

  1. New Tables
    - `site_stats`
      - `id` (uuid, primary key)
      - `key` (text, unique, not null)
      - `label` (text, not null)
      - `value` (text, not null)
      - `icon` (text, not null)
      - `page` (text, not null, default 'home')
      - `display_order` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `response_times`
      - `id` (uuid, primary key)
      - `inquiry_type` (text, not null)
      - `response_time` (text, not null)
      - `display_order` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to active records
    - Add policies for authenticated admin users to manage all records

  3. Indexes
    - Add indexes for commonly queried columns
    - Add unique constraint on site_stats.key

  4. Triggers
    - Add updated_at triggers for both tables
*/

-- Create site_stats table
CREATE TABLE IF NOT EXISTS site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  value text NOT NULL,
  icon text NOT NULL,
  page text NOT NULL DEFAULT 'home',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create response_times table
CREATE TABLE IF NOT EXISTS response_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type text NOT NULL,
  response_time text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for site_stats
CREATE INDEX IF NOT EXISTS idx_site_stats_key ON site_stats(key);
CREATE INDEX IF NOT EXISTS idx_site_stats_page ON site_stats(page);
CREATE INDEX IF NOT EXISTS idx_site_stats_active ON site_stats(is_active);
CREATE INDEX IF NOT EXISTS idx_site_stats_display_order ON site_stats(display_order);

-- Add indexes for response_times
CREATE INDEX IF NOT EXISTS idx_response_times_active ON response_times(is_active);
CREATE INDEX IF NOT EXISTS idx_response_times_display_order ON response_times(display_order);

-- Enable RLS
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_stats
CREATE POLICY "Anyone can read active site stats"
  ON site_stats
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage site stats"
  ON site_stats
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for response_times
CREATE POLICY "Anyone can read active response times"
  ON response_times
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage response times"
  ON response_times
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_site_stats_updated_at
  BEFORE UPDATE ON site_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_times_updated_at
  BEFORE UPDATE ON response_times
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some default site stats
INSERT INTO site_stats (key, label, value, icon, page, display_order) VALUES
  ('total_beneficiaries', 'Lives Impacted', '50,000+', 'Users', 'home', 1),
  ('projects_completed', 'Projects Completed', '150+', 'Target', 'home', 2),
  ('active_volunteers', 'Active Volunteers', '1,200+', 'Heart', 'home', 3),
  ('funds_raised', 'Funds Raised', '$2.5M+', 'Award', 'home', 4),
  ('years_experience', 'Years of Experience', '15+', 'Calendar', 'about', 1),
  ('countries_served', 'Countries Served', '25+', 'Globe', 'about', 2)
ON CONFLICT (key) DO NOTHING;

-- Insert some default response times
INSERT INTO response_times (inquiry_type, response_time, display_order) VALUES
  ('General Inquiries', 'Within 24 hours', 1),
  ('Volunteer Applications', 'Within 48 hours', 2),
  ('Partnership Requests', '3-5 business days', 3),
  ('Media Inquiries', 'Within 4 hours', 4),
  ('Technical Support', 'Within 12 hours', 5)
ON CONFLICT DO NOTHING;