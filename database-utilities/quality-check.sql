-- COMPREHENSIVE DATABASE QUALITY CHECK - VERIFY OPTIMIZATIONS
-- Run these queries in Supabase SQL Editor to verify optimization status

-- ====================================================================================
-- CHECK 1: Verify get_current_user_id() helper function exists
-- ====================================================================================
SELECT
    'CHECK 1: Helper Function' as check_name,
    proname as function_name,
    CASE
        WHEN proname = 'get_current_user_id' THEN 'EXISTS ✅'
        ELSE 'NOT FOUND ❌'
    END as status
FROM pg_proc
WHERE proname = 'get_current_user_id';

-- If no rows returned, the function doesn't exist


-- ====================================================================================
-- CHECK 2: Count policies using auth.uid() vs get_current_user_id()
-- ====================================================================================
SELECT
    'CHECK 2: Policy Optimization' as check_name,
    COUNT(CASE WHEN qual::text LIKE '%auth.uid()%' THEN 1 END) as policies_using_auth_uid,
    COUNT(CASE WHEN qual::text LIKE '%get_current_user_id()%' THEN 1 END) as policies_using_helper,
    ROUND(
        (COUNT(CASE WHEN qual::text LIKE '%get_current_user_id()%' THEN 1 END)::numeric /
         NULLIF(COUNT(*)::numeric, 0)) * 100,
        2
    ) as optimization_percentage
FROM pg_policies
WHERE schemaname = 'public';


-- ====================================================================================
-- CHECK 3: Verify foreign key indexes exist
-- ====================================================================================
SELECT
    'CHECK 3: Foreign Key Indexes' as check_name,
    COUNT(*) as indexes_created,
    15 as expected_indexes,
    CASE
        WHEN COUNT(*) = 15 THEN 'ALL CREATED ✅'
        ELSE CONCAT('MISSING ', (15 - COUNT(*))::text, ' INDEXES ⚠️')
    END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_chat_messages_deleted_by',
    'idx_chat_messages_pinned_by',
    'idx_chat_messages_user_id',
    'idx_chat_threads_created_by',
    'idx_group_bans_banned_by',
    'idx_group_role_audit_target_user_id',
    'idx_journal_entries_related_user_id',
    'idx_journal_entries_town_id',
    'idx_onboarding_responses_user_id',
    'idx_retirement_schedule_user_id',
    'idx_user_reports_reviewed_by',
    'idx_user_sessions_device_history_id',
    'idx_user_town_access_granted_by',
    'idx_users_community_role_town_id',
    'idx_users_roles_updated_by'
);

-- Detail view: List which indexes exist
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_chat_messages_deleted_by',
    'idx_chat_messages_pinned_by',
    'idx_chat_messages_user_id',
    'idx_chat_threads_created_by',
    'idx_group_bans_banned_by',
    'idx_group_role_audit_target_user_id',
    'idx_journal_entries_related_user_id',
    'idx_journal_entries_town_id',
    'idx_onboarding_responses_user_id',
    'idx_retirement_schedule_user_id',
    'idx_user_reports_reviewed_by',
    'idx_user_sessions_device_history_id',
    'idx_user_town_access_granted_by',
    'idx_users_community_role_town_id',
    'idx_users_roles_updated_by'
)
ORDER BY indexname;


-- ====================================================================================
-- CHECK 4: Total index count
-- ====================================================================================
SELECT
    'CHECK 4: Index Statistics' as check_name,
    COUNT(*) as total_indexes,
    COUNT(CASE WHEN indexname LIKE 'idx_%' THEN 1 END) as custom_indexes,
    COUNT(*) - COUNT(CASE WHEN indexname LIKE 'idx_%' THEN 1 END) as system_indexes
FROM pg_indexes
WHERE schemaname = 'public';


-- ====================================================================================
-- CHECK 5: Tables with multiple permissive policies
-- ====================================================================================
WITH policy_counts AS (
    SELECT tablename, cmd, COUNT(*) as policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND permissive = 'PERMISSIVE'
    GROUP BY tablename, cmd
    HAVING COUNT(*) > 1
)
SELECT
    'CHECK 5: Multiple Policies' as check_name,
    COUNT(*) as tables_with_multiple_policies,
    CASE
        WHEN COUNT(*) = 0 THEN 'NONE ✅'
        ELSE CONCAT(COUNT(*)::text, ' TABLES ⚠️')
    END as status
FROM policy_counts;

-- Detail view: Which tables have multiple policies
WITH policy_counts AS (
    SELECT tablename, cmd, COUNT(*) as policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND permissive = 'PERMISSIVE'
    GROUP BY tablename, cmd
    HAVING COUNT(*) > 1
)
SELECT tablename, cmd, policy_count
FROM policy_counts
ORDER BY policy_count DESC, tablename;


-- ====================================================================================
-- BONUS CHECK 6: Count total RLS warnings (auth.uid() usage)
-- ====================================================================================
SELECT
    'BONUS: RLS Warnings' as check_name,
    COUNT(*) as total_policies_with_auth_uid,
    CASE
        WHEN COUNT(*) = 0 THEN 'FULLY OPTIMIZED ✅'
        ELSE CONCAT(COUNT(*)::text, ' POLICIES NEED OPTIMIZATION ⚠️')
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND qual::text LIKE '%auth.uid()%';


-- ====================================================================================
-- BONUS CHECK 7: Performance impact estimation
-- ====================================================================================
SELECT
    'BONUS: Performance Analysis' as check_name,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN qual::text LIKE '%auth.uid()%' THEN 1 END) as policies_needing_optimization,
    CASE
        WHEN COUNT(CASE WHEN qual::text LIKE '%auth.uid()%' THEN 1 END) = 0
        THEN 'Expected speedup: 3-5x faster ✅'
        WHEN COUNT(CASE WHEN qual::text LIKE '%auth.uid()%' THEN 1 END) < COUNT(*) / 2
        THEN 'Partial optimization - some speedup expected'
        ELSE 'Most policies still unoptimized - run migrations ⚠️'
    END as performance_impact
FROM pg_policies
WHERE schemaname = 'public';


-- ====================================================================================
-- SUMMARY REPORT
-- ====================================================================================
SELECT
    '═══════════════════════════════════════════════════════════════' as separator,
    'DATABASE OPTIMIZATION STATUS REPORT' as report_title,
    '═══════════════════════════════════════════════════════════════' as separator2;

-- This provides a comprehensive view of the optimization status.
-- Compare results to expectations from RLS_PERFORMANCE_EXECUTIVE_SUMMARY.md
