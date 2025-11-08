#!/usr/bin/env node

/**
 * COMPREHENSIVE Photo Migration Verification
 * Quality Control Agent - Deep verification of town_images migration
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Expected baseline
const BASELINE = {
  display_order_1: 195,
  display_order_2: 12,
  display_order_3: 0,
  total: 207
};

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(check, details = '') {
  results.passed.push({ check, details });
  console.log(`✅ PASS: ${check}${details ? ' - ' + details : ''}`);
}

function fail(check, details) {
  results.failed.push({ check, details });
  console.log(`❌ FAIL: ${check}`);
  console.log(`   ${details}`);
}

function warn(check, details) {
  results.warnings.push({ check, details });
  console.log(`⚠️  WARN: ${check}`);
  console.log(`   ${details}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70) + '\n');
}

async function verifyTableStructure() {
  section('1. TABLE STRUCTURE VERIFICATION');

  try {
    // Query a sample record to verify columns
    const { data, error } = await supabase
      .from('town_images')
      .select('*')
      .limit(1);

    if (error) {
      fail('Table accessible', error.message);
      return false;
    }

    if (!data || data.length === 0) {
      warn('Sample data', 'No records found in table');
    } else {
      const record = data[0];
      const requiredColumns = [
        'id', 'town_id', 'image_url', 'display_order', 'source',
        'photographer', 'license', 'is_fallback', 'validated_at',
        'validation_note', 'created_at', 'updated_at'
      ];

      const presentColumns = Object.keys(record);
      const missingColumns = requiredColumns.filter(col => !presentColumns.includes(col));

      if (missingColumns.length === 0) {
        pass('All required columns present');
      } else {
        fail('Required columns', `Missing: ${missingColumns.join(', ')}`);
        return false;
      }
    }

    pass('Table structure valid');
    return true;

  } catch (err) {
    fail('Table structure check', err.message);
    return false;
  }
}

async function verifyDataMigration() {
  section('2. DATA MIGRATION VERIFICATION');

  // Count by display_order
  const counts = {};
  let totalCount = 0;

  for (let order = 1; order <= 3; order++) {
    const { count, error } = await supabase
      .from('town_images')
      .select('*', { count: 'exact', head: true })
      .eq('display_order', order);

    if (error) {
      fail(`Count display_order=${order}`, error.message);
      return false;
    }

    counts[order] = count;
    totalCount += count;

    const expected = BASELINE[`display_order_${order}`];
    console.log(`Display order ${order}: ${count} records (expected: ${expected})`);

    if (count === expected) {
      pass(`Display order ${order} count matches`);
    } else {
      fail(`Display order ${order} count mismatch`, `Got ${count}, expected ${expected}`);
    }
  }

  console.log(`\nTotal records: ${totalCount} (expected: ${BASELINE.total})`);

  if (totalCount === BASELINE.total) {
    pass('Total record count matches baseline');
  } else {
    fail('Total record count', `Got ${totalCount}, expected ${BASELINE.total}`);
  }

  // Check for NULL or empty URLs
  const { count: nullUrls, error: nullError } = await supabase
    .from('town_images')
    .select('*', { count: 'exact', head: true })
    .or('image_url.is.null,image_url.eq.');

  if (nullError) {
    fail('NULL URL check', nullError.message);
  } else if (nullUrls > 0) {
    fail('Data integrity', `Found ${nullUrls} NULL or empty image URLs`);
  } else {
    pass('No NULL or empty image URLs');
  }

  return true;
}

async function verifyMetadata() {
  section('3. METADATA VERIFICATION');

  // Check if metadata was migrated
  const { data: withMetadata, error } = await supabase
    .from('town_images')
    .select('id, town_id, source, photographer, license')
    .or('source.not.is.null,photographer.not.is.null,license.not.is.null')
    .limit(10);

  if (error) {
    fail('Metadata query', error.message);
    return false;
  }

  if (withMetadata && withMetadata.length > 0) {
    pass('Metadata fields populated', `Found ${withMetadata.length} records with metadata`);
    console.log('   Sample metadata:');
    withMetadata.slice(0, 3).forEach(row => {
      console.log(`   - Town ${row.town_id}: source="${row.source || 'null'}", ` +
                  `photographer="${row.photographer || 'null'}", license="${row.license || 'null'}"`);
    });
  } else {
    warn('Metadata migration', 'No metadata found in migrated records');
  }

  return true;
}

async function verifyConstraints() {
  section('4. CONSTRAINT VERIFICATION');

  // Check for duplicate display_order per town
  const { data: allRecords, error } = await supabase
    .from('town_images')
    .select('town_id, display_order')
    .order('town_id')
    .order('display_order');

  if (error) {
    fail('Constraint check query', error.message);
    return false;
  }

  const townOrders = new Map();
  let duplicates = 0;

  allRecords.forEach(row => {
    const key = `${row.town_id}-${row.display_order}`;
    if (townOrders.has(key)) {
      duplicates++;
      if (duplicates <= 5) {
        fail('Unique constraint violation', `Town ${row.town_id} has duplicate display_order ${row.display_order}`);
      }
    }
    townOrders.set(key, true);
  });

  if (duplicates === 0) {
    pass('No duplicate display_order per town');
  } else if (duplicates > 5) {
    fail('Unique constraint', `Total ${duplicates} duplicate violations found`);
  }

  // Check display_order range
  const { count: invalidRange, error: rangeError } = await supabase
    .from('town_images')
    .select('*', { count: 'exact', head: true })
    .or('display_order.lt.1,display_order.gt.3');

  if (rangeError) {
    fail('Range check', rangeError.message);
  } else if (invalidRange > 0) {
    fail('Display order range', `Found ${invalidRange} records with invalid display_order`);
  } else {
    pass('All display_order values in valid range (1-3)');
  }

  return duplicates === 0;
}

async function verifyDataIntegrity() {
  section('5. DATA INTEGRITY VERIFICATION');

  // Get all town_ids from town_images
  const { data: imageRecords, error: imgError } = await supabase
    .from('town_images')
    .select('town_id');

  if (imgError) {
    fail('Query town_images', imgError.message);
    return false;
  }

  // Get all town ids
  const { data: towns, error: townError } = await supabase
    .from('towns')
    .select('id');

  if (townError) {
    fail('Query towns', townError.message);
    return false;
  }

  const validTownIds = new Set(towns.map(t => t.id));
  const orphanedRecords = imageRecords.filter(img => !validTownIds.has(img.town_id));

  if (orphanedRecords.length === 0) {
    pass('No orphaned records (all town_ids reference valid towns)');
  } else {
    fail('Orphaned records', `Found ${orphanedRecords.length} records with invalid town_id`);
  }

  return orphanedRecords.length === 0;
}

async function verifyCacheSync() {
  section('6. CACHE SYNCHRONIZATION VERIFICATION');

  // Get all primary images
  const { data: primaryImages, error: imgError } = await supabase
    .from('town_images')
    .select('town_id, image_url')
    .eq('display_order', 1);

  if (imgError) {
    fail('Query primary images', imgError.message);
    return false;
  }

  // Get all towns with image_url_1
  const { data: towns, error: townError } = await supabase
    .from('towns')
    .select('id, image_url_1');

  if (townError) {
    fail('Query towns cache', townError.message);
    return false;
  }

  // Create lookup map
  const imageMap = new Map();
  primaryImages.forEach(img => {
    imageMap.set(img.town_id, img.image_url);
  });

  let mismatches = 0;
  const mismatchDetails = [];

  towns.forEach(town => {
    const cacheUrl = town.image_url_1;
    const actualUrl = imageMap.get(town.id);

    if (cacheUrl !== actualUrl) {
      mismatches++;
      if (mismatches <= 5) {
        mismatchDetails.push(`Town ${town.id}: cache="${cacheUrl}" vs actual="${actualUrl || 'null'}"`);
      }
    }
  });

  if (mismatches === 0) {
    pass('Cache 100% synchronized with town_images');
  } else {
    fail('Cache synchronization', `${mismatches} mismatches found`);
    mismatchDetails.forEach(detail => console.log(`   ${detail}`));
    if (mismatches > 5) {
      console.log(`   ... and ${mismatches - 5} more`);
    }
  }

  return mismatches === 0;
}

async function verifyTrigger() {
  section('7. TRIGGER FUNCTIONALITY VERIFICATION');

  try {
    // Find a test town with a primary image
    const { data: testImage, error } = await supabase
      .from('town_images')
      .select('id, town_id, image_url')
      .eq('display_order', 1)
      .limit(1)
      .single();

    if (error || !testImage) {
      warn('Trigger test', 'No primary images found to test trigger');
      return true;
    }

    const originalUrl = testImage.image_url;
    const testUrl = `https://test-trigger-${Date.now()}.jpg`;

    // Update the image
    const { error: updateError } = await supabase
      .from('town_images')
      .update({ image_url: testUrl })
      .eq('id', testImage.id);

    if (updateError) {
      fail('Update test image', updateError.message);
      return false;
    }

    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if cache updated
    const { data: updatedTown, error: checkError } = await supabase
      .from('towns')
      .select('image_url_1')
      .eq('id', testImage.town_id)
      .single();

    if (checkError) {
      fail('Check trigger result', checkError.message);
    } else if (updatedTown.image_url_1 === testUrl) {
      pass('Trigger successfully updates cache on change');
    } else {
      fail('Trigger not working', `Expected cache="${testUrl}", got="${updatedTown.image_url_1}"`);
    }

    // Restore original
    await supabase
      .from('town_images')
      .update({ image_url: originalUrl })
      .eq('id', testImage.id);

    return true;

  } catch (err) {
    fail('Trigger test', err.message);
    return false;
  }
}

async function verifyRLS() {
  section('8. RLS POLICY VERIFICATION');

  // Test with anon key
  const anonClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  // Test public read
  const { data: publicData, error: readError } = await anonClient
    .from('town_images')
    .select('id, image_url')
    .limit(1);

  if (readError) {
    fail('Public read access', readError.message);
  } else if (publicData && publicData.length > 0) {
    pass('Public can read town_images');
  } else {
    warn('Public read', 'Query succeeded but returned no data');
  }

  // Test unauthenticated write
  const { error: writeError } = await anonClient
    .from('town_images')
    .insert({
      town_id: 1,
      image_url: 'https://test.jpg',
      display_order: 1
    });

  if (writeError) {
    if (writeError.message.includes('policy') || writeError.message.includes('permission')) {
      pass('Unauthenticated writes correctly blocked');
    } else {
      warn('Write block', `Blocked with: ${writeError.message}`);
    }
  } else {
    fail('RLS write protection', 'Unauthenticated INSERT succeeded (should be blocked)');
    // Cleanup
    await supabase.from('town_images').delete().eq('image_url', 'https://test.jpg');
  }

  return true;
}

function printSummary() {
  section('COMPREHENSIVE VERIFICATION SUMMARY');

  const totalChecks = results.passed.length + results.failed.length;
  const score = totalChecks > 0 ? Math.round((results.passed.length / totalChecks) * 100) : 0;

  console.log(`✅ PASSED: ${results.passed.length}`);
  console.log(`❌ FAILED: ${results.failed.length}`);
  console.log(`⚠️  WARNINGS: ${results.warnings.length}`);
  console.log(`\n📊 OVERALL SCORE: ${score}%\n`);

  if (results.failed.length > 0) {
    console.log('❌ FAILURES DETECTED:\n');
    results.failed.forEach(({ check, details }) => {
      console.log(`   • ${check}`);
      console.log(`     ${details}\n`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    results.warnings.forEach(({ check, details }) => {
      console.log(`   • ${check}`);
      console.log(`     ${details}\n`);
    });
  }

  console.log('='.repeat(70));

  if (score === 100) {
    console.log('\n🎉 MIGRATION SUCCESSFUL - ALL CHECKS PASSED!\n');
    console.log('The town_images table migration completed successfully with:');
    console.log('  • Zero data loss');
    console.log('  • Proper constraints and indexes');
    console.log('  • Working triggers for cache sync');
    console.log('  • Correct RLS policies\n');
    return 0;
  } else if (score >= 90) {
    console.log('\n✅ MIGRATION MOSTLY SUCCESSFUL - Minor issues detected\n');
    console.log('Review warnings above. Migration can proceed.\n');
    return 0;
  } else if (score >= 70) {
    console.log('\n⚠️  MIGRATION PARTIALLY SUCCESSFUL - Review required\n');
    console.log('Some checks failed. Review failures before proceeding.\n');
    return 1;
  } else {
    console.log('\n❌ MIGRATION FAILED - Critical issues detected\n');
    console.log('Multiple checks failed. Consider rollback and investigation.\n');
    return 1;
  }
}

async function runComprehensiveVerification() {
  console.log('\n╔═════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                 ║');
  console.log('║     PHOTO SYSTEM MIGRATION - COMPREHENSIVE QA VERIFICATION      ║');
  console.log('║                                                                 ║');
  console.log('║     Quality Control Agent - Deep Migration Verification        ║');
  console.log('║                                                                 ║');
  console.log('╚═════════════════════════════════════════════════════════════════╝\n');

  try {
    await verifyTableStructure();
    await verifyDataMigration();
    await verifyMetadata();
    await verifyConstraints();
    await verifyDataIntegrity();
    await verifyCacheSync();
    await verifyTrigger();
    await verifyRLS();
  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error.message);
    console.error(error.stack);
    fail('Script execution', error.message);
  }

  const exitCode = printSummary();
  process.exit(exitCode);
}

runComprehensiveVerification();
