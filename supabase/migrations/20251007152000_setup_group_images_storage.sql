-- Setup storage bucket for group images

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-images', 'group-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for group-images bucket
DROP POLICY IF EXISTS "Anyone can view group images" ON storage.objects;
CREATE POLICY "Anyone can view group images"
ON storage.objects FOR SELECT
USING (bucket_id = 'group-images');

DROP POLICY IF EXISTS "Authenticated users can upload group images" ON storage.objects;
CREATE POLICY "Authenticated users can upload group images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'group-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'group-images' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'group-images' AND auth.uid() = owner);
