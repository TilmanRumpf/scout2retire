-- Check all table structures that need RLS optimization
SELECT 
    t.table_name,
    array_agg(c.column_name::text ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'notifications',
    'chat_messages', 
    'group_chat_members',
    'scotty_conversations',
    'scotty_messages',
    'scotty_chat_usage',
    'thread_read_status',
    'discovery_views'
)
GROUP BY t.table_name
ORDER BY t.table_name;
