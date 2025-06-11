/*
  # Add INSERT policy for profiles table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile
    - Policy ensures users can only create a profile with their own auth.uid()

  This fixes the "new row violates row-level security policy" error that occurs
  during user registration when trying to create a profile record.
*/

-- Add policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);