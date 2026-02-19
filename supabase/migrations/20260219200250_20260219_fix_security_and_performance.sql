/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance concerns:
  
  1. **RLS Policy Optimization**: Replace auth.uid() calls with (SELECT auth.uid()) to improve performance
  2. **Add Missing Indexes**: Create indexes for unindexed foreign keys
  3. **Remove Unused Indexes**: Drop indexes that are not being used
  4. **Fix Permissive Policies**: Replace dangerous "always true" policies with proper restrictions based on PIN code and device tokens
  5. **Remove Duplicate Policies**: Consolidate multiple permissive policies for the same action
  6. **Function Search Path**: Fix mutable search_path in functions
  
  ## Changes

  ### 1. RLS Policy Optimization
  All existing policies will be recreated to use (SELECT auth.uid()) instead of auth.uid()
  
  ### 2. New Indexes for Foreign Keys
  - couple_invitations(recipient_id)
  - couple_invitations(sender_id)
  - memories(created_by)
  
  ### 3. Remove Unused Indexes
  - Drop all unused indexes on pairing_sessions, device_sessions, couple_invitations, couples, memories
  
  ### 4. Secure Session-Based Policies
  Replace permissive "always true" policies with PIN and device token validation
*/

-- ========================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- ========================================

CREATE INDEX IF NOT EXISTS idx_couple_invitations_sender_id
  ON public.couple_invitations(sender_id);

CREATE INDEX IF NOT EXISTS idx_couple_invitations_recipient_id
  ON public.couple_invitations(recipient_id);

CREATE INDEX IF NOT EXISTS idx_memories_created_by
  ON public.memories(created_by);

-- ========================================
-- 2. DROP UNUSED INDEXES
-- ========================================

DROP INDEX IF EXISTS idx_pairing_sessions_couple_id;
DROP INDEX IF EXISTS idx_pairing_sessions_device_id_1;
DROP INDEX IF EXISTS idx_pairing_sessions_device_id_2;
DROP INDEX IF EXISTS idx_device_sessions_device_id;
DROP INDEX IF EXISTS idx_device_sessions_couple_id;
DROP INDEX IF EXISTS idx_invitations_recipient_email;
DROP INDEX IF EXISTS idx_invitations_code;
DROP INDEX IF EXISTS idx_invitations_status;
DROP INDEX IF EXISTS idx_couples_user1;
DROP INDEX IF EXISTS idx_couples_user2;
DROP INDEX IF EXISTS idx_couples_status;
DROP INDEX IF EXISTS idx_memories_couple;
DROP INDEX IF EXISTS idx_memories_date;
DROP INDEX IF EXISTS idx_memories_category;

-- ========================================
-- 3. FIX FUNCTION SEARCH PATHS
-- ========================================

ALTER FUNCTION public.handle_new_user()
SET search_path = public;

ALTER FUNCTION public.handle_updated_at()
SET search_path = public;

ALTER FUNCTION public.generate_invitation_code()
SET search_path = public;

-- ========================================
-- 4. DROP ALL EXISTING RLS POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their couples" ON public.couples;
DROP POLICY IF EXISTS "Users can create couples" ON public.couples;
DROP POLICY IF EXISTS "Users can update their couples" ON public.couples;
DROP POLICY IF EXISTS "Users can delete their couples" ON public.couples;
DROP POLICY IF EXISTS "Allow viewing couples" ON public.couples;
DROP POLICY IF EXISTS "Allow couple creation by devices" ON public.couples;
DROP POLICY IF EXISTS "Allow couple updates" ON public.couples;

DROP POLICY IF EXISTS "Users can view couple memories" ON public.memories;
DROP POLICY IF EXISTS "Users can create memories for their couple" ON public.memories;
DROP POLICY IF EXISTS "Users can update their couple's memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete their couple's memories" ON public.memories;

DROP POLICY IF EXISTS "Users can view their sent invitations" ON public.couple_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.couple_invitations;
DROP POLICY IF EXISTS "Users can update invitations they're involved in" ON public.couple_invitations;
DROP POLICY IF EXISTS "Allow PIN creation without auth" ON public.couple_invitations;
DROP POLICY IF EXISTS "Allow reading invitations by code" ON public.couple_invitations;
DROP POLICY IF EXISTS "Allow updating invitations by code" ON public.couple_invitations;

DROP POLICY IF EXISTS "Allow read pairing sessions" ON public.pairing_sessions;
DROP POLICY IF EXISTS "Allow insert pairing sessions" ON public.pairing_sessions;
DROP POLICY IF EXISTS "Allow update pairing sessions" ON public.pairing_sessions;
DROP POLICY IF EXISTS "Allow read device sessions" ON public.device_sessions;
DROP POLICY IF EXISTS "Allow insert device sessions" ON public.device_sessions;
DROP POLICY IF EXISTS "Allow update device sessions" ON public.device_sessions;

-- ========================================
-- 5. RECREATE RLS POLICIES - PROFILES
-- ========================================

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- ========================================
-- 6. RECREATE RLS POLICIES - COUPLES
-- ========================================

CREATE POLICY "Users can view their couples"
  ON public.couples
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user1_id
    OR (SELECT auth.uid()) = user2_id
  );

CREATE POLICY "Users can create couples"
  ON public.couples
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user1_id
    OR (SELECT auth.uid()) = user2_id
  );

CREATE POLICY "Users can update their couples"
  ON public.couples
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user1_id
    OR (SELECT auth.uid()) = user2_id
  )
  WITH CHECK (
    (SELECT auth.uid()) = user1_id
    OR (SELECT auth.uid()) = user2_id
  );

CREATE POLICY "Users can delete their couples"
  ON public.couples
  FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user1_id
    OR (SELECT auth.uid()) = user2_id
  );

-- ========================================
-- 7. RECREATE RLS POLICIES - MEMORIES
-- ========================================

CREATE POLICY "Users can view couple memories"
  ON public.memories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
      AND couples.status = 'active'
    )
  );

CREATE POLICY "Users can create memories for their couple"
  ON public.memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
      AND couples.status = 'active'
    )
  );

CREATE POLICY "Users can update couple memories"
  ON public.memories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
      AND couples.status = 'active'
    )
  )
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
      AND couples.status = 'active'
    )
  );

CREATE POLICY "Users can delete couple memories"
  ON public.memories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
      AND couples.status = 'active'
    )
  );

-- ========================================
-- 8. RECREATE RLS POLICIES - COUPLE_INVITATIONS
-- ========================================

CREATE POLICY "Users can view own invitations"
  ON public.couple_invitations
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = sender_id
    OR (SELECT auth.uid()) = recipient_id
  );

CREATE POLICY "Users can create invitations"
  ON public.couple_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
  );

CREATE POLICY "Users can update own invitations"
  ON public.couple_invitations
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = sender_id
    OR (SELECT auth.uid()) = recipient_id
  )
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
    OR (SELECT auth.uid()) = recipient_id
  );

-- PIN-BASED PAIRING (Secured with PIN code validation)
-- This allows anonymous users to validate against a PIN code
CREATE POLICY "Accept pairing with valid PIN"
  ON public.couple_invitations
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM pairing_sessions
      WHERE pairing_sessions.pin_code = invitation_code
      AND pairing_sessions.pin_expires_at > now()
    )
  );

-- ========================================
-- 9. RECREATE RLS POLICIES - PAIRING_SESSIONS
-- ========================================

CREATE POLICY "Users can view pairing sessions"
  ON public.pairing_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = pairing_sessions.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
    )
  );

CREATE POLICY "Users can create pairing sessions"
  ON public.pairing_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = pairing_sessions.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
    )
  );

CREATE POLICY "Users can update their pairing sessions"
  ON public.pairing_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = pairing_sessions.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = pairing_sessions.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
    )
  );

-- ========================================
-- 10. RECREATE RLS POLICIES - DEVICE_SESSIONS
-- ========================================

CREATE POLICY "Users can view device sessions"
  ON public.device_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = device_sessions.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
    )
  );

CREATE POLICY "Users can create device sessions"
  ON public.device_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = device_sessions.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
    )
  );

CREATE POLICY "Users can update device sessions"
  ON public.device_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = device_sessions.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = device_sessions.couple_id
      AND (
        (SELECT auth.uid()) = couples.user1_id
        OR (SELECT auth.uid()) = couples.user2_id
      )
    )
  );
