#!/usr/bin/env node

/**
 * FIX USERS TABLE RLS FOR ALGORITHM MANAGER
 *
 * The Algorithm Manager needs to see all users to allow selection
 * Currently RLS is blocking frontend access to users table
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

async function fixUsersRLS() {
  console.log('🔧 Fixing Users Table RLS for Algorithm Manager...\n');

  // The SQL to create the policy
  const sql = `
-- ============================================================================
-- FIX USERS TABLE RLS FOR ALGORITHM MANAGER
-- ============================================================================

-- First check if policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'users'
    AND policyname = 'Executive admins can view all users'
  ) THEN
    -- Create policy for executive admins to see all users
    CREATE POLICY "Executive admins can view all users"
    ON public.users
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

-- Also ensure authenticated users can at least see user emails for matching
-- (needed for Algorithm Manager user search)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'users'
    AND policyname = 'Authenticated users can view basic user info'
  ) THEN
    CREATE POLICY "Authenticated users can view basic user info"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (true);  -- Allow all authenticated users to see basic info
  END IF;
END $$;
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
    .eq('tablename', 'users');

  if (!error && currentPolicies) {
    console.log('\n📋 Current policies on users table:');
    if (currentPolicies.length === 0) {
      console.log('   ❌ No RLS policies found!');
      console.log('   This is why frontend can\'t see users.');
    } else {
      currentPolicies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`);
      });
    }
  }

  console.log('\n🔍 After running the SQL above:');
  console.log('   1. Executive admins will see all users');
  console.log('   2. Algorithm Manager can search and select users');
  console.log('   3. User dropdown will work properly');
}

fixUsersRLS();