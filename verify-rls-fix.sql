-- =====================================================
-- VERIFY RLS FIX - Check if optimizations are working
-- =====================================================

-- Check if helper function exists
SELECT
    'Helper Function Status' as check_type,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = 'get_current_user_id'
        ) THEN '✅ EXISTS - get_current_user_id() is deployed'
        ELSE '❌ MISSING - Helper function not found'
    END as status;

-- Count policies still using auth.uid() directly
SELECT
    'Auth.uid() Warnings' as check_type,
    COUNT(*)::text || ' policies still using auth.uid() directly' as status
FROM pg_policies
WHERE schemaname = 'public'
AND qual::text LIKE '%auth.uid()%'
AND qual::text NOT LIKE '%get_current_user_id()%';

-- Show which tables still have warnings
SELECT
    'Tables with warnings' as check_type,
    COALESCE(string_agg(DISTINCT tablename, ', '), 'None! All optimized!') as status
FROM pg_policies
WHERE schemaname = 'public'
AND qual::text LIKE '%auth.uid()%'
AND qual::text NOT LIKE '%get_current_user_id()%';

-- Count policies using the optimized helper
SELECT
    'Optimized Policies' as check_type,
    COUNT(*)::text || ' policies using get_current_user_id() helper' as status
FROM pg_policies
WHERE schemaname = 'public'
AND qual::text LIKE '%get_current_user_id()%';

-- Show performance improvement estimate
SELECT
    'Performance Impact' as check_type,
    CASE
        WHEN COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%get_current_user_id()%') = 0
        THEN '🚀 100% OPTIMIZED - No auth.uid() warnings remain!'
        WHEN COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%get_current_user_id()%') < 10
        THEN '✅ 90%+ OPTIMIZED - Minimal warnings remain'
        WHEN COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%get_current_user_id()%') < 30
        THEN '⚠️ 50%+ OPTIMIZED - Some warnings remain'
        ELSE '❌ Needs more optimization'
    END as status
FROM pg_policies
WHERE schemaname = 'public';

-- List all tables with their policy counts
SELECT
    tablename,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%get_current_user_id()%') as unoptimized_policies,
    COUNT(*) FILTER (WHERE qual::text LIKE '%get_current_user_id()%') as optimized_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%') > 0
ORDER BY unoptimized_policies DESC, tablename;