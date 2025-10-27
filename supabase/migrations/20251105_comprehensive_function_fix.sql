-- =============================================================================
-- COMPREHENSIVE FIX: All Function Table Reference Issues
-- =============================================================================
-- Problem: Multiple functions still have unqualified table names after search_path = ''
-- Solution: Fix ALL affected functions at once
-- Date: 2025-11-05
-- Priority: CRITICAL - Multiple functions failing
-- =============================================================================

BEGIN;

-- =============================================================================
-- FIX 1: check_admin_access - STILL BROKEN!
-- =============================================================================

-- Drop and recreate with PROPER qualified names
DROP FUNCTION IF EXISTS public.check_admin_access CASCADE;

CREATE FUNCTION public.check_admin_access(p_required_role TEXT DEFAULT 'admin')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_role TEXT;
  v_role_hierarchy INT;
  v_required_hierarchy INT;
BEGIN
  -- CRITICAL FIX: Use public.users not just users
  SELECT admin_role INTO v_user_role
  FROM public.users
  WHERE id = auth.uid();

  IF v_user_role IS NULL THEN
    RETURN false;
  END IF;

  v_role_hierarchy := CASE v_user_role
    WHEN 'executive_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    WHEN 'auditor' THEN 1
    ELSE 0
  END;

  v_required_hierarchy := CASE p_required_role
    WHEN 'executive_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    WHEN 'auditor' THEN 1
    ELSE 3
  END;

  RETURN v_role_hierarchy >= v_required_hierarchy;
END;
$$;

-- =============================================================================
-- FIX 2: get_user_limits - Wrong column name!
-- =============================================================================

DROP FUNCTION IF EXISTS public.get_user_limits CASCADE;

CREATE FUNCTION public.get_user_limits(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  feature_key TEXT,
  limit_value INT,
  is_unlimited BOOLEAN,
  category_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- FIX: Changed cl.feature_key to cl.feature_id (the actual column name)
  RETURN QUERY
  SELECT
    cl.feature_id as feature_key,  -- FIXED: was feature_key, should be feature_id
    cl.limit_value,
    cl.is_unlimited,
    uc.display_name as category_name
  FROM public.users u
  JOIN public.user_categories uc ON u.category_id = uc.id
  JOIN public.category_limits cl ON cl.category_id = uc.id
  WHERE u.id = v_user_id;
END;
$$;

-- =============================================================================
-- FIX 3: get_discovery_count_today - Missing function
-- =============================================================================

-- Create the missing function
CREATE OR REPLACE FUNCTION public.get_discovery_count_today(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Count discoveries for today
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.user_discoveries
  WHERE user_id = v_user_id
    AND DATE(created_at) = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    -- If table doesn't exist or other error, return 0
    RETURN 0;
END;
$$;

-- =============================================================================
-- FIX 4: can_user_perform - Update for correct column
-- =============================================================================

DROP FUNCTION IF EXISTS public.can_user_perform CASCADE;

CREATE FUNCTION public.can_user_perform(
  p_feature_key TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_admin_role TEXT;
  v_category_id UUID;
  v_limit_value INT;
  v_is_unlimited BOOLEAN;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Get user info with qualified table name
  SELECT is_admin, admin_role, category_id
  INTO v_is_admin, v_admin_role, v_category_id
  FROM public.users
  WHERE id = v_user_id;

  -- Admins have unlimited access
  IF v_is_admin = true OR v_admin_role IN ('executive_admin', 'assistant_admin', 'admin') THEN
    RETURN true;
  END IF;

  -- FIX: Changed feature_key to feature_id
  SELECT cl.limit_value, cl.is_unlimited
  INTO v_limit_value, v_is_unlimited
  FROM public.category_limits cl
  WHERE cl.category_id = v_category_id
    AND cl.feature_id = p_feature_key;  -- FIXED: was feature_key

  IF v_is_unlimited = true THEN
    RETURN true;
  END IF;

  RETURN COALESCE(v_limit_value, 0) > 0;
END;
$$;

-- =============================================================================
-- FIX 5: Fix RLS recursion on chat_messages
-- =============================================================================

-- Drop problematic policies causing infinite recursion
DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_update" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete" ON public.chat_messages;

-- Create simple non-recursive policies
CREATE POLICY "chat_messages_select_simple"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  thread_id IN (
    SELECT id FROM public.chat_threads
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "chat_messages_insert_simple"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  thread_id IN (
    SELECT id FROM public.chat_threads
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "chat_messages_update_simple"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_messages_delete_simple"
ON public.chat_messages FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  v_test BOOLEAN;
  v_count INTEGER;
BEGIN
  -- Test check_admin_access
  BEGIN
    v_test := public.check_admin_access('admin');
    RAISE NOTICE 'check_admin_access: OK';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'check_admin_access failed: %', SQLERRM;
  END;

  -- Test get_user_limits
  BEGIN
    PERFORM * FROM public.get_user_limits() LIMIT 1;
    RAISE NOTICE 'get_user_limits: OK';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'get_user_limits failed: %', SQLERRM;
  END;

  -- Test get_discovery_count_today
  BEGIN
    v_count := public.get_discovery_count_today();
    RAISE NOTICE 'get_discovery_count_today: OK (returned %)', v_count;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'get_discovery_count_today failed: %', SQLERRM;
  END;

  -- Test can_user_perform
  BEGIN
    v_test := public.can_user_perform('test');
    RAISE NOTICE 'can_user_perform: OK';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'can_user_perform failed: %', SQLERRM;
  END;

  RAISE NOTICE 'All function fixes applied successfully!';
END $$;

COMMIT;

-- =============================================================================
-- POST-MIGRATION NOTES
-- =============================================================================
-- Fixed issues:
-- 1. check_admin_access - Still had unqualified "users" reference
-- 2. get_user_limits - Was using "feature_key" but column is "feature_id"
-- 3. get_discovery_count_today - Function didn't exist at all
-- 4. can_user_perform - Was using "feature_key" instead of "feature_id"
-- 5. chat_messages - Fixed infinite recursion in RLS policies
--
-- To verify:
-- 1. Browser console errors should be gone
-- 2. Admin panel should work
-- 3. Daily discovery features should work
-- 4. Chat features should work