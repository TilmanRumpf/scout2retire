-- Add message column to user_connections table
ALTER TABLE user_connections 
ADD COLUMN IF NOT EXISTS message TEXT;

-- Update the search function (if needed)
-- The existing function should still work