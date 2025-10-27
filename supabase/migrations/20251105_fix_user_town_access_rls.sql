-- =============================================================================
-- FIX USER TOWN ACCESS RLS POLICIES
-- =============================================================================
-- Problem: Admins cannot grant town access - RLS policy violation
-- Solution: Allow admins to manage user_town_access records
-- Date: 2025-11-05
-- =============================================================================

BEGIN;

-- =============================================================================
-- Fix user_town_access RLS policies
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "user_town_access_select" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_insert" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_update" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_delete" ON public.user_town_access;
DROP POLICY IF EXISTS "Users can view their own access" ON public.user_town_access;
DROP POLICY IF EXISTS "Admins can manage all access" ON public.user_town_access;

-- Create proper policies that allow admin management

-- Users can view their own access
CREATE POLICY "user_town_access_view_own"
ON public.user_town_access FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all access
CREATE POLICY "user_town_access_admin_select"
ON public.user_town_access FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
  )
);

-- Admins can insert access for any user
CREATE POLICY "user_town_access_admin_insert"
ON public.user_town_access FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
  )
);

-- Admins can update any access
CREATE POLICY "user_town_access_admin_update"
ON public.user_town_access FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
  )
);

-- Admins can delete any access
CREATE POLICY "user_town_access_admin_delete"
ON public.user_town_access FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
  )
);

-- =============================================================================
-- Also fix the lingering issues with chat and sessions
-- =============================================================================

-- Fix chat_messages infinite recursion (if still present)
DROP POLICY IF EXISTS "chat_messages_own_or_thread" ON public.chat_messages;

CREATE POLICY "chat_messages_simple"
ON public.chat_messages FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR
  thread_id IN (
    SELECT id FROM public.chat_threads
    WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  thread_id IN (
    SELECT id FROM public.chat_threads
    WHERE created_by = auth.uid()
  )
);

-- Fix the update_user_device function signature issue
DROP FUNCTION IF EXISTS public.update_user_device(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, FLOAT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Create a simpler version that matches what's being called
CREATE OR REPLACE FUNCTION public.update_user_device(
  p_user_id UUID,
  p_device_manufacturer TEXT,
  p_device_model TEXT,
  p_device_model_confidence TEXT,
  p_device_type TEXT,
  p_platform TEXT,
  p_platform_version TEXT,
  p_browser TEXT,
  p_browser_version TEXT,
  p_user_agent TEXT,
  p_viewport_width INTEGER,
  p_viewport_height INTEGER,
  p_screen_width INTEGER,
  p_screen_height INTEGER,
  p_pixel_ratio FLOAT,
  p_orientation TEXT,
  p_touch_support BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Just update the user record with device info
  UPDATE public.users
  SET
    last_device_type = p_device_type,
    last_platform = p_platform,
    last_browser = p_browser,
    last_user_agent = p_user_agent,
    last_login_at = now()
  WHERE id = p_user_id;

  RETURN p_user_id;
END;
$$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '1. user_town_access - Admins can now grant access';
  RAISE NOTICE '2. chat_messages - Simplified policy to avoid recursion';
  RAISE NOTICE '3. update_user_device - Fixed function signature';
END $$;

COMMIT;