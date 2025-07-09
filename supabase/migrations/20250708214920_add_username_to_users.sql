-- Add username column to users table
-- This migration adds username support for user profiles

-- Add username column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add a constraint to ensure usernames follow valid format
-- Usernames must be 3-20 characters, alphanumeric with underscores
ALTER TABLE users 
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR 
  (length(username) >= 3 AND 
   length(username) <= 20 AND 
   username ~ '^[a-zA-Z0-9_]+$')
);

-- Update RLS policies to include username in user profile queries
-- This ensures users can read and update their own username

-- Drop existing select policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create new policy that includes username access
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Drop existing update policy if it exists  
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policy for updating own profile including username
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add comment to document the column
COMMENT ON COLUMN users.username IS 'Unique username for the user, following format: 3-20 chars, alphanumeric and underscores only';