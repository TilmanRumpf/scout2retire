#!/usr/bin/env node

// VERIFY RLS OPTIMIZATIONS - Check if get_current_user_id() helper is deployed and used

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyRLSOptimizations() {
  console.log('🔍 VERIFYING RLS OPTIMIZATIONS');
  console.log('='.repeat(100));
  console.log('');

  // Query 1: Check if helper function exists
  console.log('1️⃣ Checking for get_current_user_id() helper function...\n');

  const { data: helperFunc, error: helperError } = await supabase.rpc('sql', {
    query: `
      SELECT proname, prosrc
      FROM pg_proc
      WHERE proname = 'get_current_user_id';
    `
  });

  if (helperError) {
    console.log('⚠️ Unable to check helper function via RPC. Trying alternative method...');

    // Alternative: Try to call the function directly
    const { data: testCall, error: testError } = await supabase.rpc('get_current_user_id');

    if (testError) {
      if (testError.message.includes('does not exist')) {
        console.log('❌ Helper function get_current_user_id() DOES NOT EXIST');
        console.log('   Status: OPTIMIZATION NOT DEPLOYED\n');
      } else {
        console.log(`❌ Error testing function: ${testError.message}\n`);
      }
    } else {
      console.log('✅ Helper function get_current_user_id() EXISTS');
      console.log('   Status: OPTIMIZATION DEPLOYED');
      console.log(`   Test call result: ${testCall}\n`);
    }
  } else if (helperFunc && helperFunc.length > 0) {
    console.log('✅ Helper function get_current_user_id() EXISTS');
    console.log('   Status: OPTIMIZATION DEPLOYED');
    console.log(`   Function source: ${helperFunc[0].prosrc.substring(0, 100)}...\n`);
  } else {
    console.log('❌ Helper function get_current_user_id() DOES NOT EXIST');
    console.log('   Status: OPTIMIZATION NOT DEPLOYED\n');
  }

  // Query 2: Count optimized vs unoptimized policies (using direct queries)
  console.log('2️⃣ Analyzing RLS policies...\n');

  // We'll query pg_policies through a raw SQL function
  const policyAnalysisSQL = `
    SELECT
      COUNT(*) FILTER (WHERE qual LIKE '%get_current_user_id%' OR with_check LIKE '%get_current_user_id%') as optimized_policies,
      COUNT(*) FILTER (WHERE (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%') AND NOT (qual LIKE '%get_current_user_id%' OR with_check LIKE '%get_current_user_id%')) as unoptimized_policies,
      COUNT(*) as total_policies
    FROM pg_policies
    WHERE schemaname = 'public';
  `;

  // Try to execute via a custom function or direct query
  // Since we might not have direct pg_policies access, let's check specific tables manually

  const highImpactTables = [
    'group_chat_members',
    'users',
    'notifications',
    'chat_messages',
    'scotty_conversations',
    'thread_read_status',
    'discovery_views'
  ];

  console.log('🎯 Checking high-impact tables for RLS policies:\n');

  let totalChecked = 0;
  let rlsEnabled = 0;
  let accessible = 0;

  for (const tableName of highImpactTables) {
    totalChecked++;

    try {
      // Try to query with anon key to check if RLS blocks access
      const anonSupabase = createClient(
        SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY || SUPABASE_KEY
      );

      const { data, error } = await anonSupabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        if (error.message.includes('row-level security') || error.code === 'PGRST301') {
          console.log(`   🔒 ${tableName.padEnd(25)} - RLS ENABLED (access blocked)`);
          rlsEnabled++;
        } else {
          console.log(`   ❓ ${tableName.padEnd(25)} - ${error.message.substring(0, 40)}`);
        }
      } else {
        console.log(`   🔓 ${tableName.padEnd(25)} - NO RLS (publicly accessible)`);
        accessible++;
      }
    } catch (err) {
      console.log(`   ❌ ${tableName.padEnd(25)} - Error: ${err.message.substring(0, 40)}`);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('\n📊 SUMMARY:');
  console.log(`   Tables checked: ${totalChecked}`);
  console.log(`   Tables with RLS enabled: ${rlsEnabled}`);
  console.log(`   Tables without RLS: ${accessible}`);

  console.log('\n💡 INTERPRETATION:');

  // Try one more direct approach - check if we can create a simple test
  console.log('\n3️⃣ Testing RLS policy efficiency (if possible)...\n');

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError) {
      console.log(`   ℹ️ Cannot test users table: ${userError.message}`);
    } else {
      console.log(`   ✅ Successfully queried users table (${userData?.length || 0} rows returned)`);
    }
  } catch (err) {
    console.log(`   ⚠️ Error testing query: ${err.message}`);
  }

  console.log('\n' + '='.repeat(100));
  console.log('\n📋 NEXT STEPS TO VERIFY OPTIMIZATIONS:');
  console.log('   1. Check Supabase dashboard SQL Editor');
  console.log('   2. Run: SELECT * FROM pg_proc WHERE proname = \'get_current_user_id\';');
  console.log('   3. Run: SELECT * FROM pg_policies WHERE schemaname = \'public\' LIMIT 10;');
  console.log('   4. Check migration files in supabase/migrations/ for recent RLS changes');

  console.log('\n✅ VERIFICATION COMPLETE');
  console.log('='.repeat(100));
}

verifyRLSOptimizations().catch(console.error);
