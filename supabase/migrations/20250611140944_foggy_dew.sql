/*
  # Recreate profiles table without foreign key constraint

  1. Drop existing profiles table
  2. Recreate profiles table without foreign key to auth.users
  3. Set up RLS policies
  4. Create demo user profiles
  5. Add trigger for updated_at

  This approach removes the dependency on auth.users existing first,
  allowing profiles to be created independently.
*/

-- Drop existing profiles table and related objects
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate the profiles table without foreign key constraint
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'user'::user_role,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert demo admin profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@hopefoundation.org',
  'Demo Administrator',
  'admin',
  now(),
  now()
);

-- Insert demo user profile  
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'user@hopefoundation.org',
  'Demo User',
  'user',
  now(),
  now()
);