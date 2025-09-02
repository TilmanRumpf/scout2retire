-- IMMEDIATE FIX FOR ADMIN ACCESS
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new

-- Step 1: Add the is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Grant admin access to all designated admins
UPDATE users SET is_admin = true WHERE email IN (
  'tobiasrumpf@gmx.de',
  'tilman.rumpf@gmail.com', 
  'tobias.rumpf1@gmail.com', 
  'madara.grisule@gmail.com'
);

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Step 4: Verify it worked
SELECT 
  email,
  full_name,
  is_admin,
  created_at
FROM users 
WHERE is_admin = true
ORDER BY email;

-- Expected result: Should show 4 rows with all admins having is_admin = true