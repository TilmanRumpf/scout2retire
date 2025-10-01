-- Fix users table RLS: Allow users to SELECT their own data (including is_admin field)
-- This is required for QuickNav admin menu to work

-- Drop existing SELECT policy if any
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Create policy allowing users to read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Note: is_admin field is now visible to users when reading their own profile
-- This is safe because users can only read their own data, not modify is_admin