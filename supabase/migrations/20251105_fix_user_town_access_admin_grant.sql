-- =============================================================================
-- FIX: Allow Admins to Grant Town Access
-- =============================================================================
-- Problem: Error "new row violates row-level security policy for table user_town_access"
-- Solution: Create proper RLS policies for admin operations
-- Date: 2025-11-05
-- =============================================================================

BEGIN;

-- First, check what policies currently exist
DO $$
BEGIN
  RAISE NOTICE 'Fixing user_town_access RLS policies for admin access...';
END $$;

-- Drop ALL existing policies on user_town_access to start fresh
DROP POLICY IF EXISTS "user_town_access_select" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_insert" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_update" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_delete" ON public.user_town_access;
DROP POLICY IF EXISTS "Users can view their own access" ON public.user_town_access;
DROP POLICY IF EXISTS "Admins can manage all access" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_view_own" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_admin_select" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_admin_insert" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_admin_update" ON public.user_town_access;
DROP POLICY IF EXISTS "user_town_access_admin_delete" ON public.user_town_access;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_town_access;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.user_town_access;
DROP POLICY IF EXISTS "Enable update for all users" ON public.user_town_access;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.user_town_access;

-- Create a single comprehensive policy for admins
CREATE POLICY "admins_full_access"
ON public.user_town_access
FOR ALL
TO authenticated
USING (
  -- Admins can do anything
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
  )
  OR
  -- Users can view their own access
  user_id = auth.uid()
)
WITH CHECK (
  -- For INSERT/UPDATE: Only admins can modify
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
  )
);

-- Also ensure the table has RLS enabled
ALTER TABLE public.user_town_access ENABLE ROW LEVEL SECURITY;

-- Verification: Check that Tilman can insert
DO $$
DECLARE
  v_is_admin BOOLEAN;
  v_admin_role TEXT;
BEGIN
  -- Check Tilman's admin status
  SELECT is_admin, admin_role INTO v_is_admin, v_admin_role
  FROM public.users
  WHERE email = 'tilman.rumpf@gmail.com';

  RAISE NOTICE 'Tilman admin status: is_admin=%, admin_role=%', v_is_admin, v_admin_role;

  IF v_is_admin = true OR v_admin_role IN ('executive_admin', 'assistant_admin', 'admin') THEN
    RAISE NOTICE '✅ Tilman has admin access and should be able to grant town access';
  ELSE
    RAISE WARNING '⚠️ Tilman does not have admin privileges!';
  END IF;
END $$;

COMMIT;

-- =============================================================================
-- POST-MIGRATION NOTES
-- =============================================================================
-- This migration creates a single comprehensive policy that allows:
-- 1. Admins to SELECT/INSERT/UPDATE/DELETE any user_town_access records
-- 2. Regular users to SELECT their own access records
--
-- After running this, you should be able to grant town access in the UI