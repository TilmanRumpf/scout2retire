-- Fix RLS policies for user_connections table to ensure recipients can see invitations sent TO them

-- First, let's check the current state
SELECT 'Current RLS policies:' as step;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'user_connections';

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own connections" ON user_connections;

-- Create a new SELECT policy that explicitly allows users to see connections where they are EITHER sender OR recipient
CREATE POLICY "Users can view connections they are involved in" ON user_connections
  FOR SELECT
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Verify the new policy
SELECT 'New RLS policies after update:' as step;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'user_connections';

-- Test query to verify recipients can now see invitations
SELECT 'Testing recipient visibility:' as step;
SELECT 
    id,
    user_id as sender_id,
    friend_id as recipient_id,
    status,
    created_at,
    message,
    CASE 
        WHEN friend_id = auth.uid() THEN 'I am the recipient'
        WHEN user_id = auth.uid() THEN 'I am the sender'
        ELSE 'Not involved'
    END as my_role
FROM user_connections
WHERE (friend_id = auth.uid() OR user_id = auth.uid())
AND status = 'pending'
ORDER BY created_at DESC
LIMIT 10;

-- Create indexes if they don't exist for better query performance
CREATE INDEX IF NOT EXISTS idx_user_connections_friend_id ON user_connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status_friend ON user_connections(status, friend_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status_user ON user_connections(status, user_id);

-- Summary of what this fixes:
SELECT 'Summary: Fixed RLS policy to allow recipients to see invitations sent TO them' as summary;