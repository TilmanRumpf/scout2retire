#!/usr/bin/env node

// CHECK TABLES AND RLS POLICIES - COMPLETE DATABASE ANALYSIS

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

// All tables from migrations
const ALL_TABLES = [
  'admin_score_adjustments',
  'audit_log',
  'category_limits',
  'chat_favorites',
  'chat_messages',
  'chat_threads',
  'country_likes',
  'discovery_views',
  'feature_definitions',
  'group_bans',
  'group_chat_members',
  'group_role_audit',
  'notifications',
  'retention_metrics',
  'scotty_chat_usage',
  'scotty_conversations',
  'scotty_messages',
  'thread_read_status',
  'towns',
  'towns_hobbies',
  'user_behavior_events',
  'user_blocks',
  'user_categories',
  'user_cohorts',
  'user_device_history',
  'user_engagement_metrics',
  'user_likes',
  'user_preferences',
  'user_reports',
  'user_sessions',
  'user_town_access',
  'users'
];

async function checkTablesAndPolicies() {
  console.log('🔍 COMPREHENSIVE DATABASE TABLE ANALYSIS');
  console.log('='.repeat(100));
  console.log('');

  const results = [];

  console.log('⏳ Checking 33 tables... (this will take ~10 seconds)\n');

  for (const tableName of ALL_TABLES) {
    try {
      // Try to query just one row to see if table exists and we have access
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        // Check if error is about RLS or table not existing
        if (error.message.includes('row-level security') || error.code === 'PGRST301') {
          results.push({
            table: tableName,
            exists: true,
            hasRLS: true,
            accessible: false,
            rowCount: '?',
            error: 'RLS enabled (blocked with service key)'
          });
        } else if (error.message.includes('does not exist') || error.code === '42P01' || error.message.includes('not found in the schema cache')) {
          results.push({
            table: tableName,
            exists: false,
            hasRLS: null,
            accessible: false,
            rowCount: 0,
            error: 'Table does not exist'
          });
        } else {
          results.push({
            table: tableName,
            exists: '?',
            hasRLS: '?',
            accessible: false,
            rowCount: '?',
            error: error.message.substring(0, 60)
          });
        }
      } else {
        // Successfully queried - table exists and is accessible
        results.push({
          table: tableName,
          exists: true,
          hasRLS: false,
          accessible: true,
          rowCount: count || 0
        });
      }
    } catch (err) {
      results.push({
        table: tableName,
        exists: '?',
        hasRLS: '?',
        accessible: false,
        rowCount: '?',
        error: err.message.substring(0, 60)
      });
    }
  }

  console.log('📊 DATABASE TABLE ANALYSIS:\n');
  console.log(
    'Table Name'.padEnd(35) +
    'Exists'.padEnd(10) +
    'RLS'.padEnd(10) +
    'Rows'.padEnd(12) +
    'Status'
  );
  console.log('-'.repeat(100));

  // Sort by: existing first, then alphabetically
  results.sort((a, b) => {
    if (a.exists === true && b.exists !== true) return -1;
    if (a.exists !== true && b.exists === true) return 1;
    return a.table.localeCompare(b.table);
  });

  results.forEach(result => {
    const exists = result.exists === true ? '✅' : result.exists === false ? '❌' : '❓';
    const hasRLS = result.hasRLS === true ? '🔒' : result.hasRLS === false ? '🔓' : '  ';
    const rowCount = result.rowCount === '?' ? '?' : (typeof result.rowCount === 'number' ? result.rowCount.toLocaleString() : result.rowCount);
    const status = result.accessible
      ? `✅ Accessible (${rowCount} rows)`
      : (result.error || 'Unknown');

    console.log(
      result.table.padEnd(35) +
      exists.padEnd(10) +
      hasRLS.padEnd(10) +
      rowCount.toString().padEnd(12) +
      status
    );
  });

  console.log('\n' + '='.repeat(100));

  // Summary stats
  const existingTables = results.filter(r => r.exists === true);
  const rlsTables = results.filter(r => r.hasRLS === true);
  const openTables = results.filter(r => r.hasRLS === false && r.accessible);
  const nonExistentTables = results.filter(r => r.exists === false);

  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total tables checked: ${results.length}`);
  console.log(`   Tables that exist: ${existingTables.length}`);
  console.log(`   Tables that don't exist: ${nonExistentTables.length}`);
  console.log(`   Tables with RLS enabled: ${rlsTables.length}`);
  console.log(`   Tables without RLS (publicly accessible): ${openTables.length}`);

  if (rlsTables.length > 0) {
    console.log(`\n🔒 TABLES WITH RLS ENABLED (${rlsTables.length}):`);
    rlsTables.forEach(t => {
      console.log(`   - ${t.table}`);
    });
    console.log(`\n⚠️ These tables have RLS policies that need optimization per:`);
    console.log(`   📄 docs/database/RLS_PERFORMANCE_EXECUTIVE_SUMMARY.md`);
    console.log(`   📄 docs/database/RLS_QUICK_FIX_MIGRATIONS.md`);
  }

  if (openTables.length > 0) {
    console.log(`\n🔓 TABLES WITHOUT RLS (PUBLICLY ACCESSIBLE - ${openTables.length}):`);
    openTables.forEach(t => {
      console.log(`   - ${t.table} (${t.rowCount} rows)`);
    });
    console.log(`\n⚠️ Consider enabling RLS on these tables for security`);
  }

  // Check for tables mentioned in RLS docs that should be optimized
  const highPriorityRlsTables = [
    'notifications',
    'scotty_conversations',
    'thread_read_status',
    'scotty_chat_usage',
    'discovery_views',
    'group_chat_members',
    'chat_messages'
  ];

  const foundHighPriority = highPriorityRlsTables.filter(table =>
    rlsTables.some(r => r.table === table)
  );

  if (foundHighPriority.length > 0) {
    console.log(`\n🎯 HIGH PRIORITY RLS OPTIMIZATION TARGETS (${foundHighPriority.length}):`);
    foundHighPriority.forEach(table => {
      console.log(`   - ${table}`);
    });
    console.log(`\n💡 These tables are mentioned in RLS optimization docs as high-impact targets.`);
    console.log(`   See: docs/database/RLS_PERFORMANCE_EXECUTIVE_SUMMARY.md`);
  }

  // Show data-bearing tables
  const tablesWithData = openTables.filter(t => t.rowCount > 0);
  if (tablesWithData.length > 0) {
    console.log(`\n💾 TABLES WITH DATA (${tablesWithData.length}):`);
    tablesWithData
      .sort((a, b) => b.rowCount - a.rowCount)
      .forEach(t => {
        console.log(`   - ${t.table.padEnd(35)} ${t.rowCount.toLocaleString().padStart(8)} rows`);
      });
  }

  console.log('\n✅ ANALYSIS COMPLETE');
  console.log('='.repeat(100));
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Review RLS-enabled tables above');
  console.log('   2. Check docs/database/RLS_PERFORMANCE_EXECUTIVE_SUMMARY.md');
  console.log('   3. Deploy Phase 1 optimizations from RLS_QUICK_FIX_MIGRATIONS.md');
  console.log('   4. Expected improvement: 10-20% faster auth queries');
}

checkTablesAndPolicies().catch(console.error);
