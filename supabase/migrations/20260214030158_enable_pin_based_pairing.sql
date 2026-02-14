/*
  # Enable PIN-based Pairing without Authentication

  1. Changes
    - Update RLS policies to allow unauthenticated PIN operations
    - Simplified access control for device-based pairing
  
  2. Security
    - PIN is stored with expiration timestamp
    - Removed email-based recipient tracking
    - Allow creation without auth for PIN generation
*/

-- Update invitations policy for public PIN access
DROP POLICY IF EXISTS "Allow authenticated users to create invitations" ON couple_invitations;

CREATE POLICY "Allow PIN creation without auth"
  ON couple_invitations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow reading invitations by code"
  ON couple_invitations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow updating invitations by code"
  ON couple_invitations
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Update couples policy for device-based access
DROP POLICY IF EXISTS "Allow authenticated users to create couples" ON couples;

CREATE POLICY "Allow couple creation by devices"
  ON couples
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to view their couples" ON couples;

CREATE POLICY "Allow viewing couples"
  ON couples
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update couples" ON couples;

CREATE POLICY "Allow couple updates"
  ON couples
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);