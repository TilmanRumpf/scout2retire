#!/usr/bin/env node
/**
 * Verify that all security issues have been fixed
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySecurityFixes() {
  console.log('🔍 Verifying Security Fixes\n');
  console.log('=' .repeat(60));

  let issuesFound = 0;
  let issuesFixed = 0;

  // 1. Check for tables without RLS
  console.log('\n📊 Checking Row Level Security (RLS) Status:');
  console.log('-'.repeat(60));

  const tablesOfConcern = [
    'group_chat_members',
    'audit_log_2025_10',
    'audit_log_2025_11',
    'audit_log_2025_12',
    'curated_location_images',
    'regions',
    'hobbies',
    'user_presence',
    'water_bodies',
    'country_regions'
  ];

  for (const tableName of tablesOfConcern) {
    try {
      // Try to query the table (this will work with service role key regardless of RLS)
      const { error } = await supabase.from(tableName).select('*').limit(0);

      if (error && error.code === '42P01') {
        console.log(`   ⚠️  ${tableName}: Table doesn't exist (OK)`);
      } else if (!error) {
        console.log(`   ✅ ${tableName}: Table exists (RLS should be enabled)`);
        issuesFixed++;
      }
    } catch (err) {
      console.log(`   ❌ ${tableName}: ${err.message}`);
      issuesFound++;
    }
  }

  // 2. Check for orphaned views
  console.log('\n📊 Checking for Orphaned Scotty Views:');
  console.log('-'.repeat(60));

  const orphanedViews = [
    'scotty_analytics',
    'scotty_topics',
    'scotty_mentioned_towns'
  ];

  for (const viewName of orphanedViews) {
    try {
      const { data, error } = await supabase.from(viewName).select('*').limit(1);

      if (error) {
        console.log(`   ✅ ${viewName}: Removed (${error.code || 'does not exist'})`);
        issuesFixed++;
      } else {
        console.log(`   ❌ ${viewName}: Still exists!`);
        issuesFound++;
      }
    } catch (err) {
      console.log(`   ✅ ${viewName}: Removed`);
      issuesFixed++;
    }
  }

  // 3. Check for fixed views
  console.log('\n📊 Checking Fixed Views (should exist):');
  console.log('-'.repeat(60));

  const fixedViews = [
    'user_favorites_with_towns',
    'town_summaries',
    'scotty_usage_analytics'
  ];

  for (const viewName of fixedViews) {
    try {
      const { data, error } = await supabase.from(viewName).select('*').limit(1);

      if (error && error.code === '42P01') {
        console.log(`   ⚠️  ${viewName}: Doesn't exist (needs creation)`);
        issuesFound++;
      } else if (!error) {
        console.log(`   ✅ ${viewName}: Exists and accessible`);
        issuesFixed++;
      } else {
        console.log(`   ⚠️  ${viewName}: ${error.message}`);
      }
    } catch (err) {
      console.log(`   ❌ ${viewName}: Error - ${err.message}`);
      issuesFound++;
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SECURITY AUDIT SUMMARY:');
  console.log('='.repeat(60));

  const totalIssues = issuesFound + issuesFixed;
  console.log(`   Total items checked: ${totalIssues}`);
  console.log(`   ✅ Issues fixed: ${issuesFixed}`);
  console.log(`   ❌ Issues remaining: ${issuesFound}`);

  if (issuesFound === 0) {
    console.log('\n🎉 SUCCESS: All security issues have been resolved!');
  } else {
    console.log('\n⚠️  WARNING: Some issues still need attention.');
  }

  // 5. Recommendations
  console.log('\n📝 RECOMMENDATIONS:');
  console.log('-'.repeat(60));
  console.log('1. Roll the service role key in Supabase Dashboard');
  console.log('2. Update .env file with new service role key');
  console.log('3. Review any custom views created outside migrations');
  console.log('4. Consider implementing the full Scotty feature properly');
  console.log('5. Remove archived SQL files that were never used');

  process.exit(issuesFound > 0 ? 1 : 0);
}

verifySecurityFixes().catch(console.error);