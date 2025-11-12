-- =====================================================
-- FIX: Allow anonymous users to read towns table
-- Problem: Towns table RLS policies restrict to "authenticated" only
-- Solution: Allow both anon and authenticated roles to SELECT
-- Date: November 11, 2025
-- =====================================================

-- First, verify RLS is enabled on towns
ALTER TABLE towns ENABLE ROW LEVEL SECURITY;

-- Drop existing SELECT policies (they're too restrictive)
DROP POLICY IF EXISTS "towns_unified_select" ON towns;
DROP POLICY IF EXISTS "towns_public_view" ON towns;
DROP POLICY IF EXISTS "towns_select_policy" ON towns;
DROP POLICY IF EXISTS "Towns are viewable by everyone" ON towns;
DROP POLICY IF EXISTS "Enable read access for all users" ON towns;

-- Create new SELECT policy that allows BOTH anon and authenticated roles
-- This is the correct pattern for public data
CREATE POLICY "towns_public_read"
ON towns
FOR SELECT
TO anon, authenticated  -- KEY FIX: Both roles can read
USING (true);  -- All rows are visible (public data)

-- Verify admin-only write policies exist
-- These should ONLY allow authenticated admins to modify data
DO $$
BEGIN
    -- Check if admin INSERT policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'towns'
        AND policyname = 'towns_admin_insert'
    ) THEN
        CREATE POLICY "towns_admin_insert"
        ON towns
        FOR INSERT
        TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM users u
                WHERE u.id = auth.uid()
                AND u.is_admin = true
            )
        );
        RAISE NOTICE '✅ Created towns_admin_insert policy';
    END IF;

    -- Check if admin UPDATE policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'towns'
        AND policyname = 'towns_admin_update'
    ) THEN
        CREATE POLICY "towns_admin_update"
        ON towns
        FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM users u
                WHERE u.id = auth.uid()
                AND u.is_admin = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM users u
                WHERE u.id = auth.uid()
                AND u.is_admin = true
            )
        );
        RAISE NOTICE '✅ Created towns_admin_update policy';
    END IF;

    -- Check if admin DELETE policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'towns'
        AND policyname = 'towns_admin_delete'
    ) THEN
        CREATE POLICY "towns_admin_delete"
        ON towns
        FOR DELETE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM users u
                WHERE u.id = auth.uid()
                AND u.is_admin = true
            )
        );
        RAISE NOTICE '✅ Created towns_admin_delete policy';
    END IF;

    RAISE NOTICE '✅ Towns table RLS policies configured correctly';
    RAISE NOTICE '   - Public read: ✅ (anon + authenticated)';
    RAISE NOTICE '   - Admin write: ✅ (authenticated admins only)';
END $$;

-- Test the fix
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'towns';

    RAISE NOTICE '';
    RAISE NOTICE '📊 Summary: % policies on towns table', policy_count;
    RAISE NOTICE '   Expected: 4 (1 SELECT + 3 admin write)';
END $$;
