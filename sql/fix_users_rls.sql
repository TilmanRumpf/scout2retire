-- Fix RLS policies for users table to allow users to see each other

-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies

-- Allow all authenticated users to view other users (for companion discovery)
CREATE POLICY "Users can view all users" ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: INSERT is handled by Supabase Auth, so we don't need a policy for it
-- Note: DELETE should be restricted, so we don't create a policy for it