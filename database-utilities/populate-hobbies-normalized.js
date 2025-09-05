#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * NORMALIZED HOBBY NAMES - Matching hobbies table format
 * Format: Proper Case with Spaces (e.g., "Beach Walking", "Scuba Diving")
 */
const NORMALIZED_HOBBIES = {
  // Water Activities
  'swimming': 'Swimming',
  'beach_walking': 'Beach Walking',
  'surfing': 'Surfing',
  'sailing': 'Sailing',
  'fishing': 'Fishing',
  'scuba_diving': 'Scuba Diving',
  'kayaking': 'Kayaking',
  'water_sports': 'Water Sports',
  'boating': 'Boating',
  'snorkeling': 'Snorkeling',
  
  // Land Sports
  'golf': 'Golf',
  'tennis': 'Tennis',
  'cycling': 'Cycling',
  'hiking': 'Hiking',
  'walking': 'Walking',
  'running': 'Running',
  'yoga': 'Yoga',
  'padel': 'Padel',
  'pickleball': 'Pickleball',
  
  // Cultural
  'museums': 'Museums',
  'art_galleries': 'Art Galleries',
  'photography': 'Photography',
  'painting': 'Painting',
  'cooking': 'Cooking',
  'cooking_classes': 'Cooking Classes',
  'wine_tasting': 'Wine Tasting',
  'reading': 'Reading',
  'music': 'Music',
  
  // Social
  'dining': 'Dining',
  'markets': 'Markets',
  'shopping': 'Shopping',
  'volunteering': 'Volunteering',
  'gardening': 'Gardening',
  'bird_watching': 'Birdwatching',  // Note: One word in database
  
  // Location specific
  'spanish_classes': 'Spanish Classes',
  'language_classes': 'Language Classes',
  'flamenco': 'Flamenco',
  'tapas_tours': 'Tapas Tours',
  'port_wine': 'Port Wine Tasting',
  'italian_cooking': 'Italian Cooking'
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
 * Normalize hobby name to match database format
 */
function normalizeHobbyName(hobby, validHobbies) {
  // First try exact match
  if (validHobbies.has(hobby)) return hobby;
  
  // Try our mapping
  const mapped = NORMALIZED_HOBBIES[hobby.toLowerCase().replace(/\s+/g, '_')];
  if (mapped && validHobbies.has(mapped)) return mapped;
  
  // Try capitalizing each word
  const titleCase = hobby
    .split(/[\s_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  if (validHobbies.has(titleCase)) return titleCase;
  
  // Try variations
  if (hobby.includes('_')) {
    const spaced = hobby.replace(/_/g, ' ');
    const spacedTitle = spaced
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    if (validHobbies.has(spacedTitle)) return spacedTitle;
  }
  
  // Return null if not found
  return null;
}

/**
 * Generate default hobbies based on town characteristics
 * Returns properly normalized hobby names
 */
function generateNormalizedHobbies(town, validHobbies) {
  const hobbies = new Set();
  
  // Universal hobbies (check each exists in database)
  const universal = ['Walking', 'Reading', 'Cooking', 'Gardening', 'Photography'];
  universal.forEach(h => {
    if (validHobbies.has(h)) hobbies.add(h);
  });
  
  // Coastal activities
  if (town.geographic_features_actual?.includes('coastal') || 
      town.distance_to_ocean_km < 5) {
    const coastal = ['Swimming', 'Beach Walking', 'Fishing', 'Boating'];
    coastal.forEach(h => {
      if (validHobbies.has(h)) hobbies.add(h);
    });
    
    if (town.marinas_count > 0) {
      if (validHobbies.has('Sailing')) hobbies.add('Sailing');
    }
  }
  
  // Mountain activities  
  if (town.geographic_features_actual?.includes('mountains') || 
      town.elevation_meters > 500) {
    const mountain = ['Hiking', 'Mountain Biking', 'Birdwatching'];
    mountain.forEach(h => {
      if (validHobbies.has(h)) hobbies.add(h);
    });
  }
  
  // Urban activities (population > 100,000)
  if (town.population >= 100000) {
    const urban = ['Museums', 'Theater', 'Dining', 'Shopping', 'Art Galleries'];
    urban.forEach(h => {
      if (validHobbies.has(h)) hobbies.add(h);
    });
  }
  
  // Check specific infrastructure
  if (town.golf_courses_count > 0 && validHobbies.has('Golf')) {
    hobbies.add('Golf');
  }
  if (town.tennis_courts_count > 0 && validHobbies.has('Tennis')) {
    hobbies.add('Tennis');
  }
  
  // Convert to array and limit to 10
  return Array.from(hobbies).slice(0, 10);
}

/**
 * Process a batch of towns
 */
async function processBatch(batchNumber) {
  console.log(`\n📦 BATCH ${batchNumber}: Processing towns...\n`);
  
  // Get valid hobbies from database
  const validHobbies = await getValidHobbies();
  console.log(`✅ Loaded ${validHobbies.size} valid hobbies from database\n`);
  
  // Get towns that don't have top_hobbies yet
  const { data: towns } = await supabase
    .from('towns')
    .select('*')
    .is('top_hobbies', null)
    .order('population', { ascending: false })
    .limit(20);
  
  if (!towns || towns.length === 0) {
    console.log('No more towns to process!');
    return 0;
  }
  
  console.log(`Processing ${towns.length} towns:\n`);
  
  let successCount = 0;
  for (const town of towns) {
    const hobbies = generateNormalizedHobbies(town, validHobbies);
    
    if (hobbies.length > 0) {
      const { error } = await supabase
        .from('towns')
        .update({ top_hobbies: hobbies })
        .eq('id', town.id);
      
      if (!error) {
        console.log(`✅ ${town.name}, ${town.country}`);
        console.log(`   → ${hobbies.slice(0, 5).join(', ')}${hobbies.length > 5 ? '...' : ''}`);
        successCount++;
      } else {
        console.log(`❌ ${town.name} - Error: ${error.message}`);
      }
    } else {
      console.log(`⚠️  ${town.name} - No valid hobbies generated`);
    }
  }
  
  return successCount;
}

/**
 * Main execution - run one batch
 */
async function main() {
  console.log('🎯 POPULATING TOP HOBBIES (Normalized to match database)\n');
  console.log('Format: Proper Case with Spaces (e.g., "Golf", "Beach Walking")\n');
  
  // Check how many towns already have data
  const { count: total } = await supabase
    .from('towns')
    .select('id', { count: 'exact', head: true });
  
  const { count: completed } = await supabase
    .from('towns')
    .select('id', { count: 'exact', head: true })
    .not('top_hobbies', 'is', null);
  
  console.log(`📊 Current Progress: ${completed}/${total} towns have top_hobbies\n`);
  
  // Process one batch
  const processed = await processBatch(Math.floor(completed / 20) + 1);
  
  // Final stats
  const { count: newCompleted } = await supabase
    .from('towns')
    .select('id', { count: 'exact', head: true })
    .not('top_hobbies', 'is', null);
  
  console.log('\n📊 SUMMARY:');
  console.log(`- Processed: ${processed} towns`);
  console.log(`- Total progress: ${newCompleted}/${total} towns`);
  console.log(`- Remaining: ${total - newCompleted} towns`);
  
  if (total - newCompleted > 0) {
    console.log('\nRun script again to process next batch!');
  } else {
    console.log('\n✅ ALL TOWNS COMPLETE!');
  }
}

// Run the script
main().catch(console.error);