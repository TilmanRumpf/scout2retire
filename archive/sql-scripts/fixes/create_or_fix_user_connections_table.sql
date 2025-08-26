-- Create or fix the user_connections table with proper structure and RLS

-- First check if the table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_connections') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE user_connections (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
            message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT unique_connection UNIQUE (user_id, friend_id),
            CONSTRAINT no_self_connection CHECK (user_id != friend_id)
        );
        
        RAISE NOTICE 'Table user_connections created successfully';
    ELSE
        RAISE NOTICE 'Table user_connections already exists';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own connections" ON user_connections;
DROP POLICY IF EXISTS "Users can view connections they are involved in" ON user_connections;
DROP POLICY IF EXISTS "Users can create their own connections" ON user_connections;
DROP POLICY IF EXISTS "Users can update their own sent connections" ON user_connections;
DROP POLICY IF EXISTS "Users can delete their own sent connections" ON user_connections;
DROP POLICY IF EXISTS "Users can update received connections" ON user_connections;

-- Create comprehensive RLS policies

-- 1. SELECT: Users can view connections where they are either sender or recipient
CREATE POLICY "Users can view connections involving them" ON user_connections
    FOR SELECT
    USING (auth.uid() IN (user_id, friend_id));

-- 2. INSERT: Users can only create connections where they are the sender
CREATE POLICY "Users can create connections as sender" ON user_connections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Users can update connections they sent or received
CREATE POLICY "Users can update connections involving them" ON user_connections
    FOR UPDATE
    USING (auth.uid() IN (user_id, friend_id))
    WITH CHECK (auth.uid() IN (user_id, friend_id));

-- 4. DELETE: Users can only delete connections they sent
CREATE POLICY "Users can delete connections they sent" ON user_connections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_friend_id ON user_connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_status ON user_connections(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_connections_friend_status ON user_connections(friend_id, status);

-- Grant necessary permissions
GRANT ALL ON user_connections TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the setup
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'user_connections' ORDER BY ordinal_position;

SELECT 'RLS policies:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'user_connections' ORDER BY policyname;

SELECT 'Indexes:' as info;
SELECT indexname FROM pg_indexes WHERE tablename = 'user_connections';

-- Test queries to verify functionality
SELECT 'Test: Can current user see their received invitations?' as test;
SELECT COUNT(*) as received_invitations FROM user_connections WHERE friend_id = auth.uid() AND status = 'pending';

SELECT 'Test: Can current user see their sent invitations?' as test;
SELECT COUNT(*) as sent_invitations FROM user_connections WHERE user_id = auth.uid() AND status = 'pending';