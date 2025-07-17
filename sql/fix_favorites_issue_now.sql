-- IMMEDIATE FIX for Tobias Rumpf's favorites error
-- Run this in Supabase SQL Editor

-- 1. Check which tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'favorites') as favorites_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'saved_locations') as saved_locations_exists;

-- 2. Check the actual foreign key constraint that's failing
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    a.attname AS column_name,
    confrelid::regclass AS references_table,
    af.attname AS references_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.conname = 'favorites_user_id_fkey';

-- 3. Quick fix - Drop and recreate the constraint to reference auth.users
BEGIN;

-- Drop the existing constraint if it exists
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

-- Add the correct constraint referencing auth.users
ALTER TABLE favorites 
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

COMMIT;

-- 4. Verify the fix worked
SELECT 
    'Fixed!' as status,
    conname AS constraint_name,
    confrelid::regclass AS now_references
FROM pg_constraint 
WHERE conname = 'favorites_user_id_fkey';

-- 5. Test with Tobias's user
-- Check if user exists in auth.users
SELECT id, email 
FROM auth.users 
WHERE email LIKE '%tobias%' OR email LIKE '%rumpf%';