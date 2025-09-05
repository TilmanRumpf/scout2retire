#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * REAL distinctive hobbies from our database
 * Organized by what makes a town unique
 */
const DISTINCTIVE_HOBBIES = {
  // WATER SPORTS (Coastal/Lake towns)
  water_sports: [
    'Sailing', 'Surfing', 'Windsurfing', 'Kitesurfing', 'Stand-up Paddleboarding',
    'Kayaking', 'Canoeing', 'Water Skiing', 'Jet Skiing', 'Scuba Diving',
    'Snorkeling', 'Deep Sea Fishing', 'Fishing', 'Swimming', 'Swimming Laps',
    'Water Aerobics', 'Boating'
  ],
  
  // WINTER SPORTS (Mountain/Cold climate)
  winter_sports: [
    'Downhill Skiing', 'Cross-country Skiing', 'Snowboarding', 'Snowshoeing',
    'Ice Skating', 'Ice Fishing', 'Sledding', 'Snowmobiling', 'Curling'
  ],
  
  // MOUNTAIN/ADVENTURE (Elevation)
  mountain_adventure: [
    'Mountain Biking', 'Rock Climbing', 'Paragliding', 'Orienteering',
    'Horseback Riding', 'Hot Air Ballooning'
  ],
  
  // RACQUET SPORTS (Infrastructure dependent)
  racquet_sports: [
    'Tennis', 'Pickleball', 'Badminton'
  ],
  
  // GOLF (Course dependent)
  golf: ['Golf'],
  
  // CULTURAL/URBAN (Cities)
  cultural_urban: [
    'Museums', 'Theater', 'Community Theater', 'Ballet', 'Art Fairs',
    'Street Festivals', 'Cultural Festivals', 'Food Tours'
  ],
  
  // WELLNESS/FITNESS (Urban/Resort areas)
  wellness_fitness: [
    'Spa & Wellness', 'Pilates', 'Zumba', 'Fitness Classes', 'Martial Arts',
    'Water Aerobics'
  ],
  
  // SOCIAL/ENTERTAINMENT
  social_entertainment: [
    'Ballroom Dancing', 'Dancing', 'Bowling', 'Choir Singing'
  ],
  
  // MARKETS/SHOPPING (Urban/Tourist)
  markets: [
    'Farmers Markets', 'Flea Markets'
  ],
  
  // WINE/AGRICULTURE (Wine regions)
  wine_agriculture: [
    'Wine', 'Vineyards', 'Beekeeping'
  ],
  
  // CRAFTS (Artsy communities)
  crafts: [
    'Pottery', 'Sculpting'
  ],
  
  // UNIQUE/NICHE
  unique: [
    'Metal Detecting', 'Racing', 'Historical Sites', 'Wildlife Photography',
    'Bible Study', 'Fencing', 'Basketball'
  ]
};

/**
 * Research and assign distinctive hobbies based on real town data
 */
function assignDistinctiveHobbies(town, validHobbies) {
  const selected = new Set();
  
  // COASTAL TOWNS - Water activities are primary differentiator
  if (town.distance_to_ocean_km === 0) {
    // Major water sports for ocean towns
    tryAdd(selected, 'Sailing', validHobbies);
    tryAdd(selected, 'Surfing', validHobbies);
    tryAdd(selected, 'Scuba Diving', validHobbies);
    
    // Marina-based activities
    if (town.marinas_count > 0) {
      tryAdd(selected, 'Boating', validHobbies);
      tryAdd(selected, 'Deep Sea Fishing', validHobbies);
      tryAdd(selected, 'Jet Skiing', validHobbies);
    }
    
    // Beach sports
    tryAdd(selected, 'Stand-up Paddleboarding', validHobbies);
    tryAdd(selected, 'Kayaking', validHobbies);
    tryAdd(selected, 'Snorkeling', validHobbies);
    
    // Wind sports for specific coasts
    if (town.country === 'Spain' || town.country === 'Portugal') {
      tryAdd(selected, 'Windsurfing', validHobbies);
      tryAdd(selected, 'Kitesurfing', validHobbies);
    }
  }
  
  // LAKE TOWNS
  if (town.distance_to_water_km === 0 && town.distance_to_ocean_km > 0) {
    tryAdd(selected, 'Kayaking', validHobbies);
    tryAdd(selected, 'Canoeing', validHobbies);
    tryAdd(selected, 'Fishing', validHobbies);
    tryAdd(selected, 'Water Skiing', validHobbies);
    tryAdd(selected, 'Swimming', validHobbies);
  }
  
  // MOUNTAIN TOWNS - Winter and adventure sports
  if (town.elevation_meters > 800 || town.ski_resorts_count > 0) {
    tryAdd(selected, 'Downhill Skiing', validHobbies);
    tryAdd(selected, 'Snowboarding', validHobbies);
    tryAdd(selected, 'Cross-country Skiing', validHobbies);
    tryAdd(selected, 'Snowshoeing', validHobbies);
    
    // Summer mountain activities
    tryAdd(selected, 'Mountain Biking', validHobbies);
    tryAdd(selected, 'Rock Climbing', validHobbies);
    tryAdd(selected, 'Paragliding', validHobbies);
  }
  
  // GOLF DESTINATIONS
  if (town.golf_courses_count > 0) {
    tryAdd(selected, 'Golf', validHobbies);
    
    // Golf towns often have other upscale sports
    if (town.golf_courses_count > 2) {
      tryAdd(selected, 'Tennis', validHobbies);
    }
  }
  
  // TENNIS/RACQUET SPORTS
  if (town.tennis_courts_count > 0) {
    tryAdd(selected, 'Tennis', validHobbies);
    tryAdd(selected, 'Pickleball', validHobbies); // Growing in popularity
  }
  
  // URBAN CENTERS - Cultural activities
  if (town.population >= 100000 || town.distance_to_urban_center === 0) {
    tryAdd(selected, 'Museums', validHobbies);
    tryAdd(selected, 'Theater', validHobbies);
    tryAdd(selected, 'Food Tours', validHobbies);
    tryAdd(selected, 'Cultural Festivals', validHobbies);
    
    // Large cities have more options
    if (town.population >= 500000) {
      tryAdd(selected, 'Ballet', validHobbies);
      tryAdd(selected, 'Art Fairs', validHobbies);
      tryAdd(selected, 'Street Festivals', validHobbies);
    }
  }
  
  // WINE REGIONS
  const wineRegions = {
    'France': ['Bordeaux', 'Lyon', 'Nice'],
    'Italy': ['Florence', 'Rome', 'Venice'],
    'Spain': ['La Rioja', 'Barcelona', 'Valencia'],
    'Portugal': ['Porto', 'Lisbon', 'Douro Valley']
  };
  
  if (wineRegions[town.country]?.some(region => town.name.includes(region))) {
    tryAdd(selected, 'Wine', validHobbies);
    tryAdd(selected, 'Vineyards', validHobbies);
  }
  
  // WELLNESS/SPA TOWNS
  if (town.name.toLowerCase().includes('bath') || town.name.toLowerCase().includes('spa') ||
      town.geographic_features_actual?.includes('hot springs')) {
    tryAdd(selected, 'Spa & Wellness', validHobbies);
  }
  
  // FITNESS-FOCUSED (Urban and resort areas)
  if (town.population > 50000 || town.distance_to_ocean_km === 0) {
    tryAdd(selected, 'Fitness Classes', validHobbies);
    tryAdd(selected, 'Pilates', validHobbies);
    
    // Beach towns often have water fitness
    if (town.distance_to_ocean_km === 0) {
      tryAdd(selected, 'Water Aerobics', validHobbies);
    }
  }
  
  // MARKETS (Tourist and local culture)
  if (town.population > 20000) {
    tryAdd(selected, 'Farmers Markets', validHobbies);
    
    // Tourist areas have flea markets
    if (town.distance_to_ocean_km === 0 || town.population > 100000) {
      tryAdd(selected, 'Flea Markets', validHobbies);
    }
  }
  
  // Limit to 10 most relevant
  return Array.from(selected).slice(0, 10);
}

/**
 * Helper to add hobby if valid
 */
function tryAdd(set, hobby, validHobbies) {
  if (validHobbies.has(hobby)) {
    set.add(hobby);
  }
}

/**
 * Process a batch of towns
 */
async function processBatch(batchNumber, offset = 0) {
  console.log(`\n📦 BATCH ${batchNumber}: Processing towns ${offset + 1}-${offset + 30}\n`);
  
  // Get valid distinctive hobbies
  const { data: hobbies } = await supabase
    .from('hobbies')
    .select('name')
    .eq('is_universal', false);
  
  const validHobbies = new Set(hobbies.map(h => h.name));
  console.log(`Loaded ${validHobbies.size} distinctive hobbies\n`);
  
  // Get batch of towns
  const { data: towns } = await supabase
    .from('towns')
    .select('*')
    .order('population', { ascending: false })
    .range(offset, offset + 29);
  
  if (!towns || towns.length === 0) {
    console.log('No more towns to process');
    return 0;
  }
  
  let updated = 0;
  for (const town of towns) {
    const distinctiveHobbies = assignDistinctiveHobbies(town, validHobbies);
    
    if (distinctiveHobbies.length > 0) {
      const { error } = await supabase
        .from('towns')
        .update({ top_hobbies: distinctiveHobbies })
        .eq('id', town.id);
      
      if (!error) {
        console.log(`✅ ${town.name}, ${town.country}`);
        
        // Show relevant characteristics
        const features = [];
        if (town.distance_to_ocean_km === 0) features.push('Coastal');
        if (town.elevation_meters > 800) features.push(`${town.elevation_meters}m elevation`);
        if (town.golf_courses_count > 0) features.push(`${town.golf_courses_count} golf courses`);
        if (town.population >= 100000) features.push('Urban center');
        
        console.log(`   ${features.join(', ')}`);
        console.log(`   → ${distinctiveHobbies.join(', ')}\n`);
        updated++;
      }
    } else {
      console.log(`⚠️  ${town.name} - No distinctive hobbies found\n`);
    }
  }
  
  return updated;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 POPULATING DISTINCTIVE HOBBIES (NO UNIVERSALS)\n');
  console.log('Only location-specific, infrastructure-dependent activities\n');
  
  // Process first batch
  const batch = 1;
  const offset = 0; // Start from beginning
  
  const updated = await processBatch(batch, offset);
  
  console.log(`📊 SUMMARY: Updated ${updated} towns with distinctive hobbies`);
  console.log('\nTo continue, run with next offset (30, 60, 90, etc.)');
}

// Run the script
main().catch(console.error);