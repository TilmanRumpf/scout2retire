#!/usr/bin/env node

// TEST THE EXACT ADMIN CHECK FLOW FROM UNIFIEDHEADER.JSX

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

async function testAdminCheckFlow() {
  console.log('🔍 TESTING ADMIN CHECK FLOW (as in UnifiedHeader.jsx)');
  console.log('='.repeat(80));
  console.log('');

  // Create client with service role key to simulate what should happen
  const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Get Tilman's user ID
  const { data: tilmanData, error: tilmanError } = await serviceClient
    .from('users')
    .select('id, email, admin_role, is_admin')
    .eq('email', 'tilman.rumpf@gmail.com')
    .single();

  if (tilmanError || !tilmanData) {
    console.error('❌ Could not find Tilman:', tilmanError);
    return;
  }

  console.log('✅ Found Tilman in database:');
  console.log(`   ID: ${tilmanData.id}`);
  console.log(`   Email: ${tilmanData.email}`);
  console.log(`   admin_role: ${tilmanData.admin_role}`);
  console.log(`   is_admin: ${tilmanData.is_admin}`);
  console.log('');

  // Simulate the EXACT check from UnifiedHeader.jsx line 105-111
  console.log('🧪 SIMULATING UnifiedHeader.jsx admin check...');
  console.log('   Code: const { data: userData } = await supabase');
  console.log('           .from(\'users\')');
  console.log('           .select(\'admin_role\')');
  console.log('           .eq(\'id\', user.id)');
  console.log('           .single();');
  console.log('');

  // Test with service client (to see if RLS is the problem)
  const { data: serviceUserData, error: serviceUserError } = await serviceClient
    .from('users')
    .select('admin_role')
    .eq('id', tilmanData.id)
    .single();

  if (serviceUserError) {
    console.log('❌ Service client query failed:', serviceUserError.message);
  } else {
    console.log('✅ Service client query succeeded:');
    console.log(`   admin_role: ${serviceUserData?.admin_role}`);

    const isAdmin = serviceUserData?.admin_role === 'executive_admin' || serviceUserData?.admin_role === 'assistant_admin';
    console.log(`   Check result: userData?.admin_role === 'executive_admin' || userData?.admin_role === 'assistant_admin'`);
    console.log(`   Result: ${isAdmin} ✅`);
  }
  console.log('');

  // Now test with ANON key (as the frontend would use)
  console.log('🔐 Testing with ANON key (as frontend uses)...');
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data: anonUserData, error: anonUserError } = await anonClient
    .from('users')
    .select('admin_role')
    .eq('id', tilmanData.id)
    .single();

  if (anonUserError) {
    console.log('❌ ANON client query FAILED (this is likely the problem!)');
    console.log(`   Error: ${anonUserError.message}`);
    console.log(`   Code: ${anonUserError.code}`);
    console.log('');
    console.log('🚨 ROOT CAUSE IDENTIFIED:');
    console.log('   Frontend cannot query admin_role because RLS blocks it!');
    console.log('   Even though user is authenticated, RLS policy prevents reading admin_role');
  } else {
    console.log('✅ ANON client query succeeded:');
    console.log(`   admin_role: ${anonUserData?.admin_role}`);

    const isAdmin = anonUserData?.admin_role === 'executive_admin' || anonUserData?.admin_role === 'assistant_admin';
    console.log(`   Check result: ${isAdmin}`);
  }
  console.log('');

  // Check RLS policies on users table
  console.log('📋 Checking RLS policies on users table...');
  const { data: policies, error: policiesError } = await serviceClient.rpc('pg_policies_info');

  if (policiesError) {
    console.log('⚠️ Could not query policies (RPC may not exist)');

    // Try alternate method
    const { data: policyCheck, error: policyCheckError } = await serviceClient
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users');

    if (policyCheckError) {
      console.log('⚠️ Could not query pg_policies either');
    } else if (policyCheck && policyCheck.length > 0) {
      console.log('✅ Found RLS policies on users table:');
      policyCheck.forEach(p => {
        console.log(`   - ${p.policyname}`);
      });
    }
  }
  console.log('');

  console.log('='.repeat(80));
  console.log('📋 DIAGNOSIS SUMMARY:');
  console.log('');

  if (anonUserError) {
    console.log('🚨 PROBLEM CONFIRMED:');
    console.log('   When frontend tries to query admin_role using ANON key,');
    console.log('   RLS blocks the query even for authenticated users.');
    console.log('');
    console.log('💡 SOLUTIONS:');
    console.log('   Option 1: Create RLS policy allowing users to read their own admin_role');
    console.log('   Option 2: Use is_user_admin() function from frontend');
    console.log('   Option 3: Return admin status in auth.user() metadata');
    console.log('');
    console.log('📝 RECOMMENDED FIX:');
    console.log('   Add RLS policy:');
    console.log('   CREATE POLICY "users_can_read_own_admin_role" ON users');
    console.log('     FOR SELECT');
    console.log('     USING (auth.uid() = id);');
  } else {
    console.log('✅ Admin check should be working!');
    console.log('   If admin features not showing, check:');
    console.log('   1. Browser console for errors');
    console.log('   2. Auth state in frontend');
    console.log('   3. useEffect dependencies in UnifiedHeader.jsx');
  }
}

testAdminCheckFlow().catch(console.error);
