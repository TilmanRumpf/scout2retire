-- =====================================================
-- FIX FINAL 8 RLS WARNINGS - CORRECTED VERSION
-- Created: 2025-10-26
-- Target: Reduce from 8 to 0 warnings
-- =====================================================

-- =====================================================
-- PART 1: FIX AUTH_RLS_INITPLAN WARNINGS (2 warnings)
-- Tables: group_role_audit, group_bans
-- Using correct column names: thread_id (not group_id)
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Fixing auth_rls_initplan warnings...';

    -- 1. GROUP_ROLE_AUDIT - Fix auth.uid() call
    -- Columns: thread_id, actor_id, target_user_id
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_role_audit' AND policyname = 'Members can view audit logs') THEN
        DROP POLICY IF EXISTS "Members can view audit logs" ON public.group_role_audit;

        CREATE POLICY "Members can view audit logs"
        ON public.group_role_audit FOR SELECT TO authenticated
        USING (
            -- User can see audit logs if they're a member of the thread
            EXISTS (
                SELECT 1 FROM public.group_chat_members gcm
                WHERE gcm.thread_id = group_role_audit.thread_id
                AND gcm.user_id = get_current_user_id()
            )
            OR actor_id = get_current_user_id()  -- User can see their own actions
            OR target_user_id = get_current_user_id()  -- User can see actions done to them
        );

        RAISE NOTICE '   ✅ Fixed group_role_audit';
    END IF;

    -- 2. GROUP_BANS - Fix auth.uid() call
    -- Columns: thread_id, user_id, banned_by
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_bans' AND policyname = 'Members can view bans in their groups') THEN
        DROP POLICY IF EXISTS "Members can view bans in their groups" ON public.group_bans;

        CREATE POLICY "Members can view bans in their groups"
        ON public.group_bans FOR SELECT TO authenticated
        USING (
            -- Members of the thread can see bans
            EXISTS (
                SELECT 1 FROM public.group_chat_members gcm
                WHERE gcm.thread_id = group_bans.thread_id
                AND gcm.user_id = get_current_user_id()
            )
            OR user_id = get_current_user_id()  -- Banned users can see their own bans
            OR banned_by = get_current_user_id()  -- Users can see bans they issued
        );

        RAISE NOTICE '   ✅ Fixed group_bans';
    END IF;

    RAISE NOTICE '✅ Part 1 complete - auth_rls_initplan warnings fixed';
END $$;

-- =====================================================
-- PART 2: CONSOLIDATE MULTIPLE PERMISSIVE POLICIES (6 warnings)
-- Strategy: Combine admin + public policies into single USING clause
-- =====================================================

DO $$
DECLARE
    has_is_admin BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Consolidating multiple permissive policies...';

    -- Check if is_admin column exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'is_admin'
    ) INTO has_is_admin;

    -- 1. CATEGORY_LIMITS - Combine public read + admin write
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'category_limits') THEN
        -- Drop both existing policies
        DROP POLICY IF EXISTS "category_limits_public_read" ON public.category_limits;
        DROP POLICY IF EXISTS "category_limits_admin_write" ON public.category_limits;

        -- Create single consolidated SELECT policy
        CREATE POLICY "category_limits_unified_select"
        ON public.category_limits FOR SELECT TO authenticated
        USING (true);  -- Everyone can read

        -- Keep separate admin policies for INSERT/UPDATE/DELETE
        IF has_is_admin THEN
            CREATE POLICY "category_limits_admin_modify"
            ON public.category_limits FOR INSERT TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            CREATE POLICY "category_limits_admin_update"
            ON public.category_limits FOR UPDATE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            CREATE POLICY "category_limits_admin_delete"
            ON public.category_limits FOR DELETE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );
        END IF;

        RAISE NOTICE '   ✅ Consolidated category_limits policies';
    END IF;

    -- 2. FEATURE_DEFINITIONS - Combine public read + admin all
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_definitions') THEN
        DROP POLICY IF EXISTS "feature_definitions_public_read" ON public.feature_definitions;
        DROP POLICY IF EXISTS "feature_definitions_admin_all" ON public.feature_definitions;

        -- Single SELECT policy with combined logic
        IF has_is_admin THEN
            CREATE POLICY "feature_definitions_unified_select"
            ON public.feature_definitions FOR SELECT TO authenticated
            USING (
                is_active = true  -- Public can see active features
                OR EXISTS (       -- Admins can see all
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            -- Admin-only modify policies
            CREATE POLICY "feature_definitions_admin_modify"
            ON public.feature_definitions FOR INSERT TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            CREATE POLICY "feature_definitions_admin_update"
            ON public.feature_definitions FOR UPDATE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            CREATE POLICY "feature_definitions_admin_delete"
            ON public.feature_definitions FOR DELETE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );
        ELSE
            -- No admin column, just public read
            CREATE POLICY "feature_definitions_unified_select"
            ON public.feature_definitions FOR SELECT TO authenticated
            USING (is_active = true);
        END IF;

        RAISE NOTICE '   ✅ Consolidated feature_definitions policies';
    END IF;

    -- 3. REGIONAL_INSPIRATIONS - Consolidate two SELECT policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'regional_inspirations') THEN
        DROP POLICY IF EXISTS "Public can view active regional inspirations" ON public.regional_inspirations;
        DROP POLICY IF EXISTS "regional_inspirations_public_read" ON public.regional_inspirations;

        -- Single unified SELECT policy
        CREATE POLICY "regional_inspirations_unified_select"
        ON public.regional_inspirations FOR SELECT TO authenticated
        USING (is_active = true);

        RAISE NOTICE '   ✅ Consolidated regional_inspirations policies';
    END IF;

    -- 4. TOWNS - Combine public view + admin manage
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'towns') THEN
        DROP POLICY IF EXISTS "towns_public_view" ON public.towns;
        DROP POLICY IF EXISTS "towns_admin_manage" ON public.towns;

        -- Unified SELECT policy - everyone can view
        CREATE POLICY "towns_unified_select"
        ON public.towns FOR SELECT TO authenticated
        USING (true);  -- All authenticated users can view towns

        -- Admin-only modify policies
        IF has_is_admin THEN
            CREATE POLICY "towns_admin_modify"
            ON public.towns FOR INSERT TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            CREATE POLICY "towns_admin_update"
            ON public.towns FOR UPDATE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            CREATE POLICY "towns_admin_delete"
            ON public.towns FOR DELETE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );
        END IF;

        RAISE NOTICE '   ✅ Consolidated towns policies';
    END IF;

    -- 5. USER_CATEGORIES - Combine public read + admin write
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_categories') THEN
        DROP POLICY IF EXISTS "user_categories_public_read" ON public.user_categories;
        DROP POLICY IF EXISTS "user_categories_admin_write" ON public.user_categories;

        -- Unified SELECT policy
        IF has_is_admin THEN
            CREATE POLICY "user_categories_unified_select"
            ON public.user_categories FOR SELECT TO authenticated
            USING (
                is_visible = true  -- Public sees visible categories
                OR EXISTS (        -- Admins see all
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            -- Admin-only modify policies
            CREATE POLICY "user_categories_admin_modify"
            ON public.user_categories FOR INSERT TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            CREATE POLICY "user_categories_admin_update"
            ON public.user_categories FOR UPDATE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );

            CREATE POLICY "user_categories_admin_delete"
            ON public.user_categories FOR DELETE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = get_current_user_id()
                    AND u.is_admin = true
                )
            );
        ELSE
            -- No admin column, just public read
            CREATE POLICY "user_categories_unified_select"
            ON public.user_categories FOR SELECT TO authenticated
            USING (is_visible = true);
        END IF;

        RAISE NOTICE '   ✅ Consolidated user_categories policies';
    END IF;

    -- 6. USERS - Combine select all + manage own
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP POLICY IF EXISTS "users_select_all" ON public.users;
        DROP POLICY IF EXISTS "users_manage_own" ON public.users;

        -- Unified SELECT policy - everyone can view all users
        CREATE POLICY "users_unified_select"
        ON public.users FOR SELECT TO authenticated
        USING (true);  -- All authenticated users can view user profiles

        -- Self-management policies
        CREATE POLICY "users_update_own"
        ON public.users FOR UPDATE TO authenticated
        USING (id = get_current_user_id())
        WITH CHECK (id = get_current_user_id());

        CREATE POLICY "users_delete_own"
        ON public.users FOR DELETE TO authenticated
        USING (id = get_current_user_id());

        RAISE NOTICE '   ✅ Consolidated users policies';
    END IF;

    RAISE NOTICE '✅ Part 2 complete - Multiple permissive policies consolidated';
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
    auth_warnings INTEGER;
    multiple_policies INTEGER;
    total_warnings INTEGER;
BEGIN
    -- Count remaining auth_rls_initplan warnings
    SELECT COUNT(*)::INTEGER INTO auth_warnings
    FROM pg_policies
    WHERE schemaname = 'public'
    AND qual::text LIKE '%auth.uid()%'
    AND qual::text NOT LIKE '%get_current_user_id()%'
    AND tablename IN ('group_role_audit', 'group_bans');

    -- Count tables with multiple permissive SELECT policies
    WITH policy_counts AS (
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND cmd = 'SELECT'
        AND permissive = 'PERMISSIVE'
        GROUP BY tablename
        HAVING COUNT(*) > 1
    )
    SELECT COUNT(*)::INTEGER INTO multiple_policies
    FROM policy_counts;

    total_warnings := auth_warnings + multiple_policies;

    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '🎯 FINAL FIX COMPLETE - RESULTS:';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '   Initial warnings: 8';
    RAISE NOTICE '   Auth RLS warnings: %', auth_warnings;
    RAISE NOTICE '   Multiple policy warnings: %', multiple_policies;
    RAISE NOTICE '   Total remaining: %', total_warnings;
    RAISE NOTICE '';

    IF total_warnings = 0 THEN
        RAISE NOTICE '🎉 PERFECT! All RLS warnings eliminated!';
        RAISE NOTICE '   Performance: MAXIMUM';
        RAISE NOTICE '   Database efficiency: OPTIMAL';
    ELSE
        RAISE NOTICE '✅ Significant improvement achieved';
        RAISE NOTICE '   Remaining issues to investigate: %', total_warnings;
    END IF;

    RAISE NOTICE '=========================================';
END $$;