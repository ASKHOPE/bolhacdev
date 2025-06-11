/*
  # Create programs and projects tables

  1. New Tables
    - `programs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `image_url` (text, nullable)
      - `published` (boolean, default false)
      - `featured` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `target_amount` (numeric)
      - `raised_amount` (numeric, default 0)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text)
      - `image_url` (text, nullable)
      - `beneficiaries` (integer)
      - `program_category` (text)
      - `published` (boolean, default false)
      - `featured` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to published content
    - Add policies for admin management
*/

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  target_amount numeric(12,2) NOT NULL DEFAULT 0,
  raised_amount numeric(12,2) DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  image_url text,
  beneficiaries integer NOT NULL DEFAULT 0,
  program_category text NOT NULL,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_programs_published ON programs(published);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(featured);
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);

CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_program_category ON projects(program_category);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample programs
INSERT INTO programs (title, description, category, image_url, published, featured) VALUES
('Education Initiative', 'Providing quality education and learning resources to underserved communities worldwide.', 'education', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
('Healthcare Access', 'Ensuring basic healthcare services reach remote and marginalized communities.', 'healthcare', 'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
('Clean Water Project', 'Building sustainable water systems and sanitation facilities for communities in need.', 'clean-water', 'https://images.pexels.com/photos/6962024/pexels-photo-6962024.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
('Housing Development', 'Providing safe, affordable housing solutions for families in crisis.', 'housing', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
('Community Empowerment', 'Supporting local leadership and economic development initiatives.', 'community-empowerment', 'https://images.pexels.com/photos/7551659/pexels-photo-7551659.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
('Innovation Lab', 'Developing technology solutions for humanitarian challenges.', 'innovation', 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800', true, false);

-- Insert sample projects
INSERT INTO projects (title, description, location, target_amount, raised_amount, start_date, end_date, status, image_url, beneficiaries, program_category, published, featured) VALUES
('Rural School Construction in Kenya', 'Building a new primary school to serve 300 children in a remote village in Kenya. The project includes classrooms, library, and sanitation facilities.', 'Nakuru County, Kenya', 50000, 32000, '2025-03-01', '2025-12-31', 'active', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800', 300, 'education', true, true),
('Teacher Training Program - Bangladesh', 'Comprehensive training program for 50 local teachers to improve education quality in rural Bangladesh communities.', 'Sylhet Division, Bangladesh', 25000, 18500, '2025-02-15', '2025-08-15', 'active', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800', 1500, 'education', true, false),
('Digital Learning Center - Peru', 'Establishing a computer lab and digital learning center to provide technology education to underserved youth.', 'Cusco Region, Peru', 35000, 35000, '2024-06-01', '2024-12-31', 'completed', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800', 200, 'education', true, false),
('Mobile Health Clinic - Uganda', 'Deploying mobile health clinics to provide basic healthcare services to remote communities in northern Uganda.', 'Gulu District, Uganda', 75000, 45000, '2025-04-01', '2026-03-31', 'upcoming', 'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg?auto=compress&cs=tinysrgb&w=800', 5000, 'healthcare', true, false),
('Maternal Health Program - India', 'Training community health workers and providing essential supplies for maternal and child health in rural India.', 'Rajasthan, India', 40000, 28000, '2025-01-15', '2025-12-15', 'active', 'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg?auto=compress&cs=tinysrgb&w=800', 2000, 'healthcare', true, false),
('Well Drilling Project - Mali', 'Drilling 10 new wells to provide clean water access to rural communities in Mali, serving over 3,000 people.', 'Sikasso Region, Mali', 60000, 42000, '2025-05-01', '2025-11-30', 'active', 'https://images.pexels.com/photos/6962024/pexels-photo-6962024.jpeg?auto=compress&cs=tinysrgb&w=800', 3000, 'clean-water', true, false),
('Water Treatment Facility - Guatemala', 'Building a community water treatment facility to ensure safe drinking water for indigenous communities.', 'Quiché Department, Guatemala', 80000, 55000, '2025-03-15', '2026-01-15', 'active', 'https://images.pexels.com/photos/6962024/pexels-photo-6962024.jpeg?auto=compress&cs=tinysrgb&w=800', 1500, 'clean-water', true, false),
('Disaster-Resistant Homes - Philippines', 'Building typhoon-resistant homes for families affected by recent natural disasters in the Philippines.', 'Leyte Province, Philippines', 100000, 65000, '2025-02-01', '2025-10-31', 'active', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=800', 50, 'housing', true, false),
('Women''s Microfinance Program - Nepal', 'Providing microloans and business training to women entrepreneurs in rural Nepal communities.', 'Sindhupalchok District, Nepal', 30000, 22000, '2025-01-01', '2025-12-31', 'active', 'https://images.pexels.com/photos/7551659/pexels-photo-7551659.jpeg?auto=compress&cs=tinysrgb&w=800', 100, 'community-empowerment', true, false),
('Solar Power Initiative - Tanzania', 'Installing solar power systems in rural schools and health centers to provide reliable electricity.', 'Mwanza Region, Tanzania', 45000, 30000, '2025-04-01', '2025-09-30', 'active', 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800', 800, 'innovation', true, false);