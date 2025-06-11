/*
  # Add missing page background settings

  1. New Settings
    - Add default page background settings for all main pages
    - Ensures no PGRST116 errors when fetching page backgrounds
  
  2. Settings Added
    - page_bg_home: Default home page background
    - page_bg_about: About page background  
    - page_bg_programs: Programs page background
    - page_bg_events: Events page background
    - page_bg_contact: Contact page background
    - page_bg_login: Login page background
    - page_bg_register: Register page background
    - page_bg_donate: Donate page background
*/

-- Insert default page background settings
INSERT INTO site_settings (key, value, description, is_public) VALUES
  ('page_bg_home', '', 'Home page background image URL', true),
  ('page_bg_about', '', 'About page background image URL', true),
  ('page_bg_programs', '', 'Programs page background image URL', true),
  ('page_bg_events', '', 'Events page background image URL', true),
  ('page_bg_contact', '', 'Contact page background image URL', true),
  ('page_bg_login', '', 'Login page background image URL', true),
  ('page_bg_register', '', 'Register page background image URL', true),
  ('page_bg_donate', '', 'Donate page background image URL', true)
ON CONFLICT (key) DO NOTHING;

-- Add email confirmation setting (disabled by default for easier development)
INSERT INTO site_settings (key, value, description, is_public) VALUES
  ('email_confirmation_required', 'false', 'Whether email confirmation is required for new users', false)
ON CONFLICT (key) DO NOTHING;