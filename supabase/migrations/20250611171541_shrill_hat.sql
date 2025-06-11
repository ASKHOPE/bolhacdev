/*
  # Add Stats and Response Times Management

  1. New Tables
    - `site_stats` - For managing homepage and other page statistics
    - `response_times` - For managing contact page response times
  
  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
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

-- Enable RLS
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_times ENABLE ROW LEVEL SECURITY;

-- Create policies for site_stats
CREATE POLICY "Anyone can read active stats"
  ON site_stats
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage stats"
  ON site_stats
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for response_times
CREATE POLICY "Anyone can read active response times"
  ON response_times
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage response times"
  ON response_times
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default stats
INSERT INTO site_stats (key, label, value, icon, page, display_order) VALUES
('people_helped', 'People Helped', '50,000+', 'Users', 'home', 1),
('countries', 'Countries', '25', 'Globe', 'home', 2),
('volunteers', 'Volunteers', '1,200+', 'Heart', 'home', 3),
('projects_completed', 'Projects Completed', '150+', 'Award', 'home', 4),
('years_impact', 'Years of Impact', '15+', 'Calendar', 'about', 1),
('countries_served', 'Countries Served', '25', 'Globe', 'about', 2);

-- Insert default response times
INSERT INTO response_times (inquiry_type, response_time, display_order) VALUES
('General Inquiries', 'Within 24 hours', 1),
('Volunteer Applications', 'Within 48 hours', 2),
('Partnership Inquiries', 'Within 3-5 business days', 3),
('Media Requests', 'Within 24 hours', 4);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_stats_updated_at
    BEFORE UPDATE ON site_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_times_updated_at
    BEFORE UPDATE ON response_times
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();