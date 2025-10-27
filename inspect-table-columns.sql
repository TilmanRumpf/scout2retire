-- =====================================================
-- INSPECT EXACT COLUMN NAMES FOR RLS FIX
-- Run this in Supabase SQL Editor to see all columns
-- =====================================================

-- 1. USER_CONNECTIONS
SELECT 'USER_CONNECTIONS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_connections'
ORDER BY ordinal_position;

-- 2. USER_BLOCKS
SELECT 'USER_BLOCKS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_blocks'
ORDER BY ordinal_position;

-- 3. BLOCKED_USERS (if exists)
SELECT 'BLOCKED_USERS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'blocked_users'
ORDER BY ordinal_position;

-- 4. FRIENDSHIPS
SELECT 'FRIENDSHIPS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'friendships'
ORDER BY ordinal_position;

-- 5. RETIREMENT_SCHEDULE
SELECT 'RETIREMENT_SCHEDULE' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'retirement_schedule'
ORDER BY ordinal_position;

-- 6. USER_LIKES
SELECT 'USER_LIKES' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_likes'
ORDER BY ordinal_position;

-- 7. CHAT_MESSAGES
SELECT 'CHAT_MESSAGES' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- 8. DIRECT_MESSAGES
SELECT 'DIRECT_MESSAGES' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'direct_messages'
ORDER BY ordinal_position;

-- 9. CHAT_THREADS
SELECT 'CHAT_THREADS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'chat_threads'
ORDER BY ordinal_position;

-- 10. SCOTTY_CONVERSATIONS
SELECT 'SCOTTY_CONVERSATIONS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'scotty_conversations'
ORDER BY ordinal_position;

-- 11. SCOTTY_MESSAGES
SELECT 'SCOTTY_MESSAGES' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'scotty_messages'
ORDER BY ordinal_position;

-- 12. NOTIFICATIONS
SELECT 'NOTIFICATIONS' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;

-- 13. ONBOARDING_RESPONSES
SELECT 'ONBOARDING_RESPONSES' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'onboarding_responses'
ORDER BY ordinal_position;

-- 14. List all tables that exist
SELECT '=== ALL PUBLIC TABLES ===' as info;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;