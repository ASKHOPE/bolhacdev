-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirm the user's email
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id;
  
  -- Insert into profiles table when a new user is created
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile and confirm email for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default page backgrounds for all pages to prevent 406 errors
INSERT INTO site_settings (key, value, description, is_public)
VALUES 
  ('page_bg_home', '', 'Home page background', true),
  ('page_bg_about', '', 'About page background', true),
  ('page_bg_programs', '', 'Programs page background', true),
  ('page_bg_events', '', 'Events page background', true),
  ('page_bg_donate', '', 'Donate page background', true),
  ('page_bg_contact', '', 'Contact page background', true),
  ('page_bg_login', '', 'Login page background', true),
  ('page_bg_register', '', 'Register page background', true),
  ('page_bg_dashboard', '', 'Dashboard page background', true)
ON CONFLICT (key) DO NOTHING;