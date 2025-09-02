-- ADMIN SETUP COMMANDS
-- Execute these commands in Supabase Dashboard → SQL Editor

-- Step 1: Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Grant admin access to designated users
UPDATE users SET is_admin = true WHERE email IN (
  'tobiasrumpf@gmx.de',
  'tilman.rumpf@gmail.com', 
  'tobias.rumpf1@gmail.com', 
  'madara.grisule@gmail.com'
);

-- Step 3: Create index for better admin query performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Step 4: Add documentation comment
COMMENT ON COLUMN users.is_admin IS 'Boolean flag indicating if user has admin privileges';

-- Step 5: Verify the changes
SELECT email, full_name, is_admin, created_at 
FROM users 
WHERE is_admin = true 
ORDER BY email;