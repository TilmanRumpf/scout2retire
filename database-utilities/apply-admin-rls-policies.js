#!/usr/bin/env node

/**
 * APPLY ADMIN RLS POLICIES FOR TOWNS_HOBBIES
 *
 * Adds INSERT, UPDATE, and DELETE policies for admin users
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

console.log('🔐 APPLYING ADMIN RLS POLICIES FOR TOWNS_HOBBIES\n');
console.log('═'.repeat(70));

const policies = `
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admin insert to towns_hobbies" ON towns_hobbies;
DROP POLICY IF EXISTS "Allow admin update to towns_hobbies" ON towns_hobbies;
DROP POLICY IF EXISTS "Allow admin delete from towns_hobbies" ON towns_hobbies;

-- Create INSERT policy for admins
CREATE POLICY "Allow admin insert to towns_hobbies"
ON towns_hobbies FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'executive_admin')
  )
);

-- Create UPDATE policy for admins
CREATE POLICY "Allow admin update to towns_hobbies"
ON towns_hobbies FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'executive_admin')
  )
);

-- Create DELETE policy for admins
CREATE POLICY "Allow admin delete from towns_hobbies"
ON towns_hobbies FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'executive_admin')
  )
);
`;

try {
  console.log('\n📝 Executing SQL to create admin policies...\n');

  // Split into individual statements and execute
  const statements = policies
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.includes('DROP POLICY')) {
      console.log('🗑️  Dropping existing policy if exists...');
    } else if (statement.includes('CREATE POLICY')) {
      const policyName = statement.match(/CREATE POLICY "([^"]+)"/)?.[1];
      console.log(`✨ Creating policy: ${policyName}`);
    }

    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

    if (error) {
      // Try alternative method
      console.log('   Trying direct query...');
      const { error: queryError } = await supabase.from('_sql').select('*').limit(0);

      if (error.message.includes('function exec_sql') || error.message.includes('does not exist')) {
        console.log('   ⚠️  RPC method not available, using SQL Editor method...');
        throw new Error('NEED_MANUAL_SQL');
      }

      throw error;
    }
  }

  console.log('\n✅ All policies created successfully!');

  // Verify policies
  console.log('\n🔍 Verifying policies...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('pg_policies')
    .select('policyname, cmd')
    .eq('tablename', 'towns_hobbies')
    .in('policyname', [
      'Allow admin insert to towns_hobbies',
      'Allow admin update to towns_hobbies',
      'Allow admin delete from towns_hobbies'
    ]);

  if (!verifyError && verifyData) {
    console.log(`   Found ${verifyData.length} admin policies`);
    verifyData.forEach(p => {
      console.log(`   ✓ ${p.policyname} (${p.cmd})`);
    });
  }

  console.log('\n' + '═'.repeat(70));
  console.log('✅ ADMIN RLS POLICIES APPLIED!');
  console.log('\nAdmins can now:');
  console.log('  • INSERT new hobby associations (including exclusions)');
  console.log('  • UPDATE existing associations');
  console.log('  • DELETE associations');
  console.log('\n🎯 Test: Try excluding a hobby in the admin UI');
  console.log('═'.repeat(70));

} catch (error) {
  console.error('\n❌ Error applying policies:', error.message);

  console.log('\n⚠️  Could not apply via script. Please run this SQL manually in Supabase SQL Editor:\n');
  console.log(policies);
  console.log('\n💡 After running the SQL, the exclude/restore functionality will work.');

  process.exit(1);
}
