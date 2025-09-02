-- Add is_admin column to users table for admin access control
-- Migration: 20250830_add_admin_column.sql
-- Description: Adds is_admin boolean column with default false, then grants admin access to designated users

-- Add the is_admin column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Grant admin access to designated admin users
UPDATE users SET is_admin = true WHERE email IN (
  'tobiasrumpf@gmx.de',
  'tilman.rumpf@gmail.com', 
  'tobias.rumpf1@gmail.com', 
  'madara.grisule@gmail.com'
);

-- Create index on is_admin for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Add comment to document the column
COMMENT ON COLUMN users.is_admin IS 'Boolean flag indicating if user has admin privileges';