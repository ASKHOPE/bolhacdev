/*
  # Add Stripe session ID to donations table

  1. Changes
    - Add `stripe_session_id` column to donations table
    - Add index for faster lookups
    - Update RLS policies if needed

  2. Security
    - Maintain existing RLS policies
*/

-- Add stripe_session_id column to donations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE donations ADD COLUMN stripe_session_id text;
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_donations_stripe_session_id 
ON donations(stripe_session_id);

-- Add unique constraint to prevent duplicate session processing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'donations' AND constraint_name = 'donations_stripe_session_id_key'
  ) THEN
    ALTER TABLE donations ADD CONSTRAINT donations_stripe_session_id_key UNIQUE (stripe_session_id);
  END IF;
END $$;