/*
  # Add site settings for dynamic site name and theme

  1. New Settings
    - Add default site settings for site name, description, and contact info
    - Add theme settings for colors, fonts, and visual appearance
    - Add maintenance mode settings
  
  2. Security
    - Make some settings public, others private
*/

-- Add site name if it doesn't exist
INSERT INTO site_settings (key, value, description, is_public)
VALUES ('site_name', 'HopeFoundation', 'The name of the organization', true)
ON CONFLICT (key) DO NOTHING;

-- Add site description if it doesn't exist
INSERT INTO site_settings (key, value, description, is_public)
VALUES ('site_description', 'Creating positive change in communities worldwide through education, healthcare, and sustainable development programs.', 'Brief description of the organization', true)
ON CONFLICT (key) DO NOTHING;

-- Add contact information if it doesn't exist
INSERT INTO site_settings (key, value, description, is_public)
VALUES 
  ('contact_email', 'info@hopefoundation.org', 'Primary contact email', true),
  ('contact_phone', '+1 (555) 123-4567', 'Primary contact phone', true),
  ('contact_address', '123 Hope Street, City, State 12345', 'Organization physical address', true)
ON CONFLICT (key) DO NOTHING;

-- Add social media links if they don't exist
INSERT INTO site_settings (key, value, description, is_public)
VALUES 
  ('facebook_url', 'https://facebook.com/hopefoundation', 'Facebook page URL', true),
  ('twitter_url', 'https://twitter.com/hopefoundation', 'Twitter profile URL', true),
  ('instagram_url', 'https://instagram.com/hopefoundation', 'Instagram profile URL', true),
  ('linkedin_url', 'https://linkedin.com/company/hopefoundation', 'LinkedIn company page URL', true),
  ('youtube_url', 'https://youtube.com/c/hopefoundation', 'YouTube channel URL', true)
ON CONFLICT (key) DO NOTHING;

-- Add theme settings if they don't exist
INSERT INTO site_settings (key, value, description, is_public)
VALUES 
  ('theme_mode', 'light', 'Theme mode (light, dark, auto)', false),
  ('theme_primary_color', '#2563eb', 'Primary brand color', false),
  ('theme_secondary_color', '#64748b', 'Secondary brand color', false),
  ('theme_accent_color', '#7c3aed', 'Accent color for highlights', false),
  ('theme_background', '#ffffff', 'Background color', false),
  ('theme_surface', '#f8fafc', 'Surface color for cards and elements', false),
  ('theme_text', '#1e293b', 'Main text color', false),
  ('theme_text_secondary', '#64748b', 'Secondary text color', false),
  ('theme_border', '#e2e8f0', 'Border color', false),
  ('theme_success', '#059669', 'Success color', false),
  ('theme_warning', '#d97706', 'Warning color', false),
  ('theme_error', '#dc2626', 'Error color', false),
  ('theme_info', '#0284c7', 'Info color', false),
  ('theme_border_radius', 'medium', 'Border radius size (none, small, medium, large)', false),
  ('theme_font_size', 'medium', 'Base font size (small, medium, large)', false),
  ('theme_font_family', 'Inter, system-ui, sans-serif', 'Font family', false),
  ('theme_animations', 'true', 'Enable animations', false),
  ('theme_shadows', 'true', 'Enable shadows', false)
ON CONFLICT (key) DO NOTHING;

-- Add maintenance mode settings if they don't exist
INSERT INTO site_settings (key, value, description, is_public)
VALUES 
  ('maintenance_enabled', 'false', 'Enable maintenance mode', false),
  ('maintenance_mode', 'full', 'Maintenance mode type (full, partial)', false),
  ('maintenance_excluded_pages', '["\/admin", "\/login"]', 'Pages excluded from maintenance mode', false),
  ('maintenance_message', 'We are currently performing scheduled maintenance to improve your experience.', 'Message shown during maintenance', false),
  ('maintenance_estimated_time', '2 hours', 'Estimated completion time', false),
  ('maintenance_allow_admin', 'true', 'Allow admin access during maintenance', false)
ON CONFLICT (key) DO NOTHING;