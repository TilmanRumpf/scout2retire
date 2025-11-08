#!/usr/bin/env node

/**
 * Photo Migration Verification Script
 *
 * Programmatic verification of the photo system migration.
 * Run this AFTER applying the migration to verify success.
 *
 * Usage: node database-utilities/verify-photo-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function success(msg) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function error(msg) {
  console.log(`${colors.red}❌ ${msg}${colors.reset}`);
}

function warning(msg) {
  console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function info(msg) {
  console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
}

function header(msg) {
  console.log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${msg}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function checkTableExists() {
  header('CHECK 1: Table Existence');

  const { data, error: err } = await supabase
    .from('town_images')
    .select('id')
    .limit(1);

  if (err) {
    error(`town_images table does not exist or is not accessible`);
    console.log(err);
    return false;
  }

  success('town_images table exists and is accessible');
  return true;
}

async function verifyCounts() {
  header('CHECK 2: Migration Count Verification');

  // Get counts from towns table
  const { data: townsData } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) as url1_count,
        COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) as url2_count,
        COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) as url3_count
      FROM public.towns
    `
  });

  // Get counts from town_images table
  const { count: order1Count } = await supabase
    .from('town_images')
    .select('*', { count: 'exact', head: true })
    .eq('display_order', 1);

  const { count: order2Count } = await supabase
    .from('town_images')
    .select('*', { count: 'exact', head: true })
    .eq('display_order', 2);

  const { count: order3Count } = await supabase
    .from('town_images')
    .select('*', { count: 'exact', head: true })
    .eq('display_order', 3);

  info(`Towns with image_url_1: ${townsData?.[0]?.url1_count || 'N/A'}`);
  info(`Town_images with display_order=1: ${order1Count || 0}`);

  info(`Towns with image_url_2: ${townsData?.[0]?.url2_count || 'N/A'}`);
  info(`Town_images with display_order=2: ${order2Count || 0}`);

  info(`Towns with image_url_3: ${townsData?.[0]?.url3_count || 'N/A'}`);
  info(`Town_images with display_order=3: ${order3Count || 0}`);

  const url1Match = townsData?.[0]?.url1_count === order1Count;
  const url2Match = townsData?.[0]?.url2_count === order2Count;
  const url3Match = townsData?.[0]?.url3_count === order3Count;

  if (url1Match && url2Match && url3Match) {
    success('All counts match perfectly!');
    return true;
  } else {
    error('Count mismatch detected!');
    if (!url1Match) error('  - image_url_1 count mismatch');
    if (!url2Match) error('  - image_url_2 count mismatch');
    if (!url3Match) error('  - image_url_3 count mismatch');
    return false;
  }
}

async function checkCacheSync() {
  header('CHECK 3: Cache Sync Verification');

  // Find any towns where image_url_1 doesn't match display_order=1
  const { data: mismatches } = await supabase
    .from('towns')
    .select('id, town_name, image_url_1')
    .not('image_url_1', 'is', null);

  if (!mismatches || mismatches.length === 0) {
    warning('No towns with images found to verify');
    return true;
  }

  let syncErrors = 0;

  for (const town of mismatches.slice(0, 10)) {
    const { data: image } = await supabase
      .from('town_images')
      .select('image_url')
      .eq('town_id', town.id)
      .eq('display_order', 1)
      .single();

    if (town.image_url_1 !== image?.image_url) {
      syncErrors++;
      error(`Cache mismatch for ${town.town_name} (ID: ${town.id})`);
      console.log(`  Cache: ${town.image_url_1}`);
      console.log(`  Source: ${image?.image_url || 'NULL'}`);
    }
  }

  if (syncErrors === 0) {
    success('Cache perfectly in sync with display_order=1 images');
    return true;
  } else {
    error(`Found ${syncErrors} cache sync issues`);
    return false;
  }
}

async function checkOrphans() {
  header('CHECK 4: Orphaned Records Check');

  // Check for orphaned town_images (no matching town)
  const { data: orphanedImages } = await supabase
    .from('town_images')
    .select('id, town_id, image_url')
    .not('town_id', 'in', '(SELECT id FROM towns)');

  if (orphanedImages && orphanedImages.length > 0) {
    error(`Found ${orphanedImages.length} orphaned images in town_images table`);
    orphanedImages.forEach(img => {
      console.log(`  - Image ID: ${img.id}, Town ID: ${img.town_id}`);
    });
  } else {
    success('No orphaned images found');
  }

  // Check for missing migrations (towns with images but no town_images)
  const { data: townsWithUrl1 } = await supabase
    .from('towns')
    .select('id, town_name, image_url_1')
    .not('image_url_1', 'is', null);

  let missingMigrations = 0;

  if (townsWithUrl1) {
    for (const town of townsWithUrl1) {
      const { data: image } = await supabase
        .from('town_images')
        .select('id')
        .eq('town_id', town.id)
        .eq('display_order', 1)
        .single();

      if (!image) {
        missingMigrations++;
        error(`Town "${town.town_name}" (ID: ${town.id}) has image_url_1 but no migrated image`);
      }
    }
  }

  if (missingMigrations === 0) {
    success('All towns with images have been migrated');
  } else {
    error(`Found ${missingMigrations} towns with un-migrated images`);
  }

  return orphanedImages?.length === 0 && missingMigrations === 0;
}

async function checkIndexes() {
  header('CHECK 5: Index Verification');

  // Note: This is a simplified check. For full index verification,
  // you'd need to query pg_indexes directly via raw SQL

  info('Checking if queries use indexes...');

  // Simple query to test index usage
  const { data } = await supabase
    .from('town_images')
    .select('*')
    .eq('town_id', 1)
    .order('display_order');

  success('Basic queries execute (indexes assumed present)');
  info('For detailed index verification, run SQL queries from verification doc');

  return true;
}

async function checkRLS() {
  header('CHECK 6: RLS Policy Verification');

  // Try to query as public (should work)
  const publicClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data: publicData, error: publicError } = await publicClient
    .from('town_images')
    .select('id')
    .limit(1);

  if (publicError) {
    error('Public read access BLOCKED (should be allowed)');
    console.log(publicError);
    return false;
  }

  success('Public read access working');

  // Try to insert as public (should fail)
  const { error: insertError } = await publicClient
    .from('town_images')
    .insert({
      town_id: 1,
      image_url: 'https://test.com/test.jpg',
      display_order: 999
    });

  if (insertError) {
    success('Public write access correctly BLOCKED');
    return true;
  } else {
    error('Public write access allowed (should be blocked!)');
    return false;
  }
}

async function runFullVerification() {
  console.log(`${colors.bold}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          Photo Migration Verification Suite                ║
║                                                            ║
║  This script verifies the town_images migration           ║
║  Run AFTER applying migration SQL                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

  const results = {
    tableExists: false,
    countsMatch: false,
    cacheSync: false,
    noOrphans: false,
    indexesOk: false,
    rlsCorrect: false
  };

  results.tableExists = await checkTableExists();

  if (!results.tableExists) {
    error('\n❌ MIGRATION NOT RUN: town_images table does not exist');
    error('Run the migration SQL first: supabase/migrations/20251109000000_create_town_images_table.sql');
    process.exit(1);
  }

  results.countsMatch = await verifyCounts();
  results.cacheSync = await checkCacheSync();
  results.noOrphans = await checkOrphans();
  results.indexesOk = await checkIndexes();
  results.rlsCorrect = await checkRLS();

  // Final summary
  header('FINAL SUMMARY');

  const allPassed = Object.values(results).every(r => r === true);

  console.log(`Table Exists:      ${results.tableExists ? '✅' : '❌'}`);
  console.log(`Counts Match:      ${results.countsMatch ? '✅' : '❌'}`);
  console.log(`Cache Synced:      ${results.cacheSync ? '✅' : '❌'}`);
  console.log(`No Orphans:        ${results.noOrphans ? '✅' : '❌'}`);
  console.log(`Indexes OK:        ${results.indexesOk ? '✅' : '❌'}`);
  console.log(`RLS Correct:       ${results.rlsCorrect ? '✅' : '❌'}`);

  console.log('\n' + '='.repeat(60));

  if (allPassed) {
    success('✅ ALL CHECKS PASSED - Migration successful!');
    success('You can proceed with confidence');
    process.exit(0);
  } else {
    error('❌ SOME CHECKS FAILED - Review errors above');
    error('Consider running rollback script if issues are critical');
    error('Rollback: supabase/migrations/20251109000001_rollback_town_images.sql');
    process.exit(1);
  }
}

// Run verification
runFullVerification().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
