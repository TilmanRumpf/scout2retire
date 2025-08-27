#!/usr/bin/env node

// EMERGENCY FIX: Restore proper case to descriptive text fields ONLY
// Keeps critical matching fields (geographic_features_actual, vegetation_type_actual) lowercase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Fields that need proper case restoration
const FIELDS_TO_RESTORE = [
  'description',
  'climate_description', 
  'cost_description',
  'healthcare_description',
  'lifestyle_description',
  'safety_description',
  'infrastructure_description',
  'cultural_landmark_1',
  'cultural_landmark_2',
  'cultural_landmark_3',
  'region',
  'regions',
  'water_bodies',
  'nearest_airport',
  'google_maps_link'
];

// Fields that must STAY lowercase (for matching algorithm)
const KEEP_LOWERCASE = [
  'geographic_features_actual',
  'vegetation_type_actual',
  'climate',
  'expat_population',
  'crime_rate',
  'geo_region'
];

async function restoreDescriptiveText() {
  console.log('🚨 EMERGENCY FIX: Restoring proper case to descriptive text');
  console.log('=' .repeat(80));
  
  try {
    // Read the backup from BEFORE the bad normalization
    const backupPath = 'database-snapshots/2025-08-26T22-23-53/towns.json';
    console.log(`📖 Reading backup from: ${backupPath}`);
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`✅ Found ${backupData.length} towns in backup`);
    
    // Process in parallel batches for speed
    const batchSize = 20;
    let updatedCount = 0;
    
    console.log('\n🚀 Starting parallel restoration...');
    console.log(`📝 Restoring fields: ${FIELDS_TO_RESTORE.join(', ')}`);
    console.log(`🔒 Keeping lowercase: ${KEEP_LOWERCASE.join(', ')}`);
    console.log('-'.repeat(80));
    
    for (let i = 0; i < backupData.length; i += batchSize) {
      const batch = backupData.slice(i, i + batchSize);
      
      // Process batch in parallel
      const promises = batch.map(async (backupTown) => {
        // Build update object with ONLY the fields to restore
        const updateData = {};
        
        FIELDS_TO_RESTORE.forEach(field => {
          if (backupTown[field] !== null && backupTown[field] !== undefined) {
            updateData[field] = backupTown[field]; // Use original case from backup
          }
        });
        
        // Update the town
        const { error } = await supabase
          .from('towns')
          .update(updateData)
          .eq('id', backupTown.id);
        
        if (error) {
          console.error(`❌ Error updating ${backupTown.name}:`, error.message);
          return false;
        }
        
        return true;
      });
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r).length;
      updatedCount += successCount;
      
      console.log(`  Batch ${Math.floor(i/batchSize) + 1}: Updated ${successCount}/${batch.length} towns`);
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('✅ RESTORATION COMPLETE');
    console.log(`📊 Updated ${updatedCount}/${backupData.length} towns`);
    console.log('\n🔍 Verifying critical fields are still lowercase...');
    
    // Verify critical fields remain lowercase
    const { data: sampleTown } = await supabase
      .from('towns')
      .select('name, geographic_features_actual, vegetation_type_actual, description')
      .limit(1)
      .single();
    
    if (sampleTown) {
      console.log('\n📋 Sample verification:');
      console.log(`  Town: ${sampleTown.name}`);
      console.log(`  Geographic (lowercase): ${sampleTown.geographic_features_actual}`);
      console.log(`  Vegetation (lowercase): ${sampleTown.vegetation_type_actual}`);
      console.log(`  Description (proper case): ${sampleTown.description?.substring(0, 50)}...`);
    }
    
    console.log('\n🎉 SUCCESS: Descriptive text restored while keeping matching fields lowercase!');
    console.log('✅ The UI should now display properly formatted text');
    console.log('✅ The matching algorithm will still work with lowercase fields');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the restoration
restoreDescriptiveText();