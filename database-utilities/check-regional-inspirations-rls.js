// Check RLS policies on regional_inspirations table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n🔍 CHECKING RLS POLICIES ON regional_inspirations\n');

// Get policies using service role (bypasses RLS)
const { data: policies, error } = await supabase
  .from('pg_policies')
  .select('*')
  .eq('tablename', 'regional_inspirations');

if (error) {
  console.error('Error fetching policies:', error);
  console.log('\nTry running this SQL in Supabase Dashboard:\n');
  console.log(`
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'regional_inspirations'
ORDER BY policyname;
  `);
} else {
  console.log(`Found ${policies?.length || 0} RLS policies:\n`);

  policies?.forEach(p => {
    console.log(`📋 Policy: ${p.policyname}`);
    console.log(`   Command: ${p.cmd}`);
    console.log(`   For roles: ${p.roles}`);
    console.log(`   Condition (qual): ${p.qual}`);
    console.log(`   With check: ${p.with_check || 'N/A'}`);
    console.log('');
  });
}

// Test with anon key (what frontend uses)
console.log('\n🧪 TESTING WITH ANON KEY (what admin frontend uses):\n');

const anonSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data: anonData, error: anonError } = await anonSupabase
  .from('regional_inspirations')
  .select('id, title, is_active')
  .order('display_order');

if (anonError) {
  console.error('Error with anon key:', anonError);
} else {
  console.log(`Anon key sees ${anonData.length} inspirations`);
  console.log(`Active: ${anonData.filter(i => i.is_active).length}`);
  console.log(`Inactive: ${anonData.filter(i => !i.is_active).length}`);
}

// Test with service role
console.log('\n🔑 TESTING WITH SERVICE ROLE KEY:\n');

const { data: serviceData, error: serviceError } = await supabase
  .from('regional_inspirations')
  .select('id, title, is_active')
  .order('display_order');

if (serviceError) {
  console.error('Error with service role:', serviceError);
} else {
  console.log(`Service role sees ${serviceData.length} inspirations`);
  console.log(`Active: ${serviceData.filter(i => i.is_active).length}`);
  console.log(`Inactive: ${serviceData.filter(i => !i.is_active).length}`);
}

console.log('\n');
