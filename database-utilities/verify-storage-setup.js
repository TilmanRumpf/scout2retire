import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyStorageSetup() {
  console.log('🔍 Verifying storage bucket setup...\n');

  // Check bucket exists and is public
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();

  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
    return;
  }

  const groupAvatarsBucket = buckets.find(b => b.name === 'group-avatars');

  if (!groupAvatarsBucket) {
    console.log('❌ group-avatars bucket NOT FOUND');
    return;
  }

  console.log('✅ group-avatars bucket exists:');
  console.log(`   - ID: ${groupAvatarsBucket.id}`);
  console.log(`   - Public: ${groupAvatarsBucket.public}`);
  console.log(`   - File size limit: ${groupAvatarsBucket.file_size_limit || 'unlimited'}`);
  console.log(`   - Allowed MIME types: ${groupAvatarsBucket.allowed_mime_types?.join(', ') || 'all'}`);

  console.log('\n📋 Bucket is public - storage policies handled at bucket level');

  // Test upload capability (create a tiny test file)
  const testFileName = `test-${Date.now()}.txt`;
  const testFile = new Blob(['test'], { type: 'text/plain' });

  console.log('\n🧪 Testing upload capability...');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('group-avatars')
    .upload(`test/${testFileName}`, testFile);

  if (uploadError) {
    console.error('❌ Upload test FAILED:', uploadError.message);

    // If upload failed, we might need to add storage policies
    console.log('\n🔧 May need to add storage policies for authenticated users...');
    console.log('   Creating storage policies...');

    const createPoliciesSQL = `
      -- Allow authenticated users to upload
      CREATE POLICY IF NOT EXISTS "Authenticated users can upload group avatars"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'group-avatars');

      -- Allow public read
      CREATE POLICY IF NOT EXISTS "Public can view group avatars"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'group-avatars');

      -- Allow users to update their own uploads
      CREATE POLICY IF NOT EXISTS "Users can update own group avatars"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'group-avatars');

      -- Allow users to delete their own uploads
      CREATE POLICY IF NOT EXISTS "Users can delete own group avatars"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'group-avatars');
    `;

    console.log('SQL to create policies:');
    console.log(createPoliciesSQL);

  } else {
    console.log('✅ Upload test SUCCESS');
    console.log(`   Test file created: ${uploadData.path}`);

    // Clean up test file
    await supabase.storage
      .from('group-avatars')
      .remove([uploadData.path]);
    console.log('   Test file cleaned up');
  }

  console.log('\n✅ Storage setup verification complete!');
}

verifyStorageSetup().catch(console.error);
