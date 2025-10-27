#!/usr/bin/env node

// DATABASE QUALITY CHECK - Execute SQL queries for quality assessment

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

async function executeQuery(name, sql) {
  console.log(`\n🔍 ${name}`);
  console.log('-'.repeat(80));
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      // Try direct query if RPC doesn't exist
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('✅ Results:', JSON.stringify(result, null, 2));
      return result;
    }

    console.log('✅ Results:', JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return null;
  }
}

async function runQualityChecks() {
  console.log('🎯 DATABASE QUALITY CHECK - STARTING');
  console.log('='.repeat(80));

  // Query 1: Check if helper function exists
  await executeQuery(
    'Query 1: Check if get_current_user_id() function exists',
    `SELECT COUNT(*) as helper_exists
     FROM pg_proc
     WHERE proname = 'get_current_user_id';`
  );

  // Query 2: Count policies using auth.uid() vs helper
  await executeQuery(
    'Query 2: Count policies using auth.uid() vs helper',
    `SELECT
        COUNT(CASE WHEN qual::text LIKE '%auth.uid()%' THEN 1 END) as using_auth_uid,
        COUNT(CASE WHEN qual::text LIKE '%get_current_user_id()%' THEN 1 END) as using_helper,
        COUNT(*) as total_policies
     FROM pg_policies
     WHERE schemaname = 'public';`
  );

  // Query 3: Check foreign key indexes
  await executeQuery(
    'Query 3: Check foreign key indexes exist',
    `SELECT COUNT(*) as fk_indexes_created
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
     );`
  );

  // Query 4: Count total and unused indexes
  await executeQuery(
    'Query 4: Count total indexes and unused indexes',
    `SELECT
        COUNT(*) as total_indexes,
        COUNT(CASE WHEN idx_scan = 0 THEN 1 END) as unused_indexes
     FROM pg_stat_user_indexes
     WHERE schemaname = 'public';`
  );

  console.log('\n' + '='.repeat(80));
  console.log('✅ DATABASE QUALITY CHECK - COMPLETE');
  console.log('='.repeat(80));
}

runQualityChecks().catch(console.error);
