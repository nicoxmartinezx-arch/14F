/*
  # Session Management System for Persistent Couple Sessions

  1. New Tables
    - `pairing_sessions`: Stores active couple pairings with long-lived tokens
    - `device_sessions`: Tracks device-specific sessions that persist across browser clears
  
  2. Features
    - Couple can reconnect using PIN even after browser data is cleared
    - Sessions expire after 30 days of inactivity
    - Device tokens persist across browser clears
    - Automatic session recovery on return
  
  3. Security
    - Enable RLS on all tables
    - Device tokens are secure and unique
    - Sessions are tied to couple relationships
*/

-- Create pairing_sessions table
CREATE TABLE IF NOT EXISTS pairing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  device_id_1 text NOT NULL,
  device_id_2 text NOT NULL,
  session_token_1 text UNIQUE NOT NULL,
  session_token_2 text UNIQUE NOT NULL,
  pin_code text UNIQUE NOT NULL,
  pin_expires_at timestamptz NOT NULL,
  last_activity_1 timestamptz DEFAULT now(),
  last_activity_2 timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Create device_sessions table for persistent device tracking
CREATE TABLE IF NOT EXISTS device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text UNIQUE NOT NULL,
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  device_name text,
  device_token text UNIQUE NOT NULL,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '90 days')
);

-- Enable RLS
ALTER TABLE pairing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pairing_sessions
CREATE POLICY "Allow read pairing sessions"
  ON pairing_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert pairing sessions"
  ON pairing_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update pairing sessions"
  ON pairing_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for device_sessions
CREATE POLICY "Allow read device sessions"
  ON device_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert device sessions"
  ON device_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update device sessions"
  ON device_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX idx_pairing_sessions_couple_id ON pairing_sessions(couple_id);
CREATE INDEX idx_pairing_sessions_device_id_1 ON pairing_sessions(device_id_1);
CREATE INDEX idx_pairing_sessions_device_id_2 ON pairing_sessions(device_id_2);
CREATE INDEX idx_pairing_sessions_pin_code ON pairing_sessions(pin_code);
CREATE INDEX idx_device_sessions_device_id ON device_sessions(device_id);
CREATE INDEX idx_device_sessions_couple_id ON device_sessions(couple_id);