-- Add page background settings if they don't exist
INSERT INTO site_settings (key, value, description, is_public)
VALUES 
  ('page_bg_home', '#ffffff', 'Home page background color', true),
  ('page_bg_about', '#ffffff', 'About page background color', true),
  ('page_bg_programs', '#ffffff', 'Programs page background color', true),
  ('page_bg_events', '#ffffff', 'Events page background color', true),
  ('page_bg_donate', '#ffffff', 'Donate page background color', true),
  ('page_bg_contact', '#ffffff', 'Contact page background color', true)
ON CONFLICT (key) DO NOTHING;