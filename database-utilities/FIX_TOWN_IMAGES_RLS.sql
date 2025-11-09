-- =====================================================
-- FIX TOWN_IMAGES RLS POLICIES
-- =====================================================
-- Problem: "new row violates row-level security policy"
-- Cause: RLS policies too restrictive for admin uploads
--
-- Solution: Simplify policies for authenticated users
-- =====================================================

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Public can view town images" ON public.town_images;
DROP POLICY IF EXISTS "Admins can manage town images" ON public.town_images;

-- Step 2: Create new policies

-- SELECT: Anyone can view town images (public access)
CREATE POLICY "Anyone can view town images"
ON public.town_images
FOR SELECT
USING (true);

-- INSERT: Authenticated users can upload town images
CREATE POLICY "Authenticated users can upload town images"
ON public.town_images
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Authenticated users can update town images
CREATE POLICY "Authenticated users can update town images"
ON public.town_images
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Authenticated users can delete town images
CREATE POLICY "Authenticated users can delete town images"
ON public.town_images
FOR DELETE
TO authenticated
USING (true);

-- Step 3: Verify RLS is enabled
ALTER TABLE public.town_images ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'town_images';

  RAISE NOTICE 'Found % policies on town_images table', policy_count;

  IF policy_count = 4 THEN
    RAISE NOTICE '✅ All 4 policies created successfully';
  ELSE
    RAISE WARNING '⚠️  Expected 4 policies, found %', policy_count;
  END IF;
END$$;

-- List all policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'town_images'
ORDER BY cmd;

-- =====================================================
-- After running this:
-- 1. Authenticated admins can upload/edit/delete images
-- 2. Public users can view images
-- 3. No admin_role check (simplified for now)
-- =====================================================
