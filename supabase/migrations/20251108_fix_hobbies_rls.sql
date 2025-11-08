-- Fix RLS for hobbies and towns_hobbies tables
-- Allow authenticated and anon users to read hobbies data

-- Enable RLS on hobbies table
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to hobbies" ON hobbies;
DROP POLICY IF EXISTS "Allow authenticated read access to hobbies" ON hobbies;

-- Create read policy for hobbies (public can read)
CREATE POLICY "Allow public read access to hobbies"
ON hobbies FOR SELECT
TO anon, authenticated
USING (true);

-- Enable RLS on towns_hobbies table
ALTER TABLE towns_hobbies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to towns_hobbies" ON towns_hobbies;
DROP POLICY IF EXISTS "Allow authenticated read access to towns_hobbies" ON towns_hobbies;

-- Create read policy for towns_hobbies (public can read)
CREATE POLICY "Allow public read access to towns_hobbies"
ON towns_hobbies FOR SELECT
TO anon, authenticated
USING (true);
