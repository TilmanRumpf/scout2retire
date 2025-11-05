-- =============================================================================
-- FIX ADMIN ACCESS: Correct RLS Policies Column Mismatch
-- =============================================================================
-- Problem: RLS policies created Oct 26 and Nov 4 check is_admin column incorrectly
-- Solution: Update all policies to check BOTH is_admin AND admin_role for compatibility
-- Date: 2025-11-05
-- Author: Fixed after thorough investigation
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: Fix users table policies
-- =============================================================================

-- Drop existing broken policies
DROP POLICY IF EXISTS "users_manage_own" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;
DROP POLICY IF EXISTS "users_unified_select" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_can_select_all_users" ON public.users;

-- Create new correct policies
-- Allow all authenticated users to view all user profiles (needed for chat, directory, etc)
CREATE POLICY "users_select_all"
ON public.users FOR SELECT TO authenticated
USING (true);

-- Allow users to update their own record OR admins to update any record
CREATE POLICY "users_update_self_or_admin"
ON public.users FOR UPDATE TO authenticated
USING (
    id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
    )
)
WITH CHECK (
    id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
    )
);

-- Allow users to insert their own record during signup
CREATE POLICY "users_insert_own"
ON public.users FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Allow users to delete their own record OR admins to delete any record
CREATE POLICY "users_delete_self_or_admin"
ON public.users FOR DELETE TO authenticated
USING (
    id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
    )
);

-- =============================================================================
-- STEP 2: Fix admin_score_adjustments table policies
-- =============================================================================

DROP POLICY IF EXISTS "admin_only_adjustments" ON public.admin_score_adjustments;

-- Only admins can manage admin score adjustments
CREATE POLICY "admin_only_adjustments"
ON public.admin_score_adjustments FOR ALL TO authenticated
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

-- =============================================================================
-- STEP 3: Fix towns table admin policies
-- =============================================================================

-- Drop broken admin policies
DROP POLICY IF EXISTS "towns_admin_manage" ON public.towns;
DROP POLICY IF EXISTS "towns_admin_modify" ON public.towns;
DROP POLICY IF EXISTS "towns_admin_update" ON public.towns;
DROP POLICY IF EXISTS "towns_admin_delete" ON public.towns;

-- Keep the public select policy (should already exist)
-- CREATE POLICY IF NOT EXISTS "towns_select_all"
-- ON public.towns FOR SELECT
-- USING (true);

-- Admin-only update policy
CREATE POLICY "towns_admin_update"
ON public.towns FOR UPDATE TO authenticated
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

-- Admin-only insert policy
CREATE POLICY "towns_admin_insert"
ON public.towns FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
    )
);

-- Admin-only delete policy
CREATE POLICY "towns_admin_delete"
ON public.towns FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND (u.is_admin = true OR u.admin_role IN ('executive_admin', 'assistant_admin', 'admin'))
    )
);

-- =============================================================================
-- STEP 4: Fix category_limits table policies
-- =============================================================================

DROP POLICY IF EXISTS "category_limits_admin_write" ON public.category_limits;
DROP POLICY IF EXISTS "category_limits_admin_all" ON public.category_limits;

-- Admin-only management of category limits
CREATE POLICY "category_limits_admin_manage"
ON public.category_limits FOR ALL TO authenticated
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

-- =============================================================================
-- STEP 5: Fix feature_definitions table policies
-- =============================================================================

DROP POLICY IF EXISTS "feature_definitions_admin_all" ON public.feature_definitions;
DROP POLICY IF EXISTS "feature_definitions_admin_write" ON public.feature_definitions;

-- Admin-only management of feature definitions
CREATE POLICY "feature_definitions_admin_manage"
ON public.feature_definitions FOR ALL TO authenticated
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

-- =============================================================================
-- STEP 6: Fix user_categories table policies
-- =============================================================================

DROP POLICY IF EXISTS "user_categories_admin_write" ON public.user_categories;
DROP POLICY IF EXISTS "user_categories_admin_all" ON public.user_categories;

-- Admin-only management of user categories
CREATE POLICY "user_categories_admin_manage"
ON public.user_categories FOR ALL TO authenticated
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

-- =============================================================================
-- STEP 7: Update the is_user_admin function to check both columns
-- =============================================================================

CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_admin_role TEXT;
BEGIN
    -- Get both admin fields for the current user
    SELECT is_admin, admin_role
    INTO v_is_admin, v_admin_role
    FROM public.users
    WHERE id = auth.uid();

    -- Check both legacy is_admin and new admin_role
    RETURN (
        v_is_admin = true OR
        v_admin_role IN ('executive_admin', 'assistant_admin', 'admin')
    );
END;
$$;

-- =============================================================================
-- STEP 8: Ensure Tilman has both admin fields set correctly
-- =============================================================================

-- Make sure Tilman has BOTH is_admin=true AND admin_role='executive_admin'
UPDATE public.users
SET
    is_admin = true,
    admin_role = 'executive_admin'
WHERE email = 'tilman.rumpf@gmail.com';

-- Also ensure other known admins are set correctly
UPDATE public.users
SET is_admin = true
WHERE email IN (
    'tobias.rumpf1@gmail.com',
    'madara.grisule@gmail.com',
    'tobiasrumpf@gmx.de'
) AND admin_role IS NOT NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify admin users are set correctly
DO $$
DECLARE
    admin_count INTEGER;
    tilman_admin BOOLEAN;
    tilman_role TEXT;
BEGIN
    -- Count admins
    SELECT COUNT(*) INTO admin_count
    FROM public.users
    WHERE is_admin = true OR admin_role IN ('executive_admin', 'assistant_admin', 'admin');

    -- Check Tilman specifically
    SELECT is_admin, admin_role INTO tilman_admin, tilman_role
    FROM public.users
    WHERE email = 'tilman.rumpf@gmail.com';

    RAISE NOTICE 'Total admin users: %', admin_count;
    RAISE NOTICE 'Tilman is_admin: %, admin_role: %', tilman_admin, tilman_role;

    IF tilman_admin != true OR tilman_role != 'executive_admin' THEN
        RAISE EXCEPTION 'Tilman admin access not properly set!';
    END IF;
END $$;

COMMIT;

-- =============================================================================
-- POST-MIGRATION VERIFICATION
-- =============================================================================
-- After running this migration, verify with:
--
-- 1. Check Tilman's admin status:
--    SELECT id, email, is_admin, admin_role
--    FROM users
--    WHERE email = 'tilman.rumpf@gmail.com';
--
-- 2. Test is_user_admin() function:
--    SELECT is_user_admin();
--    (Should return TRUE when logged in as Tilman)
--
-- 3. Check RLS policies:
--    SELECT pol.polname, pg_get_expr(pol.polqual, pol.polrelid) as using_expr
--    FROM pg_policy pol
--    JOIN pg_class cls ON pol.polrelid = cls.oid
--    WHERE cls.relname = 'users';
--
-- 4. Test admin panel access:
--    - Log out and log back in as tilman.rumpf@gmail.com
--    - Navigate to /admin
--    - Should see Towns Manager without redirect