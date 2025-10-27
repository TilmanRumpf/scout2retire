#!/usr/bin/env node

/**
 * Check current RLS policies on the users table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking current RLS policies on users table...\n');

  try {
    // Query to get RLS policies for users table
    const query = `
      SELECT
        pol.polname as policy_name,
        pol.polcmd as command,
        CASE
          WHEN pol.polpermissive THEN 'PERMISSIVE'
          ELSE 'RESTRICTIVE'
        END as type,
        pol.polroles::text as roles,
        pg_get_expr(pol.polqual, pol.polrelid) as using_expr,
        pg_get_expr(pol.polwithcheck, pol.polrelid) as check_expr
      FROM pg_policy pol
      JOIN pg_class cls ON pol.polrelid = cls.oid
      JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
      WHERE nsp.nspname = 'public'
        AND cls.relname = 'users'
      ORDER BY pol.polname;
    `;

    // Execute raw SQL query
    const { data, error } = await supabase.rpc('exec_sql', { sql: query }).catch(async () => {
      // Try alternative approach
      console.log('⚠️ exec_sql not available, trying alternative...\n');
      return { data: null, error: 'Need manual check' };
    });

    if (error === 'Need manual check') {
      console.log('📋 Please run this query in Supabase SQL Editor:\n');
      console.log(query);
      console.log('\n');
    } else if (data) {
      console.log('📋 Current RLS Policies on users table:\n');

      data.forEach((policy, index) => {
        console.log(`${index + 1}. Policy: ${policy.policy_name}`);
        console.log(`   Command: ${policy.command}`);
        console.log(`   Type: ${policy.type}`);
        console.log(`   USING: ${policy.using_expr || 'N/A'}`);
        console.log(`   WITH CHECK: ${policy.check_expr || 'N/A'}`);
        console.log('');
      });
    }

    // Check if RLS is enabled
    const rlsCheckQuery = `
      SELECT
        cls.relname as table_name,
        cls.relrowsecurity as rls_enabled,
        cls.relforcerowsecurity as rls_forced
      FROM pg_class cls
      JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
      WHERE nsp.nspname = 'public'
        AND cls.relname = 'users';
    `;

    const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsCheckQuery }).catch(() => {
      return { data: null, error: 'Need manual check' };
    });

    if (!rlsError && rlsStatus) {
      console.log('📊 RLS Status:');
      rlsStatus.forEach(status => {
        console.log(`  - Table: ${status.table_name}`);
        console.log(`  - RLS Enabled: ${status.rls_enabled ? '✅ YES' : '❌ NO'}`);
        console.log(`  - RLS Forced: ${status.rls_forced ? '✅ YES' : '❌ NO'}`);
      });
    }

    // Test if admin check works
    console.log('\n🔍 Testing admin access for Tilman...\n');

    // Check if is_user_admin function exists and works
    const { data: adminTest, error: adminError } = await supabase
      .rpc('is_user_admin')
      .catch(() => ({ data: null, error: 'Function not found' }));

    if (adminError) {
      console.log('⚠️ is_user_admin() function:', adminError);
    } else {
      console.log('✅ is_user_admin() function exists');
      console.log('   Result:', adminTest);
    }

    // Check if check_admin_access works
    const { data: accessTest, error: accessError } = await supabase
      .rpc('check_admin_access', { p_required_role: 'admin' })
      .catch(() => ({ data: null, error: 'Function not found' }));

    if (accessError) {
      console.log('⚠️ check_admin_access() function:', accessError);
    } else {
      console.log('✅ check_admin_access() function exists');
      console.log('   Result:', accessTest);
    }

    // Manual SQL to check RLS policies
    console.log('\n📝 SQL to check RLS policies manually:\n');
    console.log(`-- Check all policies on users table
SELECT
  pol.polname as policy_name,
  pol.polcmd as command,
  CASE
    WHEN pol.polpermissive THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END as type,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expr,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as check_expr
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'public'
  AND cls.relname = 'users'
ORDER BY pol.polname;`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkRLSPolicies();