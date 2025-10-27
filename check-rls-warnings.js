#!/usr/bin/env node

// CHECK RLS PERFORMANCE WARNINGS - FOCUSED ON THE 71 REMAINING

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'public' }
});

async function checkRLSWarnings() {
  console.log('🔍 CHECKING RLS PERFORMANCE WARNINGS');
  console.log('='.repeat(80));

  // First check if helper function exists
  console.log('\n📌 Checking for helper function...');
  const { data: helperCheck, error: helperError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT proname, prosrc
      FROM pg_proc
      WHERE proname = 'get_current_user_id'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `
  });

  if (helperCheck && helperCheck.length > 0) {
    console.log('✅ Helper function get_current_user_id EXISTS');
    console.log('   Definition:', helperCheck[0].prosrc.substring(0, 100) + '...');
  } else {
    console.log('❌ Helper function get_current_user_id NOT FOUND');
    console.log('   This is the root cause - Phase 2 migration never ran!');
  }

  // Check current auth.uid() warnings
  console.log('\n📊 Checking policies with auth.uid() warnings...');
  const { data: warnings, error: warningsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        tablename,
        policyname,
        -- Count occurrences of auth.uid() in policy definition
        (LENGTH(qual::text) - LENGTH(REPLACE(qual::text, 'auth.uid()', ''))) / 11 as auth_uid_count,
        -- Check if using helper function
        CASE WHEN qual::text LIKE '%get_current_user_id()%' THEN 'YES' ELSE 'NO' END as uses_helper
      FROM pg_policies
      WHERE schemaname = 'public'
      AND qual::text LIKE '%auth.uid()%'
      ORDER BY auth_uid_count DESC, tablename, policyname
    `
  });

  if (warnings && warnings.length > 0) {
    console.log(`\n⚠️ Found ${warnings.length} policies still using auth.uid() directly:\n`);

    const byTable = {};
    let totalAuthCalls = 0;

    warnings.forEach(w => {
      if (!byTable[w.tablename]) {
        byTable[w.tablename] = [];
      }
      byTable[w.tablename].push(w);
      totalAuthCalls += parseInt(w.auth_uid_count);
    });

    console.log('Table'.padEnd(30) + 'Policy'.padEnd(30) + 'auth.uid() calls'.padEnd(20) + 'Uses Helper?');
    console.log('-'.repeat(80));

    Object.keys(byTable).sort().forEach(table => {
      byTable[table].forEach(policy => {
        console.log(
          table.padEnd(30) +
          policy.policyname.padEnd(30) +
          policy.auth_uid_count.toString().padEnd(20) +
          policy.uses_helper
        );
      });
    });

    console.log('\n📈 SUMMARY:');
    console.log(`   Total policies with auth.uid(): ${warnings.length}`);
    console.log(`   Total auth.uid() calls: ${totalAuthCalls}`);
    console.log(`   Tables affected: ${Object.keys(byTable).length}`);
    console.log(`   Most problematic tables:`);

    Object.entries(byTable)
      .map(([table, policies]) => ({
        table,
        count: policies.reduce((sum, p) => sum + parseInt(p.auth_uid_count), 0)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .forEach(t => {
        console.log(`      - ${t.table}: ${t.count} auth.uid() calls`);
      });
  } else {
    console.log('✅ No policies found using auth.uid() directly!');
  }

  // Check for multiple permissive policies
  console.log('\n📊 Checking for multiple permissive policies...');
  const { data: multiples, error: multiplesError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        tablename,
        cmd,
        COUNT(*) as policy_count,
        array_agg(policyname ORDER BY policyname) as policies
      FROM pg_policies
      WHERE schemaname = 'public'
      AND permissive = 'PERMISSIVE'
      GROUP BY tablename, cmd
      HAVING COUNT(*) > 1
      ORDER BY policy_count DESC, tablename, cmd
    `
  });

  if (multiples && multiples.length > 0) {
    console.log(`\n⚠️ Found ${multiples.length} cases of multiple permissive policies:\n`);
    console.log('Table'.padEnd(30) + 'Operation'.padEnd(15) + 'Count'.padEnd(10) + 'Policies');
    console.log('-'.repeat(80));

    multiples.forEach(m => {
      console.log(
        m.tablename.padEnd(30) +
        m.cmd.padEnd(15) +
        m.policy_count.toString().padEnd(10) +
        m.policies.slice(0, 3).join(', ') + (m.policies.length > 3 ? '...' : '')
      );
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 NEXT STEPS:');

  if (!helperCheck || helperCheck.length === 0) {
    console.log('\n🔴 CRITICAL: Helper function not found!');
    console.log('   The Phase 2 migration never actually deployed.');
    console.log('   You need to manually run the migration in Supabase SQL Editor.');
    console.log('\n   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of: supabase/migrations/20251104_rls_phase2_complete_fix.sql');
    console.log('   3. Paste and execute in SQL Editor');
    console.log('   4. Run this script again to verify');
  } else if (warnings && warnings.length > 0) {
    console.log('\n⚠️ Helper function exists but policies not updated.');
    console.log('   Need to apply the policy updates from Phase 2 migration.');
  } else {
    console.log('\n✅ All optimizations appear to be in place!');
  }
}

checkRLSWarnings().catch(console.error);