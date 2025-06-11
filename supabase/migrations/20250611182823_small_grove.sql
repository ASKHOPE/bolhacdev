/*
  # Fix profiles table RLS policies

  1. Changes
    - Add INSERT policy for authenticated users to create their own profile
    - Ensure all policies are properly configured for security
*/

-- Add INSERT policy for authenticated users to create their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);