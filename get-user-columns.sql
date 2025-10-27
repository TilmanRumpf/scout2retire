-- =====================================================
-- GET USER-RELATED COLUMNS FOR KEY TABLES
-- =====================================================

-- Show columns for tables with auth.uid() warnings
SELECT
    t.table_name,
    c.column_name,
    c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'user_connections',
    'blocked_users',
    'user_blocks',
    'friendships',
    'retirement_schedule',
    'user_likes',
    'chat_messages',
    'direct_messages',
    'chat_threads',
    'scotty_conversations',
    'scotty_messages',
    'notifications',
    'chat_favorites',
    'country_likes',
    'discovery_views',
    'onboarding_responses',
    'thread_read_status',
    'user_hobbies',
    'user_preferences',
    'favorites',
    'query_logs',
    'scotty_chat_usage',
    'user_town_access',
    'category_limits',
    'user_behavior_events',
    'user_cohorts',
    'user_engagement_metrics',
    'group_bans',
    'group_role_audit',
    'journal_entries'
)
AND (
    c.column_name LIKE '%user%' OR
    c.column_name LIKE '%sender%' OR
    c.column_name LIKE '%receiver%' OR
    c.column_name LIKE '%friend%' OR
    c.column_name LIKE '%requester%' OR
    c.column_name LIKE '%liker%' OR
    c.column_name LIKE '%liked%' OR
    c.column_name LIKE '%blocker%' OR
    c.column_name LIKE '%blocked%' OR
    c.column_name LIKE '%created_by%' OR
    c.column_name LIKE '%owner%' OR
    c.column_name IN ('from_id', 'to_id', 'author_id', 'recipient_id')
)
ORDER BY t.table_name, c.ordinal_position;