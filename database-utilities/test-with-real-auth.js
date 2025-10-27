#!/usr/bin/env node

// TEST WITH REAL AUTHENTICATION CONTEXT

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function testWithRealAuth() {
  console.log('🔍 TESTING USERS TABLE RLS POLICIES');
  console.log('='.repeat(80));
  console.log('');

  // First, get Tilman's ID using service key
  const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: tilmanData } = await serviceClient
    .from('users')
    .select('id, email')
    .eq('email', 'tilman.rumpf@gmail.com')
    .single();

  if (!tilmanData) {
    console.error('❌ Could not find Tilman');
    return;
  }

  console.log('✅ Found Tilman:', tilmanData.email);
  console.log(`   ID: ${tilmanData.id}`);
  console.log('');

  // Test 1: Query with ANON key and NO auth context
  console.log('🧪 TEST 1: ANON key with NO auth (should fail)');
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  const { data: test1Data, error: test1Error } = await anonClient
    .from('users')
    .select('admin_role')
    .eq('id', tilmanData.id)
    .single();

  if (test1Error) {
    console.log('❌ Failed (expected):', test1Error.message);
  } else {
    console.log('✅ Succeeded:', test1Data);
  }
  console.log('');

  // Test 2: Query using SERVICE key (bypasses RLS)
  console.log('🧪 TEST 2: SERVICE key (should always work)');
  const { data: test2Data, error: test2Error } = await serviceClient
    .from('users')
    .select('admin_role, is_admin')
    .eq('id', tilmanData.id)
    .single();

  if (test2Error) {
    console.log('❌ Failed:', test2Error.message);
  } else {
    console.log('✅ Succeeded:');
    console.log(`   admin_role: ${test2Data.admin_role}`);
    console.log(`   is_admin: ${test2Data.is_admin}`);
  }
  console.log('');

  // Test 3: Check if RLS is even enabled
  console.log('🧪 TEST 3: Check if RLS is enabled on users table');
  const { data: rlsCheck, error: rlsError } = await serviceClient
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('schemaname', 'public')
    .eq('tablename', 'users')
    .single();

  if (rlsError) {
    console.log('⚠️ Could not check RLS status');
  } else {
    console.log(`✅ RLS enabled: ${rlsCheck?.rowsecurity}`);
  }
  console.log('');

  // Test 4: Check current policies
  console.log('🧪 TEST 4: List all policies on users table');
  console.log('SQL to run in Supabase SQL Editor:');
  console.log('');
  console.log(`
SELECT
  policyname,
  cmd,
  permissive,
  roles::text[],
  pg_get_expr(qual, polrelid) as using_expression
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'users';
  `.trim());
  console.log('');

  console.log('='.repeat(80));
  console.log('📋 FINDINGS:');
  console.log('');

  if (test1Error && test2Data) {
    console.log('🔍 RLS is working as expected:');
    console.log('   - ANON key without auth: BLOCKED ✅');
    console.log('   - SERVICE key: ALLOWED ✅');
    console.log('');
    console.log('💡 The issue is that frontend needs to be AUTHENTICATED.');
    console.log('   In the browser, the user MUST be logged in via Supabase Auth.');
    console.log('   Check in the browser console:');
    console.log('   - Is user logged in?');
    console.log('   - Does supabase.auth.getUser() return a user?');
    console.log('   - Check Network tab for failed auth requests');
  }

  console.log('');
  console.log('🎯 ACTION ITEMS:');
  console.log('1. Open browser DevTools on localhost:5173');
  console.log('2. Run: await (await fetch("/")).text() // Check if logged in');
  console.log('3. Run in console:');
  console.log('   const { data } = await supabase.auth.getUser();');
  console.log('   console.log("User:", data.user);');
  console.log('');
  console.log('4. Then run:');
  console.log('   const { data: userData } = await supabase');
  console.log('     .from("users")');
  console.log(`     .select("admin_role")`);
  console.log(`     .eq("id", data.user.id)`);
  console.log('     .single();');
  console.log('   console.log("Admin Role:", userData);');
}

testWithRealAuth().catch(console.error);
