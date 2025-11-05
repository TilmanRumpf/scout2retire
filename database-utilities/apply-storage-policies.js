/**
 * APPLY: Storage RLS Policies for town-images bucket
 * Uses Supabase SDK to programmatically apply policies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyStoragePolicies() {
  console.log('🔧 APPLYING STORAGE RLS POLICIES FOR town-images\n');
  console.log('='.repeat(80));

  const policies = [
    {
      name: 'Drop old policies',
      sql: `
        DROP POLICY IF EXISTS "Anyone can view town images" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated users can upload town images" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated users can update town images" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated users can delete town images" ON storage.objects;
      `
    },
    {
      name: 'SELECT policy (anyone can view)',
      sql: `
        CREATE POLICY "Anyone can view town images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'town-images');
      `
    },
    {
      name: 'INSERT policy (authenticated can upload)',
      sql: `
        CREATE POLICY "Authenticated users can upload town images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'town-images');
      `
    },
    {
      name: 'UPDATE policy (authenticated can update)',
      sql: `
        CREATE POLICY "Authenticated users can update town images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'town-images');
      `
    },
    {
      name: 'DELETE policy (authenticated can delete)',
      sql: `
        CREATE POLICY "Authenticated users can delete town images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'town-images');
      `
    }
  ];

  console.log('\n📋 This will execute the following policies:');
  policies.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name}`);
  });
  console.log('\n' + '='.repeat(80));

  // Execute each policy
  for (const policy of policies) {
    console.log(`\n⚙️  Applying: ${policy.name}...`);

    try {
      // Use the REST API directly to execute SQL
      const response = await fetch(
        `${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ query: policy.sql })
        }
      );

      if (!response.ok) {
        const error = await response.text();

        // If exec_sql doesn't exist, try alternative method
        if (error.includes('does not exist') || error.includes('not found')) {
          console.log('   ⚠️  Direct SQL execution not available via API');
          console.log('   📋 Will output SQL for manual execution at end\n');
          continue;
        }

        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      console.log('   ✅ Applied successfully');
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);

      // Continue with other policies
      console.log('   ⏭️  Continuing with remaining policies...\n');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 MANUAL SQL (if automatic execution failed):');
  console.log('\nCopy and paste this into Supabase Dashboard → SQL Editor:\n');

  const allSQL = policies.map(p => p.sql).join('\n\n');
  console.log(allSQL);

  console.log('\n' + '='.repeat(80));
  console.log('✅ DONE\n');
  console.log('Next step: Run test-town-image-upload.js to verify upload works');
}

applyStoragePolicies().catch(error => {
  console.error('\n❌ UNEXPECTED ERROR:', error);
  process.exit(1);
});
