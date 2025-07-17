-- RLS POLICY AUDIT
-- Check all Row Level Security policies for potential vulnerabilities

-- 1. List all tables with RLS enabled/disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check for tables that should have RLS but don't
SELECT 
    'TABLES WITHOUT RLS' as check_name,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND rowsecurity = false
    AND tablename IN (
        'users', 
        'favorites', 
        'journal_entries', 
        'scheduled_visits', 
        'chat_messages',
        'onboarding_responses',
        'direct_messages',
        'friendships'
    );

-- 4. Check for overly permissive policies
SELECT 
    'POTENTIALLY PERMISSIVE POLICIES' as check_name,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND (
        qual = 'true' -- Always allows
        OR qual LIKE '%true%' -- Contains simple true
        OR with_check = 'true' -- Always allows inserts/updates
    );

-- 5. Check for policies that don't check auth.uid()
SELECT 
    'POLICIES NOT CHECKING AUTH' as check_name,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
    AND qual NOT LIKE '%auth.uid()%'
    AND tablename IN (
        'users', 
        'favorites', 
        'journal_entries', 
        'scheduled_visits', 
        'chat_messages',
        'onboarding_responses'
    );

-- 6. Check specific table policies for favorites (should require onboarding)
SELECT 
    'FAVORITES TABLE POLICIES' as check_name,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'favorites';

-- 7. Check journal_entries policies
SELECT 
    'JOURNAL ENTRIES POLICIES' as check_name,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'journal_entries';

-- 8. Check if any policies reference onboarding_completed
SELECT 
    'POLICIES CHECKING ONBOARDING STATUS' as check_name,
    tablename,
    policyname,
    cmd,
    qual LIKE '%onboarding_completed%' as checks_onboarding_in_qual,
    with_check LIKE '%onboarding_completed%' as checks_onboarding_in_with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND (qual LIKE '%onboarding_completed%' OR with_check LIKE '%onboarding_completed%');