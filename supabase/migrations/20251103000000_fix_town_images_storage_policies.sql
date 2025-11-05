-- FIX: Add RLS policies for town-images bucket
-- The bucket exists but has NO upload policies, so uploads fail with 403

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('town-images', 'town-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop any existing policies (clean slate)
DROP POLICY IF EXISTS "Anyone can view town images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload town images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update town images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete town images" ON storage.objects;

-- SELECT: Anyone can view (bucket is public)
CREATE POLICY "Anyone can view town images"
ON storage.objects FOR SELECT
USING (bucket_id = 'town-images');

-- INSERT: Authenticated users can upload
CREATE POLICY "Authenticated users can upload town images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'town-images');

-- UPDATE: Authenticated users can update/replace (upsert)
CREATE POLICY "Authenticated users can update town images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'town-images');

-- DELETE: Authenticated users can delete
CREATE POLICY "Authenticated users can delete town images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'town-images');
