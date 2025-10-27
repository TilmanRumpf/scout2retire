-- =============================================================================
-- FIX CRITICAL RPC FUNCTIONS: Add Qualified Table Names (V2)
-- =============================================================================
-- Problem: November 1 migration set search_path = '' but didn't update table references
-- Solution: Drop and recreate functions with proper qualified table names
-- Date: 2025-11-05
-- Priority: CRITICAL - These functions are failing in production NOW
-- =============================================================================

BEGIN;

-- =============================================================================
-- FUNCTION 1: check_admin_access (ALREADY FIXED - SKIP)
-- =============================================================================
-- This was successfully updated in the first run

-- =============================================================================
-- FUNCTION 2: update_user_device (DROP AND RECREATE)
-- =============================================================================

DROP FUNCTION IF EXISTS public.update_user_device CASCADE;

CREATE FUNCTION public.update_user_device(
  p_user_id UUID,
  p_device_type TEXT,
  p_platform TEXT,
  p_browser TEXT,
  p_user_agent TEXT,
  p_screen_resolution TEXT DEFAULT NULL,
  p_viewport_size TEXT DEFAULT NULL,
  p_pixel_ratio FLOAT DEFAULT NULL,
  p_orientation TEXT DEFAULT NULL,
  p_touch_support BOOLEAN DEFAULT NULL,
  p_connection_type TEXT DEFAULT NULL,
  p_device_manufacturer TEXT DEFAULT NULL,
  p_device_model TEXT DEFAULT NULL,
  p_device_model_confidence TEXT DEFAULT NULL,
  p_platform_version TEXT DEFAULT NULL,
  p_browser_version TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_country_name TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_device_id UUID;
BEGIN
  -- Insert device info - FIX: Add public. prefix
  INSERT INTO public.user_device_history (
    user_id,
    device_type,
    platform,
    browser,
    user_agent,
    screen_resolution,
    viewport_size,
    pixel_ratio,
    orientation,
    touch_support,
    connection_type,
    device_manufacturer,
    device_model,
    device_model_confidence,
    platform_version,
    browser_version,
    country_code,
    country_name,
    region,
    city,
    timezone
  ) VALUES (
    p_user_id,
    p_device_type,
    p_platform,
    p_browser,
    p_user_agent,
    p_screen_resolution,
    p_viewport_size,
    p_pixel_ratio,
    p_orientation,
    p_touch_support,
    p_connection_type,
    p_device_manufacturer,
    p_device_model,
    p_device_model_confidence,
    p_platform_version,
    p_browser_version,
    p_country_code,
    p_country_name,
    p_region,
    p_city,
    p_timezone
  )
  RETURNING id INTO v_device_id;

  -- Update user's device info - FIX: Add public. prefix
  UPDATE public.users
  SET
    last_device_type = p_device_type,
    last_platform = p_platform,
    last_browser = p_browser,
    last_user_agent = p_user_agent,
    last_screen_resolution = p_screen_resolution,
    last_viewport_size = p_viewport_size,
    last_pixel_ratio = p_pixel_ratio,
    last_orientation = p_orientation,
    last_touch_support = p_touch_support,
    last_connection_type = p_connection_type,
    last_device_manufacturer = p_device_manufacturer,
    last_device_model = p_device_model,
    last_device_model_confidence = p_device_model_confidence,
    last_platform_version = p_platform_version,
    last_browser_version = p_browser_version,
    last_country_code = p_country_code,
    last_country_name = p_country_name,
    last_region = p_region,
    last_city = p_city,
    last_timezone = p_timezone,
    last_login_at = now()
  WHERE id = p_user_id;

  RETURN v_device_id;
END;
$$;

-- =============================================================================
-- FUNCTION 3: start_user_session (DROP AND RECREATE)
-- =============================================================================

-- First drop the existing function with its current signature
DROP FUNCTION IF EXISTS public.start_user_session(UUID, UUID, TEXT);

-- Recreate with fixed table references
CREATE FUNCTION public.start_user_session(
  p_user_id UUID,
  p_device_history_id UUID,
  p_entry_page TEXT  -- Keep original parameter name to match calls
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Insert new session - FIX: Add public. prefix
  INSERT INTO public.user_sessions (
    user_id,
    device_history_id,
    start_time,
    last_activity,
    page_views,
    current_page
  ) VALUES (
    p_user_id,
    p_device_history_id,
    now(),
    now(),
    1,
    p_entry_page
  )
  RETURNING id INTO v_session_id;

  -- Update user stats - FIX: Add public. prefix
  UPDATE public.users
  SET
    total_sessions = COALESCE(total_sessions, 0) + 1,
    last_active_at = now()
  WHERE id = p_user_id;

  RETURN v_session_id;
END;
$$;

-- =============================================================================
-- FUNCTION 4: get_user_limits (DROP AND RECREATE)
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
  -- Use provided user_id or current user
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Get limits based on user's category - FIX: Add public. prefix
  RETURN QUERY
  SELECT
    cl.feature_key,
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
-- FUNCTION 5: can_user_perform (DROP AND RECREATE)
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
  v_current_usage INT;
BEGIN
  -- Use provided user_id or current user
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Check if user is admin - FIX: Add public. prefix
  SELECT is_admin, admin_role, category_id
  INTO v_is_admin, v_admin_role, v_category_id
  FROM public.users
  WHERE id = v_user_id;

  -- Admins have unlimited access
  IF v_is_admin = true OR v_admin_role IN ('executive_admin', 'assistant_admin', 'admin') THEN
    RETURN true;
  END IF;

  -- Get feature limit for user's category - FIX: Add public. prefix
  SELECT cl.limit_value, cl.is_unlimited
  INTO v_limit_value, v_is_unlimited
  FROM public.category_limits cl
  WHERE cl.category_id = v_category_id
    AND cl.feature_key = p_feature_key;

  -- If no limit defined, deny by default
  IF v_limit_value IS NULL AND v_is_unlimited IS NOT true THEN
    RETURN false;
  END IF;

  -- If unlimited, allow
  IF v_is_unlimited = true THEN
    RETURN true;
  END IF;

  -- Check current usage (this would need to be implemented based on feature)
  -- For now, just check if limit > 0
  RETURN v_limit_value > 0;
END;
$$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  v_test_result BOOLEAN;
BEGIN
  -- Test check_admin_access
  BEGIN
    v_test_result := public.check_admin_access('admin');
    RAISE NOTICE 'check_admin_access test: %', CASE WHEN v_test_result IS NOT NULL THEN 'PASSED' ELSE 'FAILED' END;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'check_admin_access function still has issues: %', SQLERRM;
  END;

  RAISE NOTICE 'All functions have been recreated with qualified table names';
END $$;

COMMIT;

-- =============================================================================
-- POST-MIGRATION NOTES
-- =============================================================================
-- This V2 migration drops and recreates the functions to avoid parameter name conflicts
--
-- Functions fixed:
-- 1. check_admin_access - Already fixed in first run
-- 2. update_user_device - Dropped and recreated
-- 3. start_user_session - Dropped and recreated with correct parameter name
-- 4. get_user_limits - Dropped and recreated
-- 5. can_user_perform - Dropped and recreated
--
-- To verify this worked:
-- 1. Check browser console - "relation does not exist" errors should be gone
-- 2. Admin panel should load without 404s
-- 3. Device tracking should work
-- 4. Session tracking should work