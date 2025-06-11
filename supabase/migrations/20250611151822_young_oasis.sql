/*
  # Add INSERT policy for events table

  1. Security Changes
    - Add INSERT policy for admins on events table
    - This allows admin users to create new events through the admin interface

  The existing policies cover SELECT and general management (ALL) but are missing
  a specific INSERT policy for admin users, causing RLS violations when creating events.
*/

-- Add INSERT policy for admins to create events
CREATE POLICY "Admins can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );