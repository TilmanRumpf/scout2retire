-- Check which tables have replication enabled
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN tablename = ANY(
            SELECT tablename 
            FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime'
        ) THEN 'ENABLED'
        ELSE 'DISABLED'
    END as replication_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('chat_messages', 'thread_read_status')
ORDER BY tablename;
