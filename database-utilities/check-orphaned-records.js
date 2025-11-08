/**
 * check-orphaned-records.js
 *
 * Checks for orphaned records across all database tables
 * - Records in child tables pointing to non-existent parent records
 * - Broken foreign key relationships
 * - Data integrity issues
 *
 * PRIORITY 2 task before production launch
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 ORPHANED RECORDS CHECK - Pre-Production Audit\n');
console.log('Checking for broken foreign key relationships...\n');

const issues = [];
let totalChecks = 0;
let totalOrphans = 0;

/**
 * Check for orphaned records in a table
 */
async function checkOrphans(childTable, childColumn, parentTable, parentColumn, description) {
  totalChecks++;
  console.log(`📊 Checking: ${description}...`);

  try {
    // Get all child records
    const { data: childRecords, error: childError } = await supabase
      .from(childTable)
      .select(childColumn);

    if (childError) {
      console.error(`   ❌ Error fetching ${childTable}:`, childError.message);
      issues.push({
        type: 'ERROR',
        description,
        error: childError.message
      });
      return;
    }

    if (!childRecords || childRecords.length === 0) {
      console.log(`   ✅ No records in ${childTable} to check\n`);
      return;
    }

    // Get unique parent IDs from child records
    const parentIds = [...new Set(childRecords.map(r => r[childColumn]).filter(id => id !== null))];

    if (parentIds.length === 0) {
      console.log(`   ✅ No ${parentColumn} references to check\n`);
      return;
    }

    // Check if all parent records exist
    const { data: parentRecords, error: parentError } = await supabase
      .from(parentTable)
      .select(parentColumn)
      .in(parentColumn, parentIds);

    if (parentError) {
      console.error(`   ❌ Error fetching ${parentTable}:`, parentError.message);
      issues.push({
        type: 'ERROR',
        description,
        error: parentError.message
      });
      return;
    }

    const existingParentIds = new Set(parentRecords.map(r => r[parentColumn]));
    const orphanedIds = parentIds.filter(id => !existingParentIds.has(id));

    if (orphanedIds.length > 0) {
      console.log(`   ❌ FOUND ${orphanedIds.length} orphaned references:`);
      console.log(`      ${childTable}.${childColumn} → ${parentTable}.${parentColumn}`);
      console.log(`      Orphaned IDs: ${orphanedIds.slice(0, 5).join(', ')}${orphanedIds.length > 5 ? '...' : ''}`);

      // Count how many child records are affected
      const affectedCount = childRecords.filter(r => orphanedIds.includes(r[childColumn])).length;
      console.log(`      Affected records: ${affectedCount} in ${childTable}\n`);

      totalOrphans += affectedCount;
      issues.push({
        type: 'ORPHANED',
        description,
        childTable,
        childColumn,
        parentTable,
        parentColumn,
        orphanedIds,
        affectedCount
      });
    } else {
      console.log(`   ✅ All ${parentIds.length} ${parentColumn} references valid\n`);
    }
  } catch (error) {
    console.error(`   ❌ Unexpected error:`, error.message);
    issues.push({
      type: 'ERROR',
      description,
      error: error.message
    });
  }
}

/**
 * Check for duplicate records
 */
async function checkDuplicates(table, columns, description) {
  totalChecks++;
  console.log(`📊 Checking: ${description}...`);

  try {
    const { data: records, error } = await supabase
      .from(table)
      .select(columns.join(', '));

    if (error) {
      console.error(`   ❌ Error fetching ${table}:`, error.message);
      return;
    }

    if (!records || records.length === 0) {
      console.log(`   ✅ No records in ${table} to check\n`);
      return;
    }

    // Find duplicates
    const seen = new Map();
    const duplicates = [];

    records.forEach(record => {
      const key = columns.map(col => record[col]).join('|');
      if (seen.has(key)) {
        duplicates.push(record);
      } else {
        seen.set(key, record);
      }
    });

    if (duplicates.length > 0) {
      console.log(`   ⚠️  FOUND ${duplicates.length} duplicate records`);
      console.log(`      Duplicate combinations: ${Math.min(5, duplicates.length)} shown`);
      duplicates.slice(0, 5).forEach(dup => {
        console.log(`      - ${columns.map(col => `${col}: ${dup[col]}`).join(', ')}`);
      });
      console.log('');

      issues.push({
        type: 'DUPLICATES',
        description,
        table,
        columns,
        count: duplicates.length
      });
    } else {
      console.log(`   ✅ No duplicates found\n`);
    }
  } catch (error) {
    console.error(`   ❌ Unexpected error:`, error.message);
  }
}

/**
 * Check for NULL foreign keys where they shouldn't be
 */
async function checkNullForeignKeys(table, column, description) {
  totalChecks++;
  console.log(`📊 Checking: ${description}...`);

  try {
    const { data: records, error } = await supabase
      .from(table)
      .select(`id, ${column}`)
      .is(column, null);

    if (error) {
      console.error(`   ❌ Error fetching ${table}:`, error.message);
      return;
    }

    if (records && records.length > 0) {
      console.log(`   ⚠️  FOUND ${records.length} records with NULL ${column}`);
      console.log(`      First 5 IDs: ${records.slice(0, 5).map(r => r.id).join(', ')}\n`);

      issues.push({
        type: 'NULL_FK',
        description,
        table,
        column,
        count: records.length
      });
    } else {
      console.log(`   ✅ No NULL ${column} found\n`);
    }
  } catch (error) {
    console.error(`   ❌ Unexpected error:`, error.message);
  }
}

// Run all checks
async function runChecks() {
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('1️⃣  CHECKING FOREIGN KEY RELATIONSHIPS\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check favorites → users
  await checkOrphans(
    'favorites',
    'user_id',
    'users',
    'id',
    'Favorites pointing to non-existent users'
  );

  // Check favorites → towns
  await checkOrphans(
    'favorites',
    'town_id',
    'towns',
    'id',
    'Favorites pointing to non-existent towns'
  );

  // Check user_preferences → users
  await checkOrphans(
    'user_preferences',
    'user_id',
    'users',
    'id',
    'User preferences pointing to non-existent users'
  );

  // Check notifications → users
  await checkOrphans(
    'notifications',
    'user_id',
    'users',
    'id',
    'Notifications pointing to non-existent users'
  );

  // Check onboarding_responses → users
  await checkOrphans(
    'onboarding_responses',
    'user_id',
    'users',
    'id',
    'Onboarding responses pointing to non-existent users'
  );

  // Check towns_hobbies → towns
  await checkOrphans(
    'towns_hobbies',
    'town_id',
    'towns',
    'id',
    'Towns-hobbies pointing to non-existent towns'
  );

  // Check towns_hobbies → hobbies
  await checkOrphans(
    'towns_hobbies',
    'hobby_id',
    'hobbies',
    'id',
    'Towns-hobbies pointing to non-existent hobbies'
  );

  // Check user_town_access → users
  await checkOrphans(
    'user_town_access',
    'user_id',
    'users',
    'id',
    'User town access pointing to non-existent users'
  );

  // Check user_town_access → towns
  await checkOrphans(
    'user_town_access',
    'town_id',
    'towns',
    'id',
    'User town access pointing to non-existent towns'
  );

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('2️⃣  CHECKING FOR DUPLICATE RECORDS\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check duplicate favorites
  await checkDuplicates(
    'favorites',
    ['user_id', 'town_id'],
    'Duplicate favorites (same user + town)'
  );

  // Check duplicate user preferences
  await checkDuplicates(
    'user_preferences',
    ['user_id'],
    'Duplicate user preferences (should be 1 per user)'
  );

  // Check duplicate onboarding responses
  await checkDuplicates(
    'onboarding_responses',
    ['user_id'],
    'Duplicate onboarding responses (should be 1 per user)'
  );

  // Check duplicate towns_hobbies
  await checkDuplicates(
    'towns_hobbies',
    ['town_id', 'hobby_id'],
    'Duplicate towns-hobbies (same town + hobby)'
  );

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('3️⃣  CHECKING FOR NULL FOREIGN KEYS\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check NULL foreign keys
  await checkNullForeignKeys(
    'favorites',
    'user_id',
    'Favorites with NULL user_id'
  );

  await checkNullForeignKeys(
    'favorites',
    'town_id',
    'Favorites with NULL town_id'
  );

  await checkNullForeignKeys(
    'user_preferences',
    'user_id',
    'User preferences with NULL user_id'
  );

  await checkNullForeignKeys(
    'notifications',
    'user_id',
    'Notifications with NULL user_id'
  );

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📋 SUMMARY\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`Total checks performed: ${totalChecks}`);
  console.log(`Total issues found: ${issues.length}`);
  console.log(`Total orphaned records: ${totalOrphans}\n`);

  if (issues.length === 0) {
    console.log('✅ ✅ ✅  NO ORPHANED RECORDS FOUND  ✅ ✅ ✅\n');
    console.log('Database integrity: EXCELLENT');
    console.log('Foreign key relationships: ALL VALID');
    console.log('Production readiness: PASSED\n');
  } else {
    console.log('⚠️  ISSUES FOUND:\n');

    const orphanedIssues = issues.filter(i => i.type === 'ORPHANED');
    const duplicateIssues = issues.filter(i => i.type === 'DUPLICATES');
    const nullIssues = issues.filter(i => i.type === 'NULL_FK');
    const errorIssues = issues.filter(i => i.type === 'ERROR');

    if (orphanedIssues.length > 0) {
      console.log(`   ORPHANED RECORDS: ${orphanedIssues.length} issues`);
      orphanedIssues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue.description}`);
        console.log(`      ${issue.affectedCount} records in ${issue.childTable}`);
      });
      console.log('');
    }

    if (duplicateIssues.length > 0) {
      console.log(`   DUPLICATES: ${duplicateIssues.length} issues`);
      duplicateIssues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue.description}`);
        console.log(`      ${issue.count} duplicate records in ${issue.table}`);
      });
      console.log('');
    }

    if (nullIssues.length > 0) {
      console.log(`   NULL FOREIGN KEYS: ${nullIssues.length} issues`);
      nullIssues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue.description}`);
        console.log(`      ${issue.count} records in ${issue.table}`);
      });
      console.log('');
    }

    if (errorIssues.length > 0) {
      console.log(`   ERRORS: ${errorIssues.length} issues`);
      errorIssues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue.description}`);
        console.log(`      Error: ${issue.error}`);
      });
      console.log('');
    }

    console.log('RECOMMENDATION:');
    if (orphanedIssues.length > 0 || nullIssues.length > 0) {
      console.log('   ⚠️  FIX REQUIRED before production launch');
      console.log('   - Orphaned/NULL foreign keys can cause application errors');
      console.log('   - Run cleanup scripts to remove invalid references\n');
    } else if (duplicateIssues.length > 0) {
      console.log('   ℹ️  DUPLICATES FOUND but may be acceptable');
      console.log('   - Review duplicate records manually');
      console.log('   - Consider if they represent valid use cases\n');
    }
  }

  console.log('═══════════════════════════════════════════════════════════\n');

  // Exit with error code if critical issues found
  if (issues.filter(i => i.type === 'ORPHANED' || i.type === 'NULL_FK').length > 0) {
    process.exit(1);
  }
}

// Run the checks
runChecks().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
