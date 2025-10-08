-- 🖼️ ADD GROUP IMAGE URL COLUMN TO chat_threads
-- Allows storing group chat logos/avatars

-- ============================================================================
-- 1. ADD COLUMN TO chat_threads
-- ============================================================================

ALTER TABLE chat_threads
ADD COLUMN IF NOT EXISTS group_image_url TEXT;

COMMENT ON COLUMN chat_threads.group_image_url IS 'URL to group chat logo/avatar image stored in Supabase Storage';

-- ============================================================================
-- 2. CREATE STORAGE BUCKET FOR GROUP AVATARS (if not exists)
-- ============================================================================

-- Note: Storage buckets must be created via Supabase Dashboard or API
-- This is a reference for manual setup:
--
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket named: group-avatars
-- 3. Set public: true (so images are publicly accessible)
-- 4. Add RLS policies:
--    - Allow authenticated users to upload
--    - Allow public read access

-- ============================================================================
-- 3. STORAGE RLS POLICIES
-- ============================================================================

-- Note: These policies are applied to the storage.objects table
-- Run these AFTER creating the bucket in Supabase Dashboard

-- Allow authenticated users to upload group avatars
-- CREATE POLICY "Authenticated users can upload group avatars"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'group-avatars');

-- Allow authenticated users to update their own uploads
-- CREATE POLICY "Users can update their own group avatars"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'group-avatars' AND auth.uid()::text = owner);

-- Allow public read access to group avatars
-- CREATE POLICY "Public read access to group avatars"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'group-avatars');
