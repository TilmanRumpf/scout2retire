-- Add avatar_favorites column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_favorites JSONB DEFAULT '[]'::jsonb;