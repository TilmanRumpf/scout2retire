#!/usr/bin/env node

// COMPREHENSIVE DATABASE QUALITY CHECK - VERIFY OPTIMIZATIONS

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

async function executeSQL(description, sql) {
  console.log(`\n🔍 ${description}`);
  console.log('-'.repeat(100));

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }

    if (data && data.length > 0) {
      console.table(data);
      return data;
    } else {
      console.log('✅ Query executed successfully - no results');
      return [];
    }
  } catch (err) {
    console.error(`❌ Exception: ${err.message}`);
    return null;
  }
}

async function directQuery(description, query) {
  console.log(`\n🔍 ${description}`);
  console.log('-'.repeat(100));

  try {
    const { data, error, count } = await supabase
      .from('pg_proc')
      .select('*')
      .eq('proname', 'get_current_user_id');

    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }

    console.table(data);
    return data;
  } catch (err) {
    console.error(`❌ Exception: ${err.message}`);
    return null;
  }
}

async function runQualityCheck() {
  console.log('🎯 DATABASE QUALITY CHECK - OPTIMIZATION VERIFICATION');
  console.log('='.repeat(100));
  console.log('');
  console.log('This check verifies:');
  console.log('  1. Helper function exists (get_current_user_id)');
  console.log('  2. Policy optimization status (auth.uid() vs helper)');
  console.log('  3. Foreign key indexes created');
  console.log('  4. Total index count');
  console.log('  5. Multiple permissive policies check');
  console.log('');
  console.log('='.repeat(100));

  // Check 1: Helper function exists
  const helperCheck = await executeSQL(
    'Check 1: Verify get_current_user_id() helper function exists',
    `
    SELECT proname, prosrc
    FROM pg_proc
    WHERE proname = 'get_current_user_id';
    `
  );

  // Check 2: Count policies using auth.uid() vs get_current_user_id()
  const policyCount = await executeSQL(
    'Check 2: Count policies using auth.uid() vs get_current_user_id()',
    `
    SELECT
        COUNT(CASE WHEN qual::text LIKE '%auth.uid()%' THEN 1 END) as using_auth_uid,
        COUNT(CASE WHEN qual::text LIKE '%get_current_user_id()%' THEN 1 END) as using_helper
    FROM pg_policies
    WHERE schemaname = 'public';
    `
  );

  // Check 3: Verify foreign key indexes
  const foreignKeyIndexes = await executeSQL(
    'Check 3: Verify foreign key indexes exist',
    `
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname IN (
        'idx_chat_messages_deleted_by',
        'idx_chat_messages_pinned_by',
        'idx_chat_messages_user_id',
        'idx_chat_threads_created_by',
        'idx_group_bans_banned_by',
        'idx_group_role_audit_target_user_id',
        'idx_journal_entries_related_user_id',
        'idx_journal_entries_town_id',
        'idx_onboarding_responses_user_id',
        'idx_retirement_schedule_user_id',
        'idx_user_reports_reviewed_by',
        'idx_user_sessions_device_history_id',
        'idx_user_town_access_granted_by',
        'idx_users_community_role_town_id',
        'idx_users_roles_updated_by'
    )
    ORDER BY indexname;
    `
  );

  // Check 4: Total index count
  const indexCount = await executeSQL(
    'Check 4: Total index count',
    `
    SELECT
        COUNT(*) as total_indexes,
        COUNT(CASE WHEN indexname LIKE 'idx_%' THEN 1 END) as custom_indexes
    FROM pg_indexes
    WHERE schemaname = 'public';
    `
  );

  // Check 5: Multiple permissive policies
  const multiplePolicies = await executeSQL(
    'Check 5: Tables with multiple permissive policies',
    `
    WITH policy_counts AS (
        SELECT tablename, cmd, COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND permissive = 'PERMISSIVE'
        GROUP BY tablename, cmd
        HAVING COUNT(*) > 1
    )
    SELECT COUNT(*) as tables_with_multiple_policies
    FROM policy_counts;
    `
  );

  // Summary Report
  console.log('\n' + '='.repeat(100));
  console.log('📊 OPTIMIZATION STATUS SUMMARY');
  console.log('='.repeat(100));

  if (helperCheck && helperCheck.length > 0) {
    console.log('\n✅ Helper Function: get_current_user_id() EXISTS');
  } else {
    console.log('\n❌ Helper Function: get_current_user_id() NOT FOUND');
    console.log('   ⚠️  RLS optimization incomplete - helper function missing');
  }

  if (policyCount && policyCount.length > 0) {
    const using_auth_uid = policyCount[0].using_auth_uid || 0;
    const using_helper = policyCount[0].using_helper || 0;
    const total = using_auth_uid + using_helper;
    const percent_optimized = total > 0 ? Math.round((using_helper / total) * 100) : 0;

    console.log('\n📋 Policy Optimization Status:');
    console.log(`   - Policies using auth.uid(): ${using_auth_uid}`);
    console.log(`   - Policies using get_current_user_id(): ${using_helper}`);
    console.log(`   - Optimization rate: ${percent_optimized}%`);

    if (using_auth_uid > 0) {
      console.log(`\n   ⚠️  ${using_auth_uid} policies still using auth.uid() - optimization incomplete`);
      console.log(`   💡 Run RLS optimization migrations to replace with get_current_user_id()`);
    } else {
      console.log('\n   ✅ All policies optimized!');
    }
  }

  if (foreignKeyIndexes) {
    const expectedIndexes = 15;
    const foundIndexes = foreignKeyIndexes.length;

    console.log('\n🔑 Foreign Key Index Status:');
    console.log(`   - Expected indexes: ${expectedIndexes}`);
    console.log(`   - Found indexes: ${foundIndexes}`);

    if (foundIndexes === expectedIndexes) {
      console.log('   ✅ All foreign key indexes created!');
    } else {
      console.log(`   ⚠️  Missing ${expectedIndexes - foundIndexes} indexes`);
      console.log('   💡 Run foreign key index migrations');
    }
  }

  if (indexCount && indexCount.length > 0) {
    const total = indexCount[0].total_indexes || 0;
    const custom = indexCount[0].custom_indexes || 0;

    console.log('\n📈 Index Statistics:');
    console.log(`   - Total indexes: ${total}`);
    console.log(`   - Custom indexes (idx_*): ${custom}`);
    console.log(`   - System indexes: ${total - custom}`);
  }

  if (multiplePolicies && multiplePolicies.length > 0) {
    const count = multiplePolicies[0].tables_with_multiple_policies || 0;

    console.log('\n🔒 RLS Policy Complexity:');
    console.log(`   - Tables with multiple permissive policies: ${count}`);

    if (count > 0) {
      console.log('   ⚠️  Multiple permissive policies can cause performance issues');
      console.log('   💡 Consider consolidating policies where possible');
    } else {
      console.log('   ✅ No tables with multiple permissive policies');
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('✅ QUALITY CHECK COMPLETE');
  console.log('='.repeat(100));

  console.log('\n📋 RECOMMENDATIONS:');

  if (!helperCheck || helperCheck.length === 0) {
    console.log('   1. Create get_current_user_id() helper function');
  }

  if (policyCount && policyCount.length > 0 && policyCount[0].using_auth_uid > 0) {
    console.log('   2. Replace auth.uid() with get_current_user_id() in RLS policies');
  }

  if (foreignKeyIndexes && foreignKeyIndexes.length < 15) {
    console.log('   3. Create missing foreign key indexes');
  }

  if (multiplePolicies && multiplePolicies.length > 0 && multiplePolicies[0].tables_with_multiple_policies > 0) {
    console.log('   4. Review and consolidate multiple permissive policies');
  }

  console.log('\n📄 See docs/database/RLS_PERFORMANCE_EXECUTIVE_SUMMARY.md for details');
  console.log('');
}

runQualityCheck().catch(console.error);
