#!/usr/bin/env node

/**
 * Smart Population of geographic_features_actual and vegetation_type_actual
 * 
 * Uses intelligent inference based on existing data:
 * - water_bodies: Infer coastal/lake/river features
 * - elevation_meters: Infer mountain/valley/plains features  
 * - distance_to_ocean_km: Reinforce coastal features
 * - climate + latitude: Infer appropriate vegetation
 * - country/region: Apply regional vegetation patterns
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

/**
 * Infer geographic features based on available data
 */
function inferGeographicFeatures(town) {
  const features = [];
  
  // Water body analysis
  if (town.water_bodies) {
    const waterBodies = town.water_bodies.toString().toLowerCase();
    
    // Coastal features
    if (waterBodies.includes('ocean') || waterBodies.includes('sea') || waterBodies.includes('strait') || waterBodies.includes('bay') || waterBodies.includes('gulf') || waterBodies.includes('harbor') || waterBodies.includes('harbour')) {
      features.push('Coastal Plains');
      if (town.distance_to_ocean_km === 0) {
        features.push('Beaches');
      }
    }
    
    // Lake features
    if (waterBodies.includes('lake') || waterBodies.includes('lagoon')) {
      features.push('Lakes');
    }
    
    // River features
    if (waterBodies.includes('river') || waterBodies.includes('creek') || waterBodies.includes('canal')) {
      features.push('Rivers');
    }
    
    // Island features
    if (waterBodies.includes('island') || waterBodies.includes('atoll') || waterBodies.includes('caye')) {
      features.push('Islands');
    }
  }
  
  // Elevation analysis
  if (town.elevation_meters !== null && town.elevation_meters !== undefined) {
    const elevation = parseFloat(town.elevation_meters);
    
    if (elevation < 100) {
      features.push('Plains');
    } else if (elevation >= 100 && elevation < 500) {
      features.push('Hills');
    } else if (elevation >= 500 && elevation < 1500) {
      features.push('Mountains');
    } else if (elevation >= 1500) {
      features.push('High Mountains');
    }
  }
  
  // Distance to ocean reinforcement
  if (town.distance_to_ocean_km !== null && town.distance_to_ocean_km !== undefined) {
    const distance = parseFloat(town.distance_to_ocean_km);
    if (distance === 0 && !features.includes('Coastal Plains')) {
      features.push('Coastal Plains');
    }
  }
  
  // Climate-based geographic features
  if (town.climate) {
    const climate = town.climate.toLowerCase();
    if (climate.includes('desert')) {
      features.push('Desert');
    }
    if (climate.includes('tropical') && (town.water_bodies && town.water_bodies.toString().toLowerCase().includes('ocean'))) {
      features.push('Tropical Coastline');
    }
  }
  
  // Default fallback
  if (features.length === 0) {
    features.push('Plains');
  }
  
  return features; // Return as array
}

/**
 * Infer vegetation type based on climate, location, and elevation
 */
function inferVegetationType(town) {
  const vegetation = [];
  
  // Climate-based vegetation
  if (town.climate) {
    const climate = town.climate.toLowerCase();
    
    switch (climate) {
      case 'tropical':
        if (town.elevation_meters && town.elevation_meters > 1000) {
          vegetation.push('Tropical Highlands');
        } else {
          vegetation.push('Tropical Vegetation');
        }
        break;
        
      case 'subtropical':
        vegetation.push('Subtropical Vegetation');
        break;
        
      case 'mediterranean':
        vegetation.push('Mediterranean Vegetation');
        break;
        
      case 'temperate':
        if (town.elevation_meters && town.elevation_meters > 800) {
          vegetation.push('Mountain Forests');
        } else {
          vegetation.push('Temperate Forests');
        }
        break;
        
      case 'continental':
        vegetation.push('Mixed Forests');
        break;
        
      case 'desert':
        vegetation.push('Desert Vegetation');
        break;
        
      default:
        // Fallback based on latitude if available
        if (town.latitude) {
          const lat = Math.abs(parseFloat(town.latitude));
          if (lat < 23.5) vegetation.push('Tropical Vegetation');
          else if (lat < 35) vegetation.push('Subtropical Vegetation');
          else if (lat < 50) vegetation.push('Temperate Forests');
          else vegetation.push('Mixed Forests');
        }
    }
  }
  
  // Country/region specific adjustments
  if (town.country) {
    const country = town.country;
    
    // Mediterranean countries
    if (['Spain', 'Italy', 'Greece', 'Portugal', 'France', 'Croatia', 'Cyprus', 'Malta'].includes(country)) {
      if (!vegetation.some(v => v.includes('Mediterranean'))) {
        vegetation.push('Mediterranean Vegetation');
      }
    }
    
    // Tropical island nations
    if (['Fiji', 'Cook Islands', 'French Polynesia', 'Samoa', 'Palau', 'Marshall Islands', 'Micronesia', 'Solomon Islands'].includes(country)) {
      vegetation.push('Tropical Vegetation');
    }
    
    // Desert countries
    if (['Egypt', 'Namibia'].includes(country)) {
      vegetation.push('Desert Vegetation');
    }
    
    // Northern temperate countries
    if (['Canada', 'Iceland', 'Estonia', 'Latvia'].includes(country)) {
      vegetation.push('Northern Forests');
    }
  }
  
  // Elevation adjustments
  if (town.elevation_meters && town.elevation_meters > 1500) {
    vegetation.push('Alpine Vegetation');
  }
  
  // Coastal adjustments
  if (town.distance_to_ocean_km === 0 || (town.water_bodies && town.water_bodies.toString().toLowerCase().includes('ocean'))) {
    if (town.climate && town.climate.toLowerCase() === 'tropical') {
      vegetation.push('Coastal Tropical');
    } else if (town.climate && town.climate.toLowerCase() === 'mediterranean') {
      vegetation.push('Coastal Mediterranean');
    }
  }
  
  // Default fallback
  if (vegetation.length === 0) {
    if (town.latitude) {
      const lat = Math.abs(parseFloat(town.latitude));
      if (lat < 35) vegetation.push('Subtropical Vegetation');
      else vegetation.push('Temperate Forests');
    } else {
      vegetation.push('Mixed Vegetation');
    }
  }
  
  return vegetation; // Return as array
}

async function populateGeographicAndVegetation() {
  console.log('🌍 Starting intelligent population of geographic_features_actual and vegetation_type_actual...\n');
  
  try {
    // Get towns with missing data
    const { data: missingTowns, error: fetchError } = await supabase
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

    if (fetchError) {
      console.error('❌ Error fetching towns:', fetchError);
      return;
    }

    console.log(`📊 Found ${missingTowns.length} towns needing updates\n`);
    
    let updated = 0;
    let errors = 0;
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < missingTowns.length; i += batchSize) {
      const batch = missingTowns.slice(i, i + batchSize);
      
      console.log(`\n🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(missingTowns.length/batchSize)}`);
      console.log('=' .repeat(80));
      
      for (const town of batch) {
        try {
          const updates = {};
          
          // Generate geographic features if missing
          if (!town.geographic_features_actual) {
            updates.geographic_features_actual = inferGeographicFeatures(town);
          }
          
          // Generate vegetation type if missing  
          if (!town.vegetation_type_actual) {
            updates.vegetation_type_actual = inferVegetationType(town);
          }
          
          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('towns')
              .update(updates)
              .eq('id', town.id);
            
            if (updateError) {
              console.error(`❌ Error updating ${town.name}:`, updateError.message);
              errors++;
            } else {
              console.log(`✅ ${town.name}, ${town.country}`);
              if (updates.geographic_features_actual) {
                console.log(`   🏔️  Geographic: [${updates.geographic_features_actual.join(', ')}]`);
              }
              if (updates.vegetation_type_actual) {
                console.log(`   🌿 Vegetation: [${updates.vegetation_type_actual.join(', ')}]`);
              }
              updated++;
            }
          } else {
            console.log(`ℹ️  ${town.name} - already has data`);
          }
          
          // Small delay to be gentle on the API
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Unexpected error updating ${town.name}:`, error.message);
          errors++;
        }
      }
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log(`📈 Population Summary:`);
    console.log(`   ✅ Successfully updated: ${updated} towns`);
    console.log(`   ❌ Errors: ${errors} towns`);
    console.log(`   📊 Success rate: ${((updated / (updated + errors)) * 100).toFixed(1)}%`);
    
    // Verification check
    console.log('\n🔍 Verifying results...');
    const { data: verifyTowns, error: verifyError } = await supabase
      .from('towns')
      .select('id, name, country, geographic_features_actual, vegetation_type_actual')
      .or('geographic_features_actual.is.null,vegetation_type_actual.is.null');
    
    if (verifyError) {
      console.error('❌ Error in verification:', verifyError);
    } else {
      console.log(`📊 Remaining towns with missing data: ${verifyTowns.length}`);
      
      if (verifyTowns.length > 0) {
        console.log('\n⚠️  Towns still missing data:');
        verifyTowns.slice(0, 5).forEach(town => {
          console.log(`   ${town.name}, ${town.country} - Geo: ${town.geographic_features_actual || 'NULL'}, Veg: ${town.vegetation_type_actual || 'NULL'}`);
        });
        if (verifyTowns.length > 5) {
          console.log(`   ... and ${verifyTowns.length - 5} more`);
        }
      } else {
        console.log('🎉 All towns now have geographic and vegetation data!');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('\n✅ Population script completed!');
}

// Run the population
populateGeographicAndVegetation().catch(console.error);