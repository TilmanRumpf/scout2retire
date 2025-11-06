/**
 * TEST: Town Image Upload
 *
 * Tests the complete upload flow to diagnose issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Test with service role (admin) AND anon key (user)
const adminClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testUploadFlow() {
  console.log('🧪 TESTING TOWN IMAGE UPLOAD FLOW\n');
  console.log('='.repeat(80));

  // Step 1: Check if bucket exists
  console.log('\n1️⃣  Checking if town-images bucket exists...');
  const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();

  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
    return;
  }

  const townImagesBucket = buckets.find(b => b.name === 'town-images');

  if (!townImagesBucket) {
    console.error('❌ town-images bucket DOES NOT EXIST');
    console.log('\n💡 FIX: Create bucket manually in Supabase dashboard or run:');
    console.log('   INSERT INTO storage.buckets (id, name, public) VALUES (\'town-images\', \'town-images\', true);');
    return;
  }

  console.log('✅ town-images bucket exists');
  console.log(`   - Public: ${townImagesBucket.public}`);
  console.log(`   - Created: ${townImagesBucket.created_at}`);

  // Step 2: Check storage policies
  console.log('\n2️⃣  Checking storage.objects RLS policies...');
  const { data: policies, error: policiesError } = await adminClient
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'objects')
    .eq('schemaname', 'storage');

  if (policiesError) {
    console.log('⚠️  Could not check policies (this is OK, might need admin)');
  } else if (policies) {
    const townImagesPolicies = policies.filter(p =>
      p.definition && p.definition.includes('town-images')
    );
    console.log(`✅ Found ${townImagesPolicies.length} policies for town-images bucket`);
    townImagesPolicies.forEach(p => {
      console.log(`   - ${p.policyname} (${p.cmd})`);
    });

    if (townImagesPolicies.length === 0) {
      console.log('⚠️  NO POLICIES FOUND FOR town-images bucket!');
      console.log('   This is likely why uploads fail');
    }
  }

  // Step 3: List files in bucket (check access)
  console.log('\n3️⃣  Testing bucket access (list files)...');
  const { data: files, error: listError } = await adminClient.storage
    .from('town-images')
    .list('', { limit: 5 });

  if (listError) {
    console.error('❌ Cannot list files:', listError.message);
  } else {
    console.log(`✅ Successfully listed files: ${files.length} files found`);
    if (files.length > 0) {
      console.log('   Sample files:', files.slice(0, 3).map(f => f.town_name).join(', '));
    }
  }

  // Step 4: Test ADMIN upload
  console.log('\n4️⃣  Testing upload with SERVICE ROLE KEY (admin)...');
  const testFileName = `test/admin-test-${Date.now()}.txt`;
  const testContent = new Blob(['Admin test file'], { type: 'text/plain' });

  const { data: adminUpload, error: adminUploadError } = await adminClient.storage
    .from('town-images')
    .upload(testFileName, testContent);

  if (adminUploadError) {
    console.error('❌ ADMIN UPLOAD FAILED:', adminUploadError.message);
    console.error('   Error details:', JSON.stringify(adminUploadError, null, 2));
  } else {
    console.log('✅ ADMIN UPLOAD SUCCESS:', adminUpload.path);

    // Clean up
    await adminClient.storage.from('town-images').remove([testFileName]);
    console.log('   (Test file cleaned up)');
  }

  // Step 5: Test USER upload (anon key - what frontend uses)
  console.log('\n5️⃣  Testing upload with ANON KEY (what frontend uses)...');
  const userTestFileName = `test/user-test-${Date.now()}.txt`;
  const userTestContent = new Blob(['User test file'], { type: 'text/plain' });

  const { data: userUpload, error: userUploadError } = await userClient.storage
    .from('town-images')
    .upload(userTestFileName, userTestContent);

  if (userUploadError) {
    console.error('❌ USER UPLOAD FAILED:', userUploadError.message);
    console.error('   Error details:', JSON.stringify(userUploadError, null, 2));
    console.log('\n💡 This is the problem! Frontend uses anon key and it cannot upload.');
    console.log('   Need to add RLS policies for authenticated users.');
  } else {
    console.log('✅ USER UPLOAD SUCCESS:', userUpload.path);

    // Clean up
    await adminClient.storage.from('town-images').remove([userTestFileName]);
    console.log('   (Test file cleaned up)');
  }

  // Step 6: Test authenticated user upload
  console.log('\n6️⃣  Testing upload as AUTHENTICATED USER...');

  // Try to sign in a test user or check if already signed in
  const { data: session } = await userClient.auth.getSession();

  if (session?.session) {
    console.log(`✅ Already authenticated as: ${session.session.user.email}`);

    const authTestFileName = `test/auth-test-${Date.now()}.txt`;
    const authTestContent = new Blob(['Auth user test file'], { type: 'text/plain' });

    const { data: authUpload, error: authUploadError } = await userClient.storage
      .from('town-images')
      .upload(authTestFileName, authTestContent);

    if (authUploadError) {
      console.error('❌ AUTHENTICATED USER UPLOAD FAILED:', authUploadError.message);
      console.error('   Error details:', JSON.stringify(authUploadError, null, 2));
    } else {
      console.log('✅ AUTHENTICATED USER UPLOAD SUCCESS:', authUpload.path);

      // Clean up
      await adminClient.storage.from('town-images').remove([authTestFileName]);
      console.log('   (Test file cleaned up)');
    }
  } else {
    console.log('⏭️  Skipping authenticated test (no session)');
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY:\n');
  console.log('Bucket exists:', townImagesBucket ? '✅' : '❌');
  console.log('Admin can upload:', !adminUploadError ? '✅' : '❌');
  console.log('User (anon) can upload:', !userUploadError ? '✅' : '❌');

  if (userUploadError) {
    console.log('\n🔧 RECOMMENDED FIX:');
    console.log('Run this migration:');
    console.log('   supabase/migrations/20251103000000_fix_town_images_storage_policies.sql');
    console.log('\nOr run manually:');
    console.log(`
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload town images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'town-images');

-- Allow anyone to view (bucket is public)
CREATE POLICY "Anyone can view town images"
ON storage.objects FOR SELECT
USING (bucket_id = 'town-images');

-- Allow authenticated users to update (upsert)
CREATE POLICY "Authenticated users can update town images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'town-images');
    `);
  } else {
    console.log('\n✅ Everything works! Upload should function correctly.');
  }
}

testUploadFlow().catch(error => {
  console.error('\n❌ UNEXPECTED ERROR:', error);
  process.exit(1);
});
