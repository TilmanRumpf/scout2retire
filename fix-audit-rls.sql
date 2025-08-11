-- Fix RLS policies for audit_data column updates
-- This ensures admin users can update the audit_data field

-- First, check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'towns';

-- Check existing policies
SELECT polname, polcmd, polroles, polqual, polwithcheck 
FROM pg_policy 
WHERE polrelid = 'towns'::regclass;

-- Drop existing admin policy if it exists
DROP POLICY IF EXISTS "Admin full access to towns" ON towns;

-- Create a new comprehensive admin policy that explicitly allows audit_data updates
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

-- Ensure the read policy exists for all authenticated users
DROP POLICY IF EXISTS "All users can view towns" ON towns;
CREATE POLICY "All users can view towns" ON towns
FOR SELECT
TO authenticated
USING (true);

-- Verify the policies were created
SELECT polname, polcmd, polroles, polqual, polwithcheck 
FROM pg_policy 
WHERE polrelid = 'towns'::regclass;

-- Test: Try to update audit_data for a specific town (replace with actual town ID)
-- UPDATE towns 
-- SET audit_data = '{"test_field": {"approved": true, "approvedBy": "test@example.com"}}'::jsonb
-- WHERE id = 1
-- RETURNING id, name, audit_data;