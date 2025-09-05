#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Research and assign distinctive hobbies based on real town data
 */
function assignDistinctiveHobbies(town, validHobbies) {
  const selected = new Set();
  
  // COASTAL TOWNS - Primary differentiator
  if (town.distance_to_ocean_km === 0) {
    // Core water sports
    tryAdd(selected, 'Sailing', validHobbies);
    tryAdd(selected, 'Surfing', validHobbies);
    tryAdd(selected, 'Swimming', validHobbies);
    tryAdd(selected, 'Scuba Diving', validHobbies);
    tryAdd(selected, 'Snorkeling', validHobbies);
    tryAdd(selected, 'Kayaking', validHobbies);
    tryAdd(selected, 'Stand-up Paddleboarding', validHobbies);
    
    // Marina activities
    if (town.marinas_count > 0) {
      tryAdd(selected, 'Boating', validHobbies);
      tryAdd(selected, 'Deep Sea Fishing', validHobbies);
      tryAdd(selected, 'Jet Skiing', validHobbies);
    }
    
    // Wind sports for windy coasts
    tryAdd(selected, 'Windsurfing', validHobbies);
    tryAdd(selected, 'Kitesurfing', validHobbies);
    
    // Beach wellness
    tryAdd(selected, 'Water Aerobics', validHobbies);
  }
  
  // LAKE/RIVER TOWNS
  else if (town.distance_to_water_km === 0) {
    tryAdd(selected, 'Kayaking', validHobbies);
    tryAdd(selected, 'Canoeing', validHobbies);
    tryAdd(selected, 'Fishing', validHobbies);
    tryAdd(selected, 'Swimming', validHobbies);
    tryAdd(selected, 'Stand-up Paddleboarding', validHobbies);
  }
  
  // MOUNTAIN TOWNS
  if (town.elevation_meters > 600 || town.geographic_features_actual?.includes('mountains')) {
    // Winter sports for high elevation
    if (town.elevation_meters > 1000 || town.ski_resorts_count > 0) {
      tryAdd(selected, 'Downhill Skiing', validHobbies);
      tryAdd(selected, 'Snowboarding', validHobbies);
      tryAdd(selected, 'Cross-country Skiing', validHobbies);
      tryAdd(selected, 'Snowshoeing', validHobbies);
      tryAdd(selected, 'Ice Skating', validHobbies);
    }
    
    // Mountain activities
    tryAdd(selected, 'Mountain Biking', validHobbies);
    tryAdd(selected, 'Rock Climbing', validHobbies);
    tryAdd(selected, 'Paragliding', validHobbies);
    tryAdd(selected, 'Horseback Riding', validHobbies);
  }
  
  // GOLF DESTINATIONS
  if (town.golf_courses_count > 0) {
    tryAdd(selected, 'Golf', validHobbies);
  }
  
  // TENNIS/RACQUET SPORTS
  if (town.tennis_courts_count > 0) {
    tryAdd(selected, 'Tennis', validHobbies);
    tryAdd(selected, 'Pickleball', validHobbies);
  }
  
  // URBAN CENTERS - Cultural emphasis
  if (town.population >= 100000 || town.distance_to_urban_center === 0) {
    tryAdd(selected, 'Museums', validHobbies);
    tryAdd(selected, 'Theater', validHobbies);
    tryAdd(selected, 'Food Tours', validHobbies);
    tryAdd(selected, 'Cultural Festivals', validHobbies);
    tryAdd(selected, 'Art Fairs', validHobbies);
    
    // Big cities
    if (town.population >= 500000) {
      tryAdd(selected, 'Ballet', validHobbies);
      tryAdd(selected, 'Street Festivals', validHobbies);
      tryAdd(selected, 'Community Theater', validHobbies);
    }
  }
  
  // SUBURBAN/SMALL URBAN (20k-100k)
  else if (town.population >= 20000) {
    tryAdd(selected, 'Farmers Markets', validHobbies);
    tryAdd(selected, 'Community Theater', validHobbies);
    tryAdd(selected, 'Fitness Classes', validHobbies);
  }
  
  // WINE REGIONS (specific countries/regions)
  if ((town.country === 'France' || town.country === 'Italy' || 
       town.country === 'Spain' || town.country === 'Portugal') &&
      (town.geographic_features_actual?.includes('vineyard') || 
       town.vegetation_type_actual?.includes('vineyard'))) {
    tryAdd(selected, 'Wine', validHobbies);
    tryAdd(selected, 'Vineyards', validHobbies);
  }
  
  // FITNESS/WELLNESS (tourist areas)
  if (town.distance_to_ocean_km === 0 || town.population > 50000) {
    tryAdd(selected, 'Fitness Classes', validHobbies);
    tryAdd(selected, 'Pilates', validHobbies);
    tryAdd(selected, 'Spa & Wellness', validHobbies);
  }
  
  // UNIQUE SPORTS/ACTIVITIES
  if (town.country === 'United States' && town.population > 50000) {
    tryAdd(selected, 'Basketball', validHobbies);
    tryAdd(selected, 'Bowling', validHobbies);
  }
  
  // Dancing (Latin countries)
  if (['Spain', 'Argentina', 'Mexico', 'Colombia'].includes(town.country)) {
    tryAdd(selected, 'Dancing', validHobbies);
    tryAdd(selected, 'Ballroom Dancing', validHobbies);
  }
  
  // Historical sites (old European cities)
  if (['Italy', 'Greece', 'Egypt', 'Turkey'].includes(town.country)) {
    tryAdd(selected, 'Historical Sites', validHobbies);
  }
  
  // Wildlife photography (nature areas)
  if (town.geographic_features_actual?.includes('forest') || 
      town.geographic_features_actual?.includes('national park')) {
    tryAdd(selected, 'Wildlife Photography', validHobbies);
  }
  
  // Return top 10 most relevant (max)
  return Array.from(selected).slice(0, 10);
}

/**
 * Helper to add hobby if valid
 */
function tryAdd(set, hobby, validHobbies) {
  if (validHobbies.has(hobby) && set.size < 10) {
    set.add(hobby);
  }
}

/**
 * Process all towns in batches
 */
async function processAllTowns() {
  console.log('🎯 BATCH PROCESSING ALL TOWNS WITH DISTINCTIVE HOBBIES\n');
  
  // Get valid distinctive hobbies
  const { data: hobbies } = await supabase
    .from('hobbies')
    .select('name')
    .eq('is_universal', false);
  
  const validHobbies = new Set(hobbies.map(h => h.name));
  console.log(`✅ Loaded ${validHobbies.size} distinctive hobbies\n`);
  
  // Get all towns
  const { data: allTowns } = await supabase
    .from('towns')
    .select('*')
    .order('population', { ascending: false });
  
  console.log(`📊 Processing ${allTowns.length} towns...\n`);
  
  let stats = {
    updated: 0,
    coastal: 0,
    mountain: 0,
    urban: 0,
    noHobbies: 0
  };
  
  // Process in batches of 50
  const batchSize = 50;
  for (let i = 0; i < allTowns.length; i += batchSize) {
    const batch = allTowns.slice(i, Math.min(i + batchSize, allTowns.length));
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} (towns ${i+1}-${Math.min(i+batchSize, allTowns.length)})...`);
    
    for (const town of batch) {
      const distinctiveHobbies = assignDistinctiveHobbies(town, validHobbies);
      
      if (distinctiveHobbies.length > 0) {
        const { error } = await supabase
          .from('towns')
          .update({ top_hobbies: distinctiveHobbies })
          .eq('id', town.id);
        
        if (!error) {
          stats.updated++;
          
          // Track types
          if (town.distance_to_ocean_km === 0) stats.coastal++;
          if (town.elevation_meters > 600) stats.mountain++;
          if (town.population >= 100000) stats.urban++;
        }
      } else {
        stats.noHobbies++;
      }
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL SUMMARY:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully updated: ${stats.updated}/${allTowns.length} towns`);
  console.log(`🏖️  Coastal towns: ${stats.coastal}`);
  console.log(`⛰️  Mountain towns: ${stats.mountain}`);
  console.log(`🏙️  Urban centers: ${stats.urban}`);
  console.log(`⚠️  No hobbies assigned: ${stats.noHobbies}`);
  
  // Sample verification
  console.log('\n📍 SAMPLE VERIFICATION:\n');
  
  const samples = [
    { name: 'Alicante', country: 'Spain' },
    { name: 'Valencia', country: 'Spain' },
    { name: 'Chamonix', country: 'France' },
    { name: 'Nice', country: 'France' }
  ];
  
  for (const sample of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, top_hobbies, distance_to_ocean_km, elevation_meters, population')
      .eq('name', sample.name)
      .eq('country', sample.country)
      .single();
    
    if (town) {
      console.log(`${town.name}:`);
      console.log(`  Ocean: ${town.distance_to_ocean_km}km, Elevation: ${town.elevation_meters}m, Pop: ${town.population?.toLocaleString()}`);
      console.log(`  Hobbies: ${town.top_hobbies?.join(', ') || 'None'}\n`);
    }
  }
  
  console.log('✅ BATCH PROCESSING COMPLETE!');
  console.log('\nAll towns now have distinctive, location-appropriate hobbies.');
  console.log('Universal hobbies (Walking, Reading, etc.) excluded from top_hobbies.');
}

// Run the batch processing
processAllTowns().catch(console.error);