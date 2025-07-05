-- Debug queries to understand user_connections visibility issues

-- 1. Check if the table exists and has data
SELECT 'Step 1: Check table existence and row count' as step;
SELECT COUNT(*) as total_rows FROM user_connections;

-- 2. Check pending invitations count
SELECT 'Step 2: Count of pending invitations' as step;
SELECT COUNT(*) as pending_count FROM user_connections WHERE status = 'pending';

-- 3. Show sample data (without auth context)
SELECT 'Step 3: Sample pending invitations (first 5)' as step;
SELECT 
    id,
    user_id,
    friend_id,
    status,
    created_at,
    message
FROM user_connections 
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check if auth.uid() returns a value
SELECT 'Step 4: Current user ID from auth context' as step;
SELECT auth.uid() as current_user_id;

-- 5. Show what the current user can see as sender
SELECT 'Step 5: Invitations SENT by current user' as step;
SELECT 
    id,
    friend_id as sent_to,
    status,
    created_at,
    message
FROM user_connections 
WHERE user_id = auth.uid() 
AND status = 'pending'
ORDER BY created_at DESC;

-- 6. Show what the current user can see as recipient
SELECT 'Step 6: Invitations RECEIVED by current user' as step;
SELECT 
    id,
    user_id as received_from,
    status,
    created_at,
    message
FROM user_connections 
WHERE friend_id = auth.uid() 
AND status = 'pending'
ORDER BY created_at DESC;

-- 7. Check RLS status
SELECT 'Step 7: RLS enabled status' as step;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'user_connections';

-- 8. Show all current RLS policies
SELECT 'Step 8: Current RLS policies on user_connections' as step;
SELECT 
    policyname,
    cmd as command,
    permissive,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'user_connections'
ORDER BY policyname;