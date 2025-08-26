#!/usr/bin/env node

// CRITICAL CASE SENSITIVITY FIX
// Normalizes geographic_features_actual and vegetation_type_actual to lowercase
// This fixes the 40-hour bug where "coastal" ≠ "Coastal" caused scoring failures

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function normalizeFields() {
  console.log('🔧 CRITICAL CASE SENSITIVITY NORMALIZATION');
  console.log('Fixing the 40-hour bug: "coastal" ≠ "Coastal"\n');

  try {
    // First, check the current state
    console.log('1. Checking current state of fields...');
    
    const { data: beforeData, error: beforeError } = await supabase
      .from('towns')
      .select('id, geographic_features_actual, vegetation_type_actual')
      .not('geographic_features_actual', 'is', null)
      .limit(10);
    
    if (beforeError) {
      console.error('❌ Error checking current state:', beforeError.message);
      return;
    }

    console.log('Sample data BEFORE normalization:');
    beforeData.forEach(town => {
      console.log(`  Town ${town.id}: geo="${town.geographic_features_actual}" veg="${town.vegetation_type_actual}"`);
    });

    // Count records that need updating
    const { count: geoCount, error: geoCountError } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('geographic_features_actual', 'is', null);

    const { count: vegCount, error: vegCountError } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('vegetation_type_actual', 'is', null);

    console.log(`\n📊 Records to normalize:`);
    console.log(`   Geographic features: ${geoCount} records`);
    console.log(`   Vegetation types: ${vegCount} records`);

    // 2. Normalize geographic_features_actual
    console.log('\n2. Normalizing geographic_features_actual...');
    
    const { data: geoData, error: geoError } = await supabase
      .from('towns')
      .select('id, geographic_features_actual')
      .not('geographic_features_actual', 'is', null);

    if (geoError) {
      console.error('❌ Error fetching geographic features:', geoError.message);
      return;
    }

    let geoUpdated = 0;
    for (const town of geoData) {
      if (!town.geographic_features_actual) continue;
      
      let normalizedGeo;
      if (typeof town.geographic_features_actual === 'string') {
        normalizedGeo = town.geographic_features_actual.toLowerCase();
      } else if (Array.isArray(town.geographic_features_actual)) {
        normalizedGeo = town.geographic_features_actual.map(item => 
          typeof item === 'string' ? item.toLowerCase() : item
        );
      } else {
        console.log(`Skipping town ${town.id}: unexpected data type ${typeof town.geographic_features_actual}`);
        continue;
      }

      // Check if update is needed (handle both string and array comparisons)
      let needsUpdate = false;
      if (typeof town.geographic_features_actual === 'string') {
        needsUpdate = town.geographic_features_actual !== normalizedGeo;
      } else if (Array.isArray(town.geographic_features_actual)) {
        needsUpdate = JSON.stringify(town.geographic_features_actual) !== JSON.stringify(normalizedGeo);
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('towns')
          .update({ geographic_features_actual: normalizedGeo })
          .eq('id', town.id);

        if (updateError) {
          console.error(`❌ Error updating town ${town.id}:`, updateError.message);
        } else {
          geoUpdated++;
        }
      }
    }

    console.log(`✅ Geographic features normalized: ${geoUpdated} records updated`);

    // 3. Normalize vegetation_type_actual
    console.log('\n3. Normalizing vegetation_type_actual...');
    
    const { data: vegData, error: vegError } = await supabase
      .from('towns')
      .select('id, vegetation_type_actual')
      .not('vegetation_type_actual', 'is', null);

    if (vegError) {
      console.error('❌ Error fetching vegetation types:', vegError.message);
      return;
    }

    let vegUpdated = 0;
    for (const town of vegData) {
      if (!town.vegetation_type_actual) continue;
      
      let normalizedVeg;
      if (typeof town.vegetation_type_actual === 'string') {
        normalizedVeg = town.vegetation_type_actual.toLowerCase();
      } else if (Array.isArray(town.vegetation_type_actual)) {
        normalizedVeg = town.vegetation_type_actual.map(item => 
          typeof item === 'string' ? item.toLowerCase() : item
        );
      } else {
        console.log(`Skipping town ${town.id}: unexpected data type ${typeof town.vegetation_type_actual}`);
        continue;
      }

      // Check if update is needed (handle both string and array comparisons)
      let needsUpdate = false;
      if (typeof town.vegetation_type_actual === 'string') {
        needsUpdate = town.vegetation_type_actual !== normalizedVeg;
      } else if (Array.isArray(town.vegetation_type_actual)) {
        needsUpdate = JSON.stringify(town.vegetation_type_actual) !== JSON.stringify(normalizedVeg);
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('towns')
          .update({ vegetation_type_actual: normalizedVeg })
          .eq('id', town.id);

        if (updateError) {
          console.error(`❌ Error updating town ${town.id}:`, updateError.message);
        } else {
          vegUpdated++;
        }
      }
    }

    console.log(`✅ Vegetation types normalized: ${vegUpdated} records updated`);

    // 4. Verification - check no uppercase remains
    console.log('\n4. Verification - checking for remaining uppercase...');
    
    // Check geographic features for uppercase
    const { data: remainingGeo, error: remainingGeoError } = await supabase
      .from('towns')
      .select('id, geographic_features_actual')
      .not('geographic_features_actual', 'is', null);

    if (remainingGeoError) {
      console.error('❌ Error during geo verification:', remainingGeoError.message);
    } else {
      const geoWithUpper = remainingGeo.filter(town => {
        if (!town.geographic_features_actual) return false;
        if (typeof town.geographic_features_actual === 'string') {
          return /[A-Z]/.test(town.geographic_features_actual);
        } else if (Array.isArray(town.geographic_features_actual)) {
          return town.geographic_features_actual.some(item => 
            typeof item === 'string' && /[A-Z]/.test(item)
          );
        }
        return false;
      });
      
      if (geoWithUpper.length === 0) {
        console.log('✅ Geographic features: NO uppercase characters remain');
      } else {
        console.log(`❌ Geographic features: ${geoWithUpper.length} records still have uppercase`);
        geoWithUpper.slice(0, 5).forEach(town => {
          console.log(`   Town ${town.id}: "${town.geographic_features_actual}"`);
        });
      }
    }

    // Check vegetation types for uppercase
    const { data: remainingVeg, error: remainingVegError } = await supabase
      .from('towns')
      .select('id, vegetation_type_actual')
      .not('vegetation_type_actual', 'is', null);

    if (remainingVegError) {
      console.error('❌ Error during veg verification:', remainingVegError.message);
    } else {
      const vegWithUpper = remainingVeg.filter(town => {
        if (!town.vegetation_type_actual) return false;
        if (typeof town.vegetation_type_actual === 'string') {
          return /[A-Z]/.test(town.vegetation_type_actual);
        } else if (Array.isArray(town.vegetation_type_actual)) {
          return town.vegetation_type_actual.some(item => 
            typeof item === 'string' && /[A-Z]/.test(item)
          );
        }
        return false;
      });
      
      if (vegWithUpper.length === 0) {
        console.log('✅ Vegetation types: NO uppercase characters remain');
      } else {
        console.log(`❌ Vegetation types: ${vegWithUpper.length} records still have uppercase`);
        vegWithUpper.slice(0, 5).forEach(town => {
          console.log(`   Town ${town.id}: "${town.vegetation_type_actual}"`);
        });
      }
    }

    // Final sample check
    console.log('\n5. Final sample check...');
    const { data: afterData, error: afterError } = await supabase
      .from('towns')
      .select('id, geographic_features_actual, vegetation_type_actual')
      .not('geographic_features_actual', 'is', null)
      .limit(10);

    if (afterError) {
      console.error('❌ Error in final check:', afterError.message);
    } else {
      console.log('Sample data AFTER normalization:');
      afterData.forEach(town => {
        console.log(`  Town ${town.id}: geo="${town.geographic_features_actual}" veg="${town.vegetation_type_actual}"`);
      });
    }

    console.log('\n🎉 NORMALIZATION COMPLETE!');
    console.log(`📈 Summary:`);
    console.log(`   Geographic features updated: ${geoUpdated} records`);
    console.log(`   Vegetation types updated: ${vegUpdated} records`);
    console.log(`   Total updates: ${geoUpdated + vegUpdated} records`);
    console.log('\n🔒 The 40-hour case sensitivity bug should now be FIXED!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the normalization
normalizeFields().catch(console.error);