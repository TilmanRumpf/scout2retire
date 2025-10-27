#!/usr/bin/env node

// CHECK CURRENT RLS POLICIES ON USERS TABLE

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkUsersRLSPolicies() {
  console.log('🔍 CHECKING RLS POLICIES ON users TABLE');
  console.log('='.repeat(80));
  console.log('');

  // Query pg_policies to see all policies on users table
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      SELECT
        policyname,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'users'
      ORDER BY policyname;
    `
  });

  if (error) {
    console.log('⚠️ Could not use RPC, trying direct query...');

    // Direct SQL query
    const { data: policies, error: policyError } = await supabase
      .from('users')
      .select('*')
      .limit(0); // Just to test connection

    // Try alternate method with information_schema
    const queryText = `
      SELECT
        pol.policyname,
        pol.cmd,
        pol.permissive,
        pol.roles::text[],
        pg_get_expr(pol.qual, pol.polrelid) as using_expression,
        pg_get_expr(pol.with_check, pol.polrelid) as check_expression
      FROM pg_policy pol
      JOIN pg_class pc ON pol.polrelid = pc.oid
      JOIN pg_namespace pn ON pc.relnamespace = pn.oid
      WHERE pn.nspname = 'public'
        AND pc.relname = 'users'
      ORDER BY pol.policyname;
    `;

    console.log('📋 SQL Query to run manually in Supabase SQL Editor:');
    console.log('');
    console.log(queryText);
    console.log('');
    console.log('='.repeat(80));
    console.log('');
    console.log('⚠️ Cannot automatically query policies from this environment.');
    console.log('   Please run the SQL above in Supabase SQL Editor to see current policies.');
    console.log('');

    // Show what we know from error
    if (policyError) {
      console.log('Connection test result:', policyError.message);
    }

    return;
  }

  console.log('✅ Current RLS policies on users table:');
  console.log('');

  if (!data || data.length === 0) {
    console.log('   No policies found (or query failed)');
  } else {
    data.forEach(policy => {
      console.log(`📝 Policy: ${policy.policyname}`);
      console.log(`   Command: ${policy.cmd}`);
      console.log(`   Using: ${policy.qual}`);
      console.log(`   With Check: ${policy.with_check}`);
      console.log('');
    });
  }
}

checkUsersRLSPolicies().catch(console.error);
