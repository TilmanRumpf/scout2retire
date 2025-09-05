#!/usr/bin/env node

// COMPREHENSIVE LOWERCASE NORMALIZATION FOR TOWNS TABLE
// Fixes the case sensitivity bug that caused the 40-hour disaster

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// All columns that need normalization (38 total)
const COLUMNS_TO_NORMALIZE = [
  // Group 1: Core Data Fields
  'climate',
  'expat_population',
  'crime_rate',
  'geo_region',
  'region',
  'regions',
  'water_bodies',
  'nearest_airport',
  'tax_rates',
  'geographic_features',
  
  // Group 2: Critical Matching Fields (HIGHEST PRIORITY)
  'geographic_features_actual',
  'vegetation_type_actual',
  'swimming_facilities',
  'visa_requirements',
  
  // Group 3: Description Fields
  'description',
  'climate_description',
  'cost_description',
  'healthcare_description',
  'lifestyle_description',
  'safety_description',
  'infrastructure_description',
  
  // Group 4: Cultural Landmarks
  'cultural_landmark_1',
  'cultural_landmark_2',
  'cultural_landmark_3',
  
  // Group 5: Image & Metadata
  'image_url_1',
  'image_license',
  'image_photographer',
  'image_validation_note',
  
  // Group 6: System Fields
  'google_maps_link'
];

async function normalizeColumn(columnName) {
  try {
    console.log(`  Normalizing ${columnName}...`);
    
    // First, get all towns with this column
    const { data: towns, error: fetchError } = await supabase
      .from('towns')
      .select(`id, ${columnName}`)
      .not(columnName, 'is', null);
    
    if (fetchError) {
      console.error(`    ❌ Error fetching ${columnName}:`, fetchError.message);
      return { column: columnName, success: false, error: fetchError.message };
    }
    
    // Process in batches to avoid timeout
    const batchSize = 50;
    let updatedCount = 0;
    
    for (let i = 0; i < towns.length; i += batchSize) {
      const batch = towns.slice(i, i + batchSize);
      
      for (const town of batch) {
        const originalValue = town[columnName];
        if (!originalValue) continue;
        
        const normalizedValue = String(originalValue).toLowerCase();
        
        // Only update if value changed
        if (originalValue !== normalizedValue) {
          const { error: updateError } = await supabase
            .from('towns')
            .update({ [columnName]: normalizedValue })
            .eq('id', town.id);
          
          if (updateError) {
            console.error(`    ❌ Error updating town ${town.id}:`, updateError.message);
          } else {
            updatedCount++;
          }
        }
      }
    }
    
    console.log(`    ✅ Normalized ${updatedCount} records`);
    return { column: columnName, success: true, updatedCount };
    
  } catch (error) {
    console.error(`    ❌ Unexpected error for ${columnName}:`, error);
    return { column: columnName, success: false, error: error.message };
  }
}

async function validateNormalization(columnName) {
  // Check if any uppercase letters remain
  const { data: towns, error } = await supabase
    .from('towns')
    .select(`id, ${columnName}`)
    .not(columnName, 'is', null);
  
  if (error) {
    return { column: columnName, validated: false, error: error.message };
  }
  
  let uppercaseCount = 0;
  for (const town of towns) {
    const value = town[columnName];
    if (value && /[A-Z]/.test(String(value))) {
      uppercaseCount++;
    }
  }
  
  return { 
    column: columnName, 
    validated: uppercaseCount === 0, 
    uppercaseRemaining: uppercaseCount 
  };
}

async function runNormalization() {
  console.log('🚀 STARTING COMPREHENSIVE LOWERCASE NORMALIZATION');
  console.log('=' .repeat(80));
  console.log(`📊 Normalizing ${COLUMNS_TO_NORMALIZE.length} columns`);
  console.log(`🔒 Snapshot: 2025-08-26T22-23-53`);
  console.log('=' .repeat(80) + '\n');
  
  const results = [];
  const startTime = Date.now();
  
  // Process critical fields first
  console.log('🔴 PHASE 1: CRITICAL MATCHING FIELDS (Fix 40-hour bug)');
  console.log('-'.repeat(40));
  const criticalFields = ['geographic_features_actual', 'vegetation_type_actual'];
  
  for (const column of criticalFields) {
    const result = await normalizeColumn(column);
    results.push(result);
  }
  
  console.log('\n📝 PHASE 2: ALL OTHER FIELDS');
  console.log('-'.repeat(40));
  const otherFields = COLUMNS_TO_NORMALIZE.filter(c => !criticalFields.includes(c));
  
  // Process in parallel batches for speed
  const batchSize = 5;
  for (let i = 0; i < otherFields.length; i += batchSize) {
    const batch = otherFields.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(normalizeColumn));
    results.push(...batchResults);
  }
  
  // Validation phase
  console.log('\n✅ PHASE 3: VALIDATION');
  console.log('-'.repeat(40));
  
  const validationResults = [];
  for (const column of COLUMNS_TO_NORMALIZE) {
    const validation = await validateNormalization(column);
    validationResults.push(validation);
    
    if (!validation.validated) {
      console.log(`  ⚠️ ${column}: ${validation.uppercaseRemaining} uppercase values remain`);
    }
  }
  
  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '=' .repeat(80));
  console.log('📊 NORMALIZATION COMPLETE');
  console.log(`⏱️ Duration: ${duration} seconds`);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalUpdated = results.reduce((sum, r) => sum + (r.updatedCount || 0), 0);
  
  console.log(`✅ Successful: ${successful}/${COLUMNS_TO_NORMALIZE.length} columns`);
  console.log(`📝 Total records updated: ${totalUpdated}`);
  
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} columns`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.column}: ${r.error}`);
    });
  }
  
  const fullyValidated = validationResults.filter(v => v.validated).length;
  console.log(`\n🔍 Validation: ${fullyValidated}/${COLUMNS_TO_NORMALIZE.length} columns fully normalized`);
  
  if (fullyValidated === COLUMNS_TO_NORMALIZE.length) {
    console.log('🎉 SUCCESS: All columns normalized to lowercase!');
    console.log('✅ The case sensitivity bug is FIXED!');
  } else {
    console.log('⚠️ WARNING: Some columns still have uppercase values');
    console.log('Please review and run again if needed');
  }
  
  console.log('\n📌 To restore if needed:');
  console.log('node restore-database-snapshot.js 2025-08-26T22-23-53');
}

// Run the normalization
runNormalization().catch(console.error);