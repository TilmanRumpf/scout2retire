#!/usr/bin/env node

/**
 * Budget Tier Migration Script
 *
 * Fix: Budget tiers were using LOWER bounds instead of UPPER bounds
 * This caused matching algorithm to be too restrictive
 *
 * Example: User selects "$2,000-3,000" → Should use $3,000 (max they can afford)
 *          Old system used $2,000 → Towns with $2,500 cost excluded incorrectly
 *
 * Date: 2025-10-15
 */

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

// Migration mappings: OLD value (lower bound) → NEW value (upper bound)
const MIGRATION_MAPS = {
  total_monthly_budget: {
    1500: 2000,  // Budget: $1,500-2,000
    2000: 3000,  // Moderate: $2,000-3,000
    3000: 4000,  // Comfortable: $3,000-4,000
    4000: 5000,  // Premium: $4,000-5,000
    5000: 6000   // Luxury: $5,000+
  },
  max_monthly_rent: {
    500: 750,    // Budget: $500-750
    750: 1000,   // Moderate: $750-1,000
    1000: 1500,  // Comfortable: $1,000-1,500
    1500: 2000,  // Premium: $1,500-2,000
    2000: 2500   // Luxury: $2,000+
  },
  max_home_price: {
    100000: 200000,  // Budget: $100k-200k
    200000: 300000,  // Moderate: $200k-300k
    300000: 400000,  // Comfortable: $300k-400k
    400000: 500000,  // Premium: $400k-500k
    500000: 600000   // Luxury: $500k+
  },
  monthly_healthcare_budget: {
    500: 750,    // Basic: $500-750
    750: 1000,   // Standard: $750-1,000
    1000: 1250,  // Enhanced: $1,000-1,250
    1250: 1500,  // Comprehensive: $1,250-1,500
    1500: 2000   // Premium: $1,500+
  }
};

/**
 * Migrate array of budget values
 */
function migrateArray(oldArray, migrationMap) {
  if (!Array.isArray(oldArray) || oldArray.length === 0) {
    return { migrated: false, newArray: oldArray };
  }

  const newArray = oldArray.map(value => {
    const newValue = migrationMap[value];
    if (newValue) {
      console.log(`    Migrating: $${value.toLocaleString()} → $${newValue.toLocaleString()}`);
      return newValue;
    }
    return value;
  });

  const changed = JSON.stringify(oldArray) !== JSON.stringify(newArray);
  return { migrated: changed, newArray };
}

/**
 * Check and migrate user preferences
 */
async function migrateUserPreferences() {
  console.log('🔍 Checking user_preferences table...\n');

  // Get all users with budget preferences
  const { data: users, error } = await supabase
    .from('user_preferences')
    .select('user_id, preference_data')
    .not('preference_data', 'is', null);

  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users with preferences\n`);

  let migratedCount = 0;
  let affectedFields = new Set();

  for (const user of users) {
    const prefs = user.preference_data;
    let updated = false;
    const updates = {};

    // Check each budget field
    for (const [field, migrationMap] of Object.entries(MIGRATION_MAPS)) {
      if (prefs[field]) {
        const result = migrateArray(prefs[field], migrationMap);
        if (result.migrated) {
          console.log(`  User ${user.user_id}:`);
          console.log(`    Field: ${field}`);
          updates[field] = result.newArray;
          updated = true;
          affectedFields.add(field);
        }
      }
    }

    // Update if changes detected
    if (updated) {
      const newPrefs = { ...prefs, ...updates };
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ preference_data: newPrefs })
        .eq('user_id', user.user_id);

      if (updateError) {
        console.error(`    ❌ Failed to update user ${user.user_id}:`, updateError);
      } else {
        console.log(`    ✅ Updated successfully\n`);
        migratedCount++;
      }
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log('====================');
  console.log(`Total users checked: ${users.length}`);
  console.log(`Users migrated: ${migratedCount}`);
  console.log(`Affected fields: ${Array.from(affectedFields).join(', ') || 'none'}`);
}

/**
 * Check onboarding_progress table
 */
async function migrateOnboardingProgress() {
  console.log('\n🔍 Checking onboarding_progress table...\n');

  const { data: records, error } = await supabase
    .from('onboarding_progress')
    .select('user_id, costs')
    .not('costs', 'is', null);

  if (error) {
    console.error('❌ Error fetching onboarding records:', error);
    return;
  }

  console.log(`Found ${records.length} onboarding records with costs\n`);

  let migratedCount = 0;

  for (const record of records) {
    const costs = record.costs;
    let updated = false;
    const updates = {};

    for (const [field, migrationMap] of Object.entries(MIGRATION_MAPS)) {
      if (costs[field]) {
        const result = migrateArray(costs[field], migrationMap);
        if (result.migrated) {
          console.log(`  User ${record.user_id}:`);
          console.log(`    Field: ${field}`);
          updates[field] = result.newArray;
          updated = true;
        }
      }
    }

    if (updated) {
      const newCosts = { ...costs, ...updates };
      const { error: updateError } = await supabase
        .from('onboarding_progress')
        .update({ costs: newCosts })
        .eq('user_id', record.user_id);

      if (updateError) {
        console.error(`    ❌ Failed to update:`, updateError);
      } else {
        console.log(`    ✅ Updated successfully\n`);
        migratedCount++;
      }
    }
  }

  console.log('\n📊 Onboarding Migration Summary:');
  console.log('================================');
  console.log(`Total records checked: ${records.length}`);
  console.log(`Records migrated: ${migratedCount}`);
}

// Run migrations
async function main() {
  console.log('🚀 Budget Tier Migration - Upper Bound Fix\n');
  console.log('Problem: Budget tiers stored LOWER bounds (too restrictive)');
  console.log('Solution: Migrate to UPPER bounds (max user can afford)\n');
  console.log('='.repeat(60));
  console.log('');

  await migrateUserPreferences();
  await migrateOnboardingProgress();

  console.log('\n✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Test onboarding flow at http://localhost:5173/onboarding/costs');
  console.log('2. Verify matching algorithm uses new values correctly');
  console.log('3. Create checkpoint if everything works\n');
}

main().catch(console.error);
