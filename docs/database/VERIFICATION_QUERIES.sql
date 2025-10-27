-- =====================================================
-- RLS OPTIMIZATION VERIFICATION QUERIES
-- Copy and paste these into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- QUERY 1: Check if Helper Function Exists
-- =====================================================
-- Expected: 1 row showing function exists
-- If empty: Migration NOT deployed

SELECT
    proname as function_name,
    pronargs as arg_count,
    prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'get_current_user_id';

-- =====================================================
-- QUERY 2: Count Optimized vs Unoptimized Policies
-- =====================================================
-- Expected (Phase 2 deployed):
--   Optimized: 20-30
--   NOT Optimized: 0-5
--   Total: 25-35

SELECT
    'Optimized (using helper)' as category,
    COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
AND (qual LIKE '%get_current_user_id%' OR with_check LIKE '%get_current_user_id%')

UNION ALL

SELECT
    'NOT Optimized (direct auth.uid)' as category,
    COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND NOT (qual LIKE '%get_current_user_id%' OR with_check LIKE '%get_current_user_id%')

UNION ALL

SELECT
    'Total policies' as category,
    COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public';

-- =====================================================
-- QUERY 3: Check Critical Tables Policy Counts
-- =====================================================
-- Expected (Phase 2 deployed):
--   group_chat_members: 2 policies
--   users: 2 policies
--   notifications: 2-4 policies

SELECT
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('group_chat_members', 'users', 'notifications', 'chat_messages', 'scotty_conversations')
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- QUERY 4: Detailed Policy Status for Critical Tables
-- =====================================================
-- Expected: All showing "OPTIMIZED ✅"
-- If "NEEDS FIX ❌": Phase 2 NOT deployed

SELECT
    tablename,
    policyname,
    CASE
        WHEN qual LIKE '%get_current_user_id%' THEN 'OPTIMIZED ✅'
        WHEN qual LIKE '%auth.uid()%' THEN 'NEEDS FIX ❌'
        ELSE 'NO AUTH'
    END as qual_status,
    CASE
        WHEN with_check LIKE '%get_current_user_id%' THEN 'OPTIMIZED ✅'
        WHEN with_check LIKE '%auth.uid()%' THEN 'NEEDS FIX ❌'
        ELSE 'NO AUTH'
    END as check_status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('group_chat_members', 'users', 'notifications')
ORDER BY tablename, policyname;

-- =====================================================
-- QUERY 5: All Tables with RLS Policies (Overview)
-- =====================================================
-- Shows complete picture of your RLS setup

SELECT
    tablename,
    COUNT(*) as policy_count,
    COUNT(*) FILTER (WHERE qual LIKE '%get_current_user_id%' OR with_check LIKE '%get_current_user_id%') as optimized_count,
    COUNT(*) FILTER (WHERE (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
                      AND NOT (qual LIKE '%get_current_user_id%' OR with_check LIKE '%get_current_user_id%')) as needs_optimization
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY needs_optimization DESC, tablename;

-- =====================================================
-- QUERY 6: Find Any Remaining auth.uid() Usage
-- =====================================================
-- Shows which specific policies still need optimization
-- Expected (Phase 2 deployed): 0-5 rows

SELECT
    tablename,
    policyname,
    cmd as command_type,
    CASE
        WHEN qual IS NOT NULL THEN 'USING clause'
        ELSE NULL
    END as using_clause_status,
    CASE
        WHEN with_check IS NOT NULL THEN 'WITH CHECK clause'
        ELSE NULL
    END as check_clause_status
FROM pg_policies
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND NOT (qual LIKE '%get_current_user_id%' OR with_check LIKE '%get_current_user_id%')
ORDER BY tablename, policyname;

-- =====================================================
-- QUERY 7: Performance Test (Example)
-- =====================================================
-- This shows the query execution plan
-- Look for minimal auth function calls

EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*) FROM public.users WHERE id IS NOT NULL;

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================

/*
QUERY 1 - Helper Function Check:
  ✅ GOOD: Returns 1 row (function exists)
  ❌ BAD: Returns 0 rows (function missing - Phase 1 not deployed)

QUERY 2 - Policy Optimization Count:
  ✅ EXCELLENT: Optimized 20-30, NOT Optimized 0-5
  ⚠️  PARTIAL: Optimized 7-15, NOT Optimized 10-20 (Phase 1 only)
  ❌ BAD: Optimized 0, NOT Optimized 25+ (Nothing deployed)

QUERY 3 - Critical Tables:
  ✅ GOOD: group_chat_members: 2, users: 2
  ❌ BAD: group_chat_members: 11, users: 8 (Phase 2 not deployed)

QUERY 4 - Detailed Status:
  ✅ GOOD: All rows show "OPTIMIZED ✅"
  ❌ BAD: Rows show "NEEDS FIX ❌"

QUERY 5 - Overview:
  Shows which tables have most unoptimized policies
  Focus on tables with high "needs_optimization" count

QUERY 6 - Remaining Issues:
  ✅ EXCELLENT: 0-5 rows (nearly complete)
  ⚠️  PARTIAL: 10-20 rows (Phase 1 only)
  ❌ BAD: 50+ rows (Nothing deployed)

QUERY 7 - Performance:
  Look at execution time and plan
  Should be fast with minimal function calls
*/

-- =====================================================
-- WHAT TO DO BASED ON RESULTS
-- =====================================================

/*
IF Query 1 returns 0 rows:
  → Phase 1 NOT deployed
  → Run migration: 20251103_rls_optimization_safe.sql (if exists)
  → Or run: 20251104_rls_phase2_complete_fix.sql (includes Phase 1)

IF Query 2 shows high "NOT Optimized" count:
  → Phase 2 NOT deployed
  → Run migration: 20251104_rls_phase2_complete_fix.sql
  → In Supabase Dashboard → SQL Editor
  → Copy entire file contents
  → Click "Run"

IF Query 4 shows "NEEDS FIX ❌":
  → Specific tables need optimization
  → Run Phase 2 migration
  → Focus on group_chat_members and users first

IF All queries show good results:
  → ✅ Congratulations! RLS optimization complete
  → Enjoy 20-50x faster queries
  → Monitor Supabase dashboard for reduced warnings
*/
