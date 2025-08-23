#!/usr/bin/env node

/**
 * Check current state of geographic_features_actual and vegetation_type_actual
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkMissingData() {
  console.log('🔍 Checking towns with missing geographic_features_actual and vegetation_type_actual...\n');
  
  try {
    // Get towns with missing data
    const { data: missingTowns, error } = await supabase
      .from('towns')
      .select(`
        id, name, country, region, climate, 
        water_bodies, elevation_meters, distance_to_ocean_km, 
        latitude, longitude, regions,
        geographic_features_actual, vegetation_type_actual
      `)
      .or('geographic_features_actual.is.null,vegetation_type_actual.is.null')
      .order('country')
      .order('name');

    if (error) {
      console.error('❌ Error fetching towns:', error);
      return;
    }

    console.log(`📊 Found ${missingTowns.length} towns with missing data:\n`);
    console.log('=' .repeat(120));
    console.log('Country'.padEnd(15) + 'Name'.padEnd(25) + 'Climate'.padEnd(15) + 'Water Bodies'.padEnd(20) + 'Elevation'.padEnd(10) + 'Ocean Dist'.padEnd(12) + 'Geo Features'.padEnd(15) + 'Vegetation');
    console.log('=' .repeat(120));
    
    let geoMissing = 0;
    let vegMissing = 0;
    let bothMissing = 0;
    
    missingTowns.forEach(town => {
      const hasGeo = town.geographic_features_actual !== null;
      const hasVeg = town.vegetation_type_actual !== null;
      
      if (!hasGeo && !hasVeg) bothMissing++;
      else if (!hasGeo) geoMissing++;
      else if (!hasVeg) vegMissing++;
      
      console.log(
        (town.country || 'N/A').padEnd(15) +
        (town.name || 'N/A').padEnd(25) +
        (town.climate || 'N/A').padEnd(15) +
        (town.water_bodies ? town.water_bodies.toString() : 'N/A').padEnd(20) +
        (town.elevation_meters !== null ? town.elevation_meters.toString() : 'N/A').padEnd(10) +
        (town.distance_to_ocean_km !== null ? town.distance_to_ocean_km.toString() : 'N/A').padEnd(12) +
        (town.geographic_features_actual || 'NULL').padEnd(15) +
        (town.vegetation_type_actual || 'NULL')
      );
    });
    
    console.log('=' .repeat(120));
    console.log(`📈 Summary:`);
    console.log(`   - Both missing: ${bothMissing} towns`);
    console.log(`   - Only geo missing: ${geoMissing} towns`);
    console.log(`   - Only vegetation missing: ${vegMissing} towns`);
    console.log(`   - Total needing updates: ${missingTowns.length} towns`);
    
    // Show sample data for inference patterns
    console.log('\n🧠 Sample data patterns for inference:');
    console.log('=' .repeat(80));
    
    const samples = missingTowns.slice(0, 5);
    samples.forEach(town => {
      console.log(`\n🏘️  ${town.name}, ${town.country}`);
      console.log(`   Climate: ${town.climate}`);
      console.log(`   Water bodies: ${town.water_bodies}`);
      console.log(`   Elevation: ${town.elevation_meters}m`);
      console.log(`   Distance to ocean: ${town.distance_to_ocean_km}km`);
      console.log(`   Latitude: ${town.latitude}`);
      console.log(`   Regions: ${town.regions}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkMissingData().catch(console.error);