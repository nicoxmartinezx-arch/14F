/*
  # Memory Book Schema - Digital Couple's Memory Calendar
  
  ## Overview
  This schema supports a romantic memory book application where couples can
  create and share daily memories together, similar to an advent calendar.
  
  ## Tables Created
  
  ### 1. profiles
  Extends auth.users with additional user information
  - `id` (uuid, FK to auth.users) - User's unique identifier
  - `email` (text) - User's email address
  - `full_name` (text) - User's display name
  - `avatar_url` (text, optional) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. couples
  Represents the relationship between two users
  - `id` (uuid, PK) - Unique couple identifier
  - `user1_id` (uuid, FK to profiles) - First partner
  - `user2_id` (uuid, FK to profiles) - Second partner
  - `couple_name` (text) - Custom name for the couple
  - `anniversary_date` (date, optional) - Special date for the couple
  - `created_at` (timestamptz) - When couple was formed
  - `status` (text) - active, pending, or ended
  
  ### 3. memories
  Stores individual memories created by the couple
  - `id` (uuid, PK) - Unique memory identifier
  - `couple_id` (uuid, FK to couples) - Which couple this belongs to
  - `created_by` (uuid, FK to profiles) - Who created this memory
  - `title` (text) - Memory title
  - `description` (text, optional) - Detailed description
  - `memory_date` (date) - The date this memory represents
  - `image_url` (text, optional) - Optional image for the memory
  - `category` (text) - Type of memory (date, gift, trip, milestone, etc.)
  - `is_favorite` (boolean) - Star/favorite flag
  - `created_at` (timestamptz) - When memory was created
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. couple_invitations
  Manages invitations to form couples
  - `id` (uuid, PK) - Unique invitation identifier
  - `sender_id` (uuid, FK to profiles) - Who sent the invitation
  - `recipient_email` (text) - Email of the person being invited
  - `recipient_id` (uuid, FK to profiles, optional) - Set when recipient joins
  - `status` (text) - pending, accepted, rejected, expired
  - `invitation_code` (text, unique) - Unique code to accept invitation
  - `expires_at` (timestamptz) - Expiration date
  - `created_at` (timestamptz) - When invitation was sent
  
  ## Security
  
  Row Level Security (RLS) is enabled on all tables with policies that ensure:
  - Users can only see their own profile
  - Users can only see couples they're part of
  - Users can only see memories from their couple
  - Users can manage their own invitations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_name text NOT NULL DEFAULT 'Our Memory Book',
  anniversary_date date,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'ended')),
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT unique_couple UNIQUE (user1_id, user2_id)
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  memory_date date NOT NULL,
  image_url text,
  category text NOT NULL DEFAULT 'moment' CHECK (category IN ('date', 'gift', 'trip', 'milestone', 'moment', 'surprise', 'celebration')),
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create couple_invitations table
CREATE TABLE IF NOT EXISTS couple_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  invitation_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_couples_user1 ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2 ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_status ON couples(status);
CREATE INDEX IF NOT EXISTS idx_memories_couple ON memories(couple_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(memory_date);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_invitations_recipient_email ON couple_invitations(recipient_email);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON couple_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON couple_invitations(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_invitations ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Couples RLS Policies
CREATE POLICY "Users can view their couples"
  ON couples FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create couples"
  ON couples FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their couples"
  ON couples FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their couples"
  ON couples FOR DELETE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Memories RLS Policies
CREATE POLICY "Users can view couple memories"
  ON memories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
      AND couples.status = 'active'
    )
  );

CREATE POLICY "Users can create memories for their couple"
  ON memories FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
      AND couples.status = 'active'
    )
  );

CREATE POLICY "Users can update their couple's memories"
  ON memories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
      AND couples.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
      AND couples.status = 'active'
    )
  );

CREATE POLICY "Users can delete their couple's memories"
  ON memories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = memories.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
      AND couples.status = 'active'
    )
  );

-- Couple Invitations RLS Policies
CREATE POLICY "Users can view their sent invitations"
  ON couple_invitations FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create invitations"
  ON couple_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update invitations they're involved in"
  ON couple_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_memories ON memories;
CREATE TRIGGER set_updated_at_memories
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
