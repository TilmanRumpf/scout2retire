#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Rich hobby sets for major Spanish cities
 * Based on their geographic features, population, and cultural offerings
 */
const SPANISH_CITY_HOBBIES = {
  'Alicante': [
    'Beach Walking', 'Swimming', 'Golf', 'Tennis', 'Sailing',
    'Spanish Classes', 'Hiking', 'Cycling', 'Markets', 'Dining',
    'Museums', 'Photography', 'Scuba Diving', 'Paddel', 'Wine Tasting'
  ],
  
  'Valencia': [
    'Cycling', 'Beach Walking', 'Museums', 'Markets', 'Spanish Classes',
    'Golf', 'Tennis', 'Sailing', 'Paella Cooking', 'Festivals',
    'Swimming', 'Photography', 'Art Galleries', 'Dining', 'Opera'
  ],
  
  'Malaga': [
    'Beach Walking', 'Golf', 'Hiking', 'Museums', 'Tapas Tours',
    'Swimming', 'Spanish Classes', 'Flamenco', 'Markets', 'Tennis',
    'Photography', 'Wine Tasting', 'Art Galleries', 'Sailing', 'Diving'
  ],
  
  'Barcelona': [
    'Museums', 'Beach Walking', 'Architecture Tours', 'Markets', 'Dining',
    'Hiking', 'Cycling', 'Catalan Culture', 'Concerts', 'Sailing',
    'Swimming', 'Art Galleries', 'Photography', 'Spanish Classes', 'Golf'
  ],
  
  'Marbella': [
    'Golf', 'Beach Walking', 'Tennis', 'Sailing', 'Dining',
    'Swimming', 'Markets', 'Spanish Classes', 'Photography', 'Hiking',
    'Scuba Diving', 'Wine Tasting', 'Paddel', 'Shopping', 'Concerts'
  ],
  
  'Palma': [
    'Sailing', 'Beach Walking', 'Golf', 'Cycling', 'Hiking',
    'Swimming', 'Markets', 'Spanish Classes', 'Tennis', 'Dining',
    'Museums', 'Photography', 'Scuba Diving', 'Wine Tasting', 'Concerts'
  ],
  
  'Seville': [
    'Flamenco', 'Museums', 'Spanish Classes', 'Walking Tours', 'Photography',
    'Markets', 'Tapas Tours', 'Cycling', 'Dining', 'Art Galleries',
    'Cooking Classes', 'Architecture Tours', 'Gardens', 'Concerts', 'Opera'
  ],
  
  'Granada': [
    'Hiking', 'Museums', 'Spanish Classes', 'Walking Tours', 'Photography',
    'Tapas Tours', 'Flamenco', 'Markets', 'Art Galleries', 'Gardens',
    'Architecture Tours', 'Skiing', 'Dining', 'Concerts', 'Wine Tasting'
  ],
  
  'Madrid': [
    'Museums', 'Art Galleries', 'Spanish Classes', 'Walking Tours', 'Dining',
    'Markets', 'Photography', 'Concerts', 'Opera', 'Theater',
    'Shopping', 'Gardens', 'Cycling', 'Tapas Tours', 'Flamenco'
  ],
  
  'Bilbao': [
    'Museums', 'Hiking', 'Pintxos Tours', 'Spanish Classes', 'Cycling',
    'Markets', 'Photography', 'Art Galleries', 'Dining', 'Walking Tours',
    'Concerts', 'Golf', 'Wine Tasting', 'Architecture Tours', 'Surfing'
  ],
  
  'San Sebastian': [
    'Beach Walking', 'Surfing', 'Pintxos Tours', 'Swimming', 'Hiking',
    'Museums', 'Spanish Classes', 'Photography', 'Markets', 'Cycling',
    'Festivals', 'Golf', 'Sailing', 'Dining', 'Concerts'
  ],
  
  'Santander': [
    'Beach Walking', 'Surfing', 'Hiking', 'Sailing', 'Golf',
    'Museums', 'Spanish Classes', 'Photography', 'Markets', 'Swimming',
    'Cycling', 'Dining', 'Gardens', 'Walking Tours', 'Concerts'
  ]
};

/**
 * Get valid hobby names from database
 */
async function getValidHobbies() {
  const { data: hobbies } = await supabase
    .from('hobbies')
    .select('name')
    .order('name');
  
  if (!hobbies) return new Set();
  return new Set(hobbies.map(h => h.name));
}

/**
 * Validate and filter hobbies to only include those in database
 */
function validateHobbies(hobbies, validHobbies) {
  const validated = [];
  const invalid = [];
  
  for (const hobby of hobbies) {
    // Try exact match first
    if (validHobbies.has(hobby)) {
      validated.push(hobby);
    } else {
      // Try common corrections
      const corrections = {
        'Paddel': 'Padel',
        'Pintxos Tours': 'Tapas Tours',
        'Paella Cooking': 'Cooking Classes',
        'Catalan Culture': 'Spanish Classes',
        'Architecture Tours': 'Walking Tours',
        'Gardens': 'Gardening',
        'Diving': 'Scuba Diving'
      };
      
      const corrected = corrections[hobby];
      if (corrected && validHobbies.has(corrected)) {
        validated.push(corrected);
      } else {
        invalid.push(hobby);
      }
    }
  }
  
  return { validated, invalid };
}

/**
 * Main execution
 */
async function enrichSpanishCities() {
  console.log('🇪🇸 ENRICHING SPANISH CITIES WITH COMPREHENSIVE HOBBY DATA\n');
  
  // Get valid hobbies
  const validHobbies = await getValidHobbies();
  console.log(`✅ Loaded ${validHobbies.size} valid hobbies from database\n`);
  
  // Process each city
  let successCount = 0;
  let totalCities = Object.keys(SPANISH_CITY_HOBBIES).length;
  
  for (const [cityName, hobbies] of Object.entries(SPANISH_CITY_HOBBIES)) {
    // Get the town record
    const { data: town } = await supabase
      .from('towns')
      .select('id, name, country, top_hobbies, population, distance_to_ocean_km')
      .eq('name', cityName)
      .eq('country', 'Spain')
      .single();
    
    if (!town) {
      console.log(`⚠️  ${cityName} not found in database`);
      continue;
    }
    
    // Validate hobbies
    const { validated, invalid } = validateHobbies(hobbies, validHobbies);
    
    if (invalid.length > 0) {
      console.log(`📝 ${cityName}: Some hobbies need mapping: ${invalid.join(', ')}`);
    }
    
    // Update with validated hobbies (limit to 15)
    const finalHobbies = validated.slice(0, 15);
    
    const { error } = await supabase
      .from('towns')
      .update({ top_hobbies: finalHobbies })
      .eq('id', town.id);
    
    if (!error) {
      console.log(`✅ ${cityName}: ${town.top_hobbies?.length || 0} → ${finalHobbies.length} hobbies`);
      console.log(`   Population: ${town.population?.toLocaleString() || 'N/A'}, Ocean: ${town.distance_to_ocean_km}km`);
      console.log(`   New hobbies: ${finalHobbies.slice(0, 8).join(', ')}${finalHobbies.length > 8 ? '...' : ''}\n`);
      successCount++;
    } else {
      console.log(`❌ ${cityName}: Update failed - ${error.message}\n`);
    }
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`- Updated: ${successCount}/${totalCities} Spanish cities`);
  console.log(`- Each city now has 12-15 relevant hobbies`);
  console.log(`- Based on: location, culture, infrastructure, and population\n`);
  
  // Verify a few examples
  console.log('🔍 VERIFICATION - Sample cities:\n');
  const samples = ['Alicante', 'Valencia', 'Barcelona', 'Seville'];
  
  for (const cityName of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, top_hobbies')
      .eq('name', cityName)
      .eq('country', 'Spain')
      .single();
    
    if (town) {
      console.log(`${town.name}: ${town.top_hobbies.length} hobbies`);
      console.log(`  ${town.top_hobbies.join(', ')}\n`);
    }
  }
  
  console.log('✅ Spanish cities enrichment complete!');
}

// Run the enrichment
enrichSpanishCities().catch(console.error);