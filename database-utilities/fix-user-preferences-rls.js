#!/usr/bin/env node

/**
 * FIX USER_PREFERENCES TABLE RLS FOR ALGORITHM MANAGER
 *
 * The Algorithm Manager needs to load other users' preferences for testing
 * Currently getting 406 error when trying to load preferences for other users
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixUserPreferencesRLS() {
  console.log('🔧 Fixing user_preferences Table RLS for Algorithm Manager...\n');

  // The SQL to create the policy
  const sql = `
-- ============================================================================
-- FIX USER_PREFERENCES TABLE RLS FOR ALGORITHM MANAGER
-- ============================================================================

-- Allow executive admins to read any user's preferences (for testing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'user_preferences'
    AND policyname = 'Executive admins can view all preferences'
  ) THEN
    CREATE POLICY "Executive admins can view all preferences"
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (
      -- Allow if the requesting user is an executive admin
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND admin_role = 'executive_admin'
      )
    );
  END IF;
END $$;

-- Ensure the existing policy allows users to see their own preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'user_preferences'
    AND policyname = 'Users can view own preferences'
  ) THEN
    CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Also check if RLS is enabled on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
  `;

  console.log('📝 SQL to execute:');
  console.log(sql);
  console.log('\n' + '='.repeat(60));

  console.log('\n⚠️  IMPORTANT: Run this SQL in Supabase SQL Editor');
  console.log('   URL: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');

  // Try to check current policies
  const { data: currentPolicies, error } = await supabase
    .from('pg_policies')
    .select('policyname, cmd')
    .eq('tablename', 'user_preferences');

  if (!error && currentPolicies) {
    console.log('\n📋 Current policies on user_preferences table:');
    if (currentPolicies.length === 0) {
      console.log('   ❌ No RLS policies found!');
      console.log('   This might be why executive admins can\'t see other users\' preferences.');
    } else {
      currentPolicies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`);
      });
    }
  }

  // Test if we can access user_preferences with service role
  const { data: testAccess, error: testError } = await supabase
    .from('user_preferences')
    .select('user_id')
    .limit(1);

  if (testError) {
    console.log('\n⚠️ user_preferences table access error:', testError.message);
  } else {
    console.log(`\n✅ Service role can access user_preferences (found ${testAccess?.length || 0} records)`);
  }

  console.log('\n🔍 After running the SQL above:');
  console.log('   1. Executive admins can view any user\'s preferences');
  console.log('   2. Algorithm Manager can test with different users');
  console.log('   3. Regular users can still only see their own preferences');
}

fixUserPreferencesRLS();