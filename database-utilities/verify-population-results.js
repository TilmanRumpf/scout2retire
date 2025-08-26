#!/usr/bin/env node

/**
 * Verify the results of geographic_features_actual and vegetation_type_actual population
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function verifyResults() {
  console.log('🔍 Verifying populated geographic_features_actual and vegetation_type_actual...\n');
  
  try {
    // Get a sample of towns to verify data quality
    const { data: sampleTowns, error } = await supabase
      .from('towns')
      .select(`
        id, name, country, climate, 
        water_bodies, elevation_meters, distance_to_ocean_km, 
        geographic_features_actual, vegetation_type_actual
      `)
      .not('geographic_features_actual', 'is', null)
      .not('vegetation_type_actual', 'is', null)
      .order('country')
      .limit(20);

    if (error) {
      console.error('❌ Error fetching sample:', error);
      return;
    }

    console.log(`📊 Sample of populated towns (${sampleTowns.length} shown):\n`);
    console.log('=' .repeat(120));
    console.log('Country'.padEnd(15) + 'Name'.padEnd(25) + 'Climate'.padEnd(15) + 'Geographic Features'.padEnd(35) + 'Vegetation Type');
    console.log('=' .repeat(120));
    
    sampleTowns.forEach(town => {
      console.log(
        (town.country || 'N/A').padEnd(15) +
        (town.name || 'N/A').padEnd(25) +
        (town.climate || 'N/A').padEnd(15) +
        (town.geographic_features_actual ? `[${town.geographic_features_actual.join(', ')}]` : 'NULL').padEnd(35) +
        (town.vegetation_type_actual ? `[${town.vegetation_type_actual.join(', ')}]` : 'NULL')
      );
    });
    
    // Get summary statistics
    console.log('\n' + '=' .repeat(120));
    console.log('📈 Population Statistics:\n');
    
    const { data: totalStats, error: statsError } = await supabase
      .from('towns')
      .select('id, geographic_features_actual, vegetation_type_actual');
      
    if (statsError) {
      console.error('❌ Error fetching statistics:', statsError);
      return;
    }
    
    const total = totalStats.length;
    const withGeo = totalStats.filter(t => t.geographic_features_actual !== null).length;
    const withVeg = totalStats.filter(t => t.vegetation_type_actual !== null).length;
    const withBoth = totalStats.filter(t => t.geographic_features_actual !== null && t.vegetation_type_actual !== null).length;
    
    console.log(`✅ Total towns: ${total}`);
    console.log(`✅ Towns with geographic features: ${withGeo} (${((withGeo/total)*100).toFixed(1)}%)`);
    console.log(`✅ Towns with vegetation data: ${withVeg} (${((withVeg/total)*100).toFixed(1)}%)`);
    console.log(`✅ Towns with both populated: ${withBoth} (${((withBoth/total)*100).toFixed(1)}%)`);
    
    if (withBoth === total) {
      console.log('\n🎉 SUCCESS: All towns now have both geographic_features_actual and vegetation_type_actual populated!');
    } else {
      console.log(`\n⚠️  ${total - withBoth} towns still need attention`);
    }
    
    // Show some interesting examples by climate type
    console.log('\n🌍 Examples by Climate Type:\n');
    
    const climateTypes = ['tropical', 'mediterranean', 'temperate', 'desert', 'subtropical'];
    
    for (const climate of climateTypes) {
      const { data: climateExamples, error: climateError } = await supabase
        .from('towns')
        .select('name, country, geographic_features_actual, vegetation_type_actual')
        .ilike('climate', climate)
        .not('geographic_features_actual', 'is', null)
        .limit(2);
        
      if (!climateError && climateExamples.length > 0) {
        console.log(`🌤️  ${climate.toUpperCase()} Climate Examples:`);
        climateExamples.forEach(town => {
          console.log(`   ${town.name}, ${town.country}`);
          console.log(`      🏔️  Geographic: [${town.geographic_features_actual.join(', ')}]`);
          console.log(`      🌿 Vegetation: [${town.vegetation_type_actual.join(', ')}]`);
        });
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the verification
verifyResults().catch(console.error);