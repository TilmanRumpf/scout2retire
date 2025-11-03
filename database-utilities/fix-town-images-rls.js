/**
 * FIX: Apply RLS policies for town-images storage bucket
 *
 * Issue: Users cannot upload images - "new row violates row-level security policy"
 * Cause: No RLS policies exist for town-images bucket on storage.objects
 * Fix: Add policies to allow authenticated users to upload
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixStorageRLS() {
  console.log('🔧 FIXING TOWN-IMAGES STORAGE RLS POLICIES\n');
  console.log('='.repeat(80));

  const policies = `
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

-- UPDATE: Authenticated users can update/replace (for upsert)
CREATE POLICY "Authenticated users can update town images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'town-images');

-- DELETE: Authenticated users can delete
CREATE POLICY "Authenticated users can delete town images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'town-images');
  `;

  console.log('📝 SQL to execute:\n');
  console.log(policies);
  console.log('\n' + '='.repeat(80));

  try {
    console.log('\n⚙️  Executing SQL...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: policies });

    if (error) {
      // If exec_sql function doesn't exist, print manual instructions
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('⚠️  Cannot execute SQL directly from Node.js');
        console.log('');
        console.log('📋 MANUAL STEPS:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Copy and paste the SQL above');
        console.log('3. Click "Run"');
        console.log('');
        console.log('OR use psql:');
        console.log('   psql $DATABASE_URL << EOF');
        console.log(policies);
        console.log('   EOF');
      } else {
        throw error;
      }
    } else {
      console.log('✅ RLS policies applied successfully!');
    }

  } catch (error) {
    console.error('❌ Error executing SQL:', error.message);
    console.log('\n📋 Please run the SQL manually in Supabase Dashboard');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ DONE\n');
  console.log('Next step: Run test-town-image-upload.js to verify the fix');
}

fixStorageRLS().catch(console.error);
