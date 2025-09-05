#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Priority towns to populate first
 * These are the most popular retirement destinations
 */
const PRIORITY_TOWNS = [
  // Spain - Top retirement destinations
  { name: 'Alicante', country: 'Spain' },
  { name: 'Valencia', country: 'Spain' },
  { name: 'Malaga', country: 'Spain' },
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Marbella', country: 'Spain' },
  { name: 'Palma', country: 'Spain' },
  { name: 'Seville', country: 'Spain' },
  { name: 'Granada', country: 'Spain' },
  
  // Portugal favorites
  { name: 'Lisbon', country: 'Portugal' },
  { name: 'Porto', country: 'Portugal' },
  { name: 'Lagos', country: 'Portugal' },
  { name: 'Cascais', country: 'Portugal' },
  
  // Italy classics
  { name: 'Rome', country: 'Italy' },
  { name: 'Florence', country: 'Italy' },
  { name: 'Venice', country: 'Italy' },
  
  // France
  { name: 'Nice', country: 'France' },
  { name: 'Paris', country: 'France' }
];

/**
 * Generate default hobbies based on town characteristics
 */
function generateDefaultHobbies(town) {
  const hobbies = new Set();
  
  // Universal hobbies that work everywhere
  const universal = ['walking', 'reading', 'cooking', 'gardening', 'photography'];
  universal.forEach(h => hobbies.add(h));
  
  // Coastal activities
  if (town.geographic_features_actual?.includes('coastal') || 
      town.distance_to_ocean_km < 5) {
    ['swimming', 'beach_walking', 'fishing', 'water_sports'].forEach(h => hobbies.add(h));
    if (town.marinas_count > 0) {
      hobbies.add('sailing');
      hobbies.add('boating');
    }
  }
  
  // Mountain activities
  if (town.geographic_features_actual?.includes('mountains') || 
      town.elevation_meters > 500) {
    ['hiking', 'nature_photography', 'bird_watching'].forEach(h => hobbies.add(h));
    if (town.hiking_trails_km > 0) {
      hobbies.add('trail_walking');
    }
  }
  
  // Urban activities (population > 50,000)
  if (town.population > 50000) {
    ['museums', 'dining', 'shopping', 'concerts', 'theater'].forEach(h => hobbies.add(h));
  }
  
  // Golf & Tennis (check specific infrastructure)
  if (town.golf_courses_count > 0) hobbies.add('golf');
  if (town.tennis_courts_count > 0) hobbies.add('tennis');
  
  // Cultural activities by country
  const culturalByCountry = {
    'Spain': ['tapas_tours', 'flamenco', 'spanish_classes'],
    'Italy': ['wine_tasting', 'art_galleries', 'italian_cooking'],
    'France': ['wine_tasting', 'markets', 'french_cuisine'],
    'Portugal': ['fado_music', 'port_wine', 'portuguese_tiles'],
    'Greece': ['ancient_sites', 'greek_cooking', 'island_hopping']
  };
  
  const cultural = culturalByCountry[town.country];
  if (cultural) {
    cultural.forEach(h => hobbies.add(h));
  }
  
  // Convert to array and limit to top 10
  return Array.from(hobbies).slice(0, 10);
}

/**
 * Curated hobby lists for specific popular towns
 * Based on real retiree activities
 */
const CURATED_HOBBIES = {
  'Alicante': ['golf', 'beach_walking', 'swimming', 'tennis', 'sailing', 
               'spanish_classes', 'hiking', 'cycling', 'markets', 'dining'],
  
  'Valencia': ['cycling', 'beach_walking', 'museums', 'markets', 'spanish_classes',
               'golf', 'tennis', 'sailing', 'paella_cooking', 'festivals'],
  
  'Malaga': ['beach_walking', 'golf', 'hiking', 'museums', 'tapas_tours',
             'swimming', 'spanish_classes', 'flamenco', 'markets', 'tennis'],
  
  'Barcelona': ['museums', 'beach_walking', 'architecture_tours', 'markets', 'dining',
                'hiking', 'cycling', 'catalan_culture', 'concerts', 'sailing'],
  
  'Lisbon': ['walking_tours', 'fado_music', 'museums', 'tram_rides', 'portuguese_classes',
             'markets', 'wine_tasting', 'day_trips', 'photography', 'dining'],
  
  'Porto': ['port_wine', 'walking_tours', 'photography', 'markets', 'river_cruises',
            'portuguese_tiles', 'cooking_classes', 'hiking', 'golf', 'museums'],
  
  'Rome': ['ancient_sites', 'museums', 'italian_classes', 'cooking_classes', 'markets',
           'walking_tours', 'art_galleries', 'opera', 'wine_tasting', 'dining'],
  
  'Nice': ['beach_walking', 'markets', 'french_classes', 'sailing', 'hiking',
           'art_galleries', 'cycling', 'swimming', 'day_trips', 'dining']
};

async function populateTopHobbies() {
  console.log('🎯 Populating top_hobbies for priority towns...\n');
  
  try {
    // Step 1: Process priority towns with curated data
    console.log('1. Updating priority towns with curated hobbies...\n');
    
    for (const priorityTown of PRIORITY_TOWNS) {
      const { data: town, error } = await supabase
        .from('towns')
        .select('*')
        .eq('name', priorityTown.name)
        .eq('country', priorityTown.country)
        .single();
      
      if (error || !town) {
        console.log(`❌ ${priorityTown.name}, ${priorityTown.country} - not found`);
        continue;
      }
      
      // Use curated list if available, otherwise generate
      const hobbies = CURATED_HOBBIES[priorityTown.name] || generateDefaultHobbies(town);
      
      const { error: updateError } = await supabase
        .from('towns')
        .update({ top_hobbies: hobbies })
        .eq('id', town.id);
      
      if (updateError) {
        console.log(`❌ ${priorityTown.name} - update failed:`, updateError.message);
      } else {
        console.log(`✅ ${priorityTown.name} - ${hobbies.slice(0, 5).join(', ')}...`);
      }
    }
    
    // Step 2: Process remaining coastal towns with generated defaults
    console.log('\n2. Processing coastal towns with defaults...\n');
    
    const { data: coastalTowns } = await supabase
      .from('towns')
      .select('*')
      .contains('geographic_features_actual', ['coastal'])
      .is('top_hobbies', null)
      .limit(20);
    
    if (coastalTowns) {
      for (const town of coastalTowns) {
        const hobbies = generateDefaultHobbies(town);
        
        const { error } = await supabase
          .from('towns')
          .update({ top_hobbies: hobbies })
          .eq('id', town.id);
        
        if (!error) {
          console.log(`✅ ${town.name}, ${town.country} (coastal) - generated ${hobbies.length} hobbies`);
        }
      }
    }
    
    // Step 3: Process mountain towns
    console.log('\n3. Processing mountain towns with defaults...\n');
    
    const { data: mountainTowns } = await supabase
      .from('towns')
      .select('*')
      .contains('geographic_features_actual', ['mountains'])
      .is('top_hobbies', null)
      .limit(10);
    
    if (mountainTowns) {
      for (const town of mountainTowns) {
        const hobbies = generateDefaultHobbies(town);
        
        const { error } = await supabase
          .from('towns')
          .update({ top_hobbies: hobbies })
          .eq('id', town.id);
        
        if (!error) {
          console.log(`✅ ${town.name}, ${town.country} (mountain) - generated ${hobbies.length} hobbies`);
        }
      }
    }
    
    // Step 4: Summary statistics
    console.log('\n📊 Summary:\n');
    
    const { data: stats, count } = await supabase
      .from('towns')
      .select('id', { count: 'exact' })
      .not('top_hobbies', 'is', null);
    
    console.log(`Total towns with top_hobbies: ${count}/341`);
    
    // Show some examples
    console.log('\nSample populated towns:');
    const { data: samples } = await supabase
      .from('towns')
      .select('name, country, top_hobbies')
      .not('top_hobbies', 'is', null)
      .limit(5);
    
    samples?.forEach(town => {
      console.log(`\n${town.name}, ${town.country}:`);
      console.log(`  → ${town.top_hobbies.join(', ')}`);
    });
    
    console.log('\n✅ Initial population complete!');
    console.log('\nNext steps:');
    console.log('1. Gradually expand coverage using AI assistance');
    console.log('2. Collect real user data to refine hobby lists');
    console.log('3. Add seasonal variations where relevant');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the population script
populateTopHobbies().catch(console.error);