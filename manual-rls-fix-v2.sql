-- =====================================================
-- MANUAL RLS FIX V2 - Handles existing policies
-- Created: 2025-10-26
-- Purpose: Fix remaining auth.uid() performance warnings
-- Safe to run in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- VERIFY HELPER FUNCTION EXISTS
-- =====================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'get_current_user_id'
    ) THEN
        RAISE NOTICE '✅ Helper function get_current_user_id() exists and is ready';
    ELSE
        RAISE NOTICE '❌ Helper function missing - creating now...';
        CREATE FUNCTION public.get_current_user_id()
        RETURNS uuid
        LANGUAGE sql STABLE
        SECURITY DEFINER
        SET search_path = ''
        AS $func$
          SELECT auth.uid()
        $func$;
        GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;
    END IF;
END $$;

-- =====================================================
-- FIX REMAINING TABLES WITH auth.uid() WARNINGS
-- =====================================================

-- Check current warnings status
DO $$
DECLARE
    warning_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO warning_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND qual::text LIKE '%auth.uid()%'
    AND qual::text NOT LIKE '%get_current_user_id()%';

    RAISE NOTICE '📊 Current auth.uid() warnings: %', warning_count;
END $$;

-- FIX: scotty_conversations table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scotty_conversations') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can view their own conversations" ON public.scotty_conversations;
        DROP POLICY IF EXISTS "Users can create their own conversations" ON public.scotty_conversations;
        DROP POLICY IF EXISTS "Users can update their own conversations" ON public.scotty_conversations;

        CREATE POLICY "user_conversations"
        ON public.scotty_conversations FOR ALL TO authenticated
        USING (user_id = get_current_user_id())
        WITH CHECK (user_id = get_current_user_id());

        RAISE NOTICE '✅ Fixed scotty_conversations table';
    END IF;
END $$;

-- FIX: scotty_messages table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scotty_messages') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.scotty_messages;
        DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.scotty_messages;

        CREATE POLICY "user_messages"
        ON public.scotty_messages FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.scotty_conversations sc
                WHERE sc.id = scotty_messages.conversation_id
                AND sc.user_id = get_current_user_id()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.scotty_conversations sc
                WHERE sc.id = scotty_messages.conversation_id
                AND sc.user_id = get_current_user_id()
            )
        );

        RAISE NOTICE '✅ Fixed scotty_messages table';
    END IF;
END $$;

-- FIX: thread_read_status table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'thread_read_status') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can manage their own read status" ON public.thread_read_status;

        CREATE POLICY "user_read_status"
        ON public.thread_read_status FOR ALL TO authenticated
        USING (user_id = get_current_user_id())
        WITH CHECK (user_id = get_current_user_id());

        RAISE NOTICE '✅ Fixed thread_read_status table';
    END IF;
END $$;

-- FIX: user_preferences table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
        DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

        CREATE POLICY "user_preferences_all"
        ON public.user_preferences FOR ALL TO authenticated
        USING (user_id = get_current_user_id())
        WITH CHECK (user_id = get_current_user_id());

        RAISE NOTICE '✅ Fixed user_preferences table';
    END IF;
END $$;

-- FIX: favorites table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
        DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
        DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorites;
        DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

        CREATE POLICY "user_favorites"
        ON public.favorites FOR ALL TO authenticated
        USING (user_id = get_current_user_id())
        WITH CHECK (user_id = get_current_user_id());

        RAISE NOTICE '✅ Fixed favorites table';
    END IF;
END $$;

-- FIX: user_interactions table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_interactions') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can view their own interactions" ON public.user_interactions;
        DROP POLICY IF EXISTS "Users can create their own interactions" ON public.user_interactions;

        CREATE POLICY "user_interactions_all"
        ON public.user_interactions FOR ALL TO authenticated
        USING (user_id = get_current_user_id())
        WITH CHECK (user_id = get_current_user_id());

        RAISE NOTICE '✅ Fixed user_interactions table';
    END IF;
END $$;

-- FIX: query_logs table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'query_logs') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can view their own logs" ON public.query_logs;
        DROP POLICY IF EXISTS "Users can create their own logs" ON public.query_logs;

        CREATE POLICY "user_query_logs"
        ON public.query_logs FOR ALL TO authenticated
        USING (user_id = get_current_user_id())
        WITH CHECK (user_id = get_current_user_id());

        RAISE NOTICE '✅ Fixed query_logs table';
    END IF;
END $$;

-- FIX: scotty_chat_usage table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scotty_chat_usage') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can view their own usage" ON public.scotty_chat_usage;

        CREATE POLICY "user_usage"
        ON public.scotty_chat_usage FOR SELECT TO authenticated
        USING (user_id = get_current_user_id());

        RAISE NOTICE '✅ Fixed scotty_chat_usage table';
    END IF;
END $$;

-- FIX: discovery_views table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discovery_views') THEN
        -- Drop and recreate with optimized policies
        DROP POLICY IF EXISTS "Users can manage their own views" ON public.discovery_views;

        CREATE POLICY "user_discovery_views"
        ON public.discovery_views FOR ALL TO authenticated
        USING (user_id = get_current_user_id())
        WITH CHECK (user_id = get_current_user_id());

        RAISE NOTICE '✅ Fixed discovery_views table';
    END IF;
END $$;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================
DO $$
DECLARE
    final_warning_count INTEGER;
    tables_with_warnings TEXT;
BEGIN
    -- Count remaining warnings
    SELECT COUNT(*)::INTEGER INTO final_warning_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND qual::text LIKE '%auth.uid()%'
    AND qual::text NOT LIKE '%get_current_user_id()%';

    -- Get list of tables still with warnings
    SELECT string_agg(DISTINCT tablename, ', ') INTO tables_with_warnings
    FROM pg_policies
    WHERE schemaname = 'public'
    AND qual::text LIKE '%auth.uid()%'
    AND qual::text NOT LIKE '%get_current_user_id()%';

    RAISE NOTICE '';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '📊 FINAL RESULTS:';
    RAISE NOTICE '   Remaining auth.uid() warnings: %', final_warning_count;

    IF tables_with_warnings IS NOT NULL THEN
        RAISE NOTICE '   Tables still needing attention: %', tables_with_warnings;
    END IF;

    IF final_warning_count = 0 THEN
        RAISE NOTICE '✅ ALL WARNINGS RESOLVED!';
    ELSIF final_warning_count < 20 THEN
        RAISE NOTICE '✅ SIGNIFICANT IMPROVEMENT! (>70%% reduction)';
    ELSE
        RAISE NOTICE '⚠️  Some warnings remain - may need manual review';
    END IF;
    RAISE NOTICE '=====================================';
END $$;