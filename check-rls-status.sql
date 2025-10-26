-- Check RLS status for all tables in public schema
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*)
     FROM pg_policies
     WHERE schemaname = c.schemaname
     AND tablename = c.tablename) as policy_count
FROM pg_catalog.pg_tables c
WHERE schemaname = 'public'
ORDER BY tablename;
