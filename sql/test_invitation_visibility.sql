-- Test invitation visibility with sample data

-- First, get two user IDs from the users table
WITH test_users AS (
    SELECT 
        id,
        email,
        full_name,
        ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM users
    LIMIT 2
),
sender AS (
    SELECT id, email, full_name FROM test_users WHERE rn = 1
),
recipient AS (
    SELECT id, email, full_name FROM test_users WHERE rn = 2
)
SELECT 
    'Test users selected:' as info,
    s.email as sender_email,
    s.id as sender_id,
    r.email as recipient_email,
    r.id as recipient_id
FROM sender s, recipient r;

-- Insert a test invitation (will fail if users don't exist or connection already exists)
-- You'll need to manually replace the UUIDs below with actual user IDs from your database
/*
INSERT INTO user_connections (user_id, friend_id, status, message, created_at)
VALUES (
    'SENDER_USER_ID_HERE',  -- Replace with actual sender UUID
    'RECIPIENT_USER_ID_HERE', -- Replace with actual recipient UUID
    'pending',
    'Test invitation to verify recipient visibility',
    NOW()
)
ON CONFLICT (user_id, friend_id) DO UPDATE
SET status = 'pending', message = 'Test invitation to verify recipient visibility', updated_at = NOW();
*/

-- Check what the recipient can see
SELECT 'What recipients see when querying for received invitations:' as query_type;
SELECT 
    uc.id,
    uc.user_id as sender_id,
    uc.friend_id as recipient_id,
    uc.status,
    uc.message,
    uc.created_at,
    u_sender.email as sender_email,
    u_sender.full_name as sender_name
FROM user_connections uc
LEFT JOIN users u_sender ON uc.user_id = u_sender.id
WHERE uc.friend_id = auth.uid()
AND uc.status = 'pending'
ORDER BY uc.created_at DESC;

-- Alternative query without JOIN to isolate RLS issues
SELECT 'Simple query without JOINs:' as query_type;
SELECT 
    id,
    user_id as sender_id,
    friend_id as recipient_id,
    status,
    message,
    created_at
FROM user_connections
WHERE friend_id = auth.uid()
AND status = 'pending';

-- Debug: Show current user context
SELECT 'Current auth context:' as info, auth.uid() as current_user_id;

-- Debug: Count all invitations this user is involved in
SELECT 
    'Invitation counts for current user:' as info,
    COUNT(*) FILTER (WHERE user_id = auth.uid() AND status = 'pending') as sent_pending,
    COUNT(*) FILTER (WHERE friend_id = auth.uid() AND status = 'pending') as received_pending,
    COUNT(*) FILTER (WHERE user_id = auth.uid() OR friend_id = auth.uid()) as total_connections
FROM user_connections;