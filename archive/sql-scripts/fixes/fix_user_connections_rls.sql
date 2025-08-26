-- Fix RLS policies for user_connections table to allow cancellation

-- First, check if the table exists
-- user_connections table should have: id, user_id, friend_id, status, created_at, message

-- Enable RLS on the table
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own connections" ON user_connections;
DROP POLICY IF EXISTS "Users can create their own connections" ON user_connections;
DROP POLICY IF EXISTS "Users can update their own sent connections" ON user_connections;
DROP POLICY IF EXISTS "Users can delete their own sent connections" ON user_connections;
DROP POLICY IF EXISTS "Users can update received connections" ON user_connections;

-- Create new policies

-- Users can view connections where they are involved
CREATE POLICY "Users can view their own connections" ON user_connections
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create connections
CREATE POLICY "Users can create their own connections" ON user_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sent connections (for cancelling)
CREATE POLICY "Users can update their own sent connections" ON user_connections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sent connections
CREATE POLICY "Users can delete their own sent connections" ON user_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can update received connections (for accepting/declining)
CREATE POLICY "Users can update received connections" ON user_connections
  FOR UPDATE
  USING (auth.uid() = friend_id)
  WITH CHECK (auth.uid() = friend_id);

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_friend ON user_connections(user_id, friend_id);

-- Optional: Clean up any orphaned cancelled connections older than 30 days
-- DELETE FROM user_connections 
-- WHERE status = 'cancelled' 
-- AND created_at < NOW() - INTERVAL '30 days';