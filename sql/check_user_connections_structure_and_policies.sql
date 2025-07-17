-- Check the structure of user_connections table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_connections' 
ORDER BY ordinal_position;

-- Check existing RLS policies on user_connections
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_connections'
ORDER BY policyname;

-- Check if RLS is enabled on the table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'user_connections';

-- Sample query to see what a recipient would see
-- This simulates what happens when friend_id = current user
SELECT 
    'Sample data for debugging - what recipients see:' as description;

SELECT 
    id,
    user_id,
    friend_id,
    status,
    created_at,
    message
FROM user_connections
WHERE friend_id = auth.uid()
AND status = 'pending'
LIMIT 5;

-- Check if there are any pending invitations in the table at all
SELECT 
    'Total pending invitations in table:' as description,
    COUNT(*) as count
FROM user_connections
WHERE status = 'pending';

-- Check the auth.uid() function
SELECT 
    'Current auth.uid():' as description,
    auth.uid() as current_user_id;