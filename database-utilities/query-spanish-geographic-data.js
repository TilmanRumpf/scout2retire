#!/usr/bin/env node

/**
 * Query Spanish town data to examine geographic features structure
 * Requested query: SELECT name, country, region, regions, geo_region, geographic_features_actual, vegetation_type_actual 
 * FROM towns WHERE country = 'Spain' LIMIT 5
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function querySpanishGeographicData() {
  console.log('🇪🇸 Querying Spanish town geographic data structure...\n');
  
  try {
    // Execute the requested query
    const { data: spanishTowns, error } = await supabase
      .from('towns')
      .select('town_name, country, region, regions, geo_region, geographic_features_actual, vegetation_type_actual')
      .eq('country', 'Spain')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching Spanish towns:', error);
      return;
    }

    if (!spanishTowns || spanishTowns.length === 0) {
      console.log('❌ No Spanish towns found in database');
      return;
    }

    console.log(`📊 Found ${spanishTowns.length} Spanish towns. Data structure analysis:\n`);
    console.log('=' .repeat(80));

    spanishTowns.forEach((town, index) => {
      console.log(`\n${index + 1}. ${town.town_name}`);
      console.log('   Basic Info:');
      console.log(`   - country: "${town.country}"`);
      console.log(`   - region: "${town.region}"`);
      
      console.log('   Geographic Classification:');
      console.log(`   - geo_region: ${town.geo_region ? `"${town.geo_region}"` : 'NULL'}`);
      
      console.log('   Arrays:');
      console.log(`   - regions: ${town.regions ? JSON.stringify(town.regions) : 'NULL'}`);
      console.log(`   - geographic_features_actual: ${town.geographic_features_actual ? JSON.stringify(town.geographic_features_actual) : 'NULL'}`);
      console.log(`   - vegetation_type_actual: ${town.vegetation_type_actual ? JSON.stringify(town.vegetation_type_actual) : 'NULL'}`);
    });

    console.log('\n' + '=' .repeat(80));
    console.log('📋 DATA STRUCTURE SUMMARY:');
    console.log('=' .repeat(80));

    // Analyze geographic_features_actual values
    const allGeoFeatures = new Set();
    const allVegTypes = new Set();
    
    spanishTowns.forEach(town => {
      if (town.geographic_features_actual && Array.isArray(town.geographic_features_actual)) {
        town.geographic_features_actual.forEach(feature => allGeoFeatures.add(feature));
      }
      if (town.vegetation_type_actual && Array.isArray(town.vegetation_type_actual)) {
        town.vegetation_type_actual.forEach(vegType => allVegTypes.add(vegType));
      }
    });

    console.log(`\n📍 geographic_features_actual field:`);
    console.log(`   - Type: Array of strings`);
    console.log(`   - Values found: ${allGeoFeatures.size > 0 ? Array.from(allGeoFeatures).join(', ') : 'None'}`);
    console.log(`   - Towns with data: ${spanishTowns.filter(t => t.geographic_features_actual?.length).length}/${spanishTowns.length}`);

    console.log(`\n🌿 vegetation_type_actual field:`);
    console.log(`   - Type: Array of strings`);
    console.log(`   - Values found: ${allVegTypes.size > 0 ? Array.from(allVegTypes).join(', ') : 'None'}`);
    console.log(`   - Towns with data: ${spanishTowns.filter(t => t.vegetation_type_actual?.length).length}/${spanishTowns.length}`);

    console.log(`\n🏞️ regions field:`);
    console.log(`   - Type: Array of strings`);
    console.log(`   - Used for: Political/geographic classifications`);
    console.log(`   - Towns with data: ${spanishTowns.filter(t => t.regions?.length).length}/${spanishTowns.length}`);

    console.log(`\n🌍 geo_region field:`);
    console.log(`   - Type: String (comma-separated values)`);
    console.log(`   - Used for: Broader regional classifications`);
    console.log(`   - Towns with data: ${spanishTowns.filter(t => t.geo_region).length}/${spanishTowns.length}`);

    console.log('\n✅ Query completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Execute the query
querySpanishGeographicData().catch(console.error);