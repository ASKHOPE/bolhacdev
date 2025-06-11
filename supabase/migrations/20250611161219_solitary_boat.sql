/*
  # Add gallery columns to projects table

  1. Changes
    - Add `image_gallery` column (jsonb array) to store multiple project images
    - Add `show_gallery` column (boolean) to control gallery visibility
  
  2. Security
    - No RLS changes needed as projects table inherits existing security model
*/

-- Add image_gallery column to store array of image URLs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'image_gallery'
  ) THEN
    ALTER TABLE projects ADD COLUMN image_gallery jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add show_gallery column to control gallery visibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'show_gallery'
  ) THEN
    ALTER TABLE projects ADD COLUMN show_gallery boolean DEFAULT true;
  END IF;
END $$;

-- Add index for gallery queries
CREATE INDEX IF NOT EXISTS idx_projects_show_gallery ON projects (show_gallery);