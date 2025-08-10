-- Fix Row Level Security for towns table to allow admin updates
-- Run this in your Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'towns';

-- Step 2: Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'towns';

-- Step 3: Drop any existing restrictive policies (if needed)
-- Uncomment if you want to start fresh:
-- DROP POLICY IF EXISTS "Enable read access for all users" ON towns;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON towns;
-- DROP POLICY IF EXISTS "Enable update for users based on email" ON towns;

-- Step 4: Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Admin full access to towns" ON towns;
DROP POLICY IF EXISTS "All users can view towns" ON towns;

-- Create comprehensive admin policy
-- This allows full access to admin users
CREATE POLICY "Admin full access to towns" ON towns
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'tilman.rumpf@gmail.com',
    'tobias.rumpf1@gmail.com',
    'madara.grisule@gmail.com'
  )
)
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'tilman.rumpf@gmail.com',
    'tobias.rumpf1@gmail.com',
    'madara.grisule@gmail.com'
  )
);

-- Step 5: Create read-only policy for all authenticated users
CREATE POLICY "All users can view towns" ON towns
FOR SELECT
TO authenticated
USING (true);

-- Step 6: Verify the policies were created
SELECT * FROM pg_policies WHERE tablename = 'towns';

-- Alternative: If you just want to disable RLS for development
-- ALTER TABLE towns DISABLE ROW LEVEL SECURITY;