#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Mapping of incorrect formats to correct database format
 */
const NORMALIZATION_MAP = {
  // Lowercase to Proper Case
  'golf': 'Golf',
  'tennis': 'Tennis',
  'swimming': 'Swimming',
  'cycling': 'Cycling',
  'hiking': 'Hiking',
  'sailing': 'Sailing',
  'fishing': 'Fishing',
  'boating': 'Boating',
  'diving': 'Diving',
  'surfing': 'Surfing',
  'kayaking': 'Kayaking',
  'walking': 'Walking',
  'running': 'Running',
  'yoga': 'Yoga',
  'museums': 'Museums',
  'theater': 'Theater',
  'concerts': 'Concerts',
  'dining': 'Dining',
  'shopping': 'Shopping',
  'markets': 'Markets',
  'photography': 'Photography',
  'painting': 'Painting',
  'reading': 'Reading',
  'gardening': 'Gardening',
  'cooking': 'Cooking',
  'volunteering': 'Volunteering',
  
  // Underscore to Proper Case with Spaces
  'beach_walking': 'Beach Walking',
  'water_sports': 'Water Sports',
  'water_crafts': 'Water Crafts',
  'scuba_diving': 'Scuba Diving',
  'wind_surfing': 'Windsurfing',
  'kite_surfing': 'Kitesurfing',
  'mountain_biking': 'Mountain Biking',
  'rock_climbing': 'Rock Climbing',
  'bird_watching': 'Birdwatching',  // One word in database
  'wine_tasting': 'Wine Tasting',
  'cooking_classes': 'Cooking Classes',
  'art_galleries': 'Art Galleries',
  'spanish_classes': 'Spanish Classes',
  'language_classes': 'Language Classes',
  'walking_tours': 'Walking Tours',
  'day_trips': 'Day Trips',
  
  // Location specific with wrong format
  'tapas_tours': 'Tapas Tours',
  'flamenco': 'Flamenco',
  'fado_music': 'Fado Music',
  'port_wine': 'Port Wine Tasting',
  'portuguese_classes': 'Portuguese Classes',
  'portuguese_tiles': 'Portuguese Tiles',
  'italian_classes': 'Italian Classes',
  'italian_cooking': 'Italian Cooking',
  'french_classes': 'French Classes',
  'paella_cooking': 'Paella Cooking',
  'catalan_culture': 'Catalan Culture',
  'river_cruises': 'River Cruises',
  'island_hopping': 'Island Hopping',
  'ancient_sites': 'Ancient Sites',
  'tram_rides': 'Tram Rides',
  
  // Common variations
  'birdwatching': 'Birdwatching',
  'Bird watching': 'Birdwatching',
  'bird watching': 'Birdwatching',
  'Bird Watching': 'Birdwatching',
  
  // Festivals
  'festivals': 'Festivals',
  'opera': 'Opera',
  'ballet': 'Ballet',
  'music': 'Music',
  
  // Sports variations
  'padel': 'Padel',
  'pickleball': 'Pickleball',
  'badminton': 'Badminton',
  'basketball': 'Basketball',
  'volleyball': 'Volleyball'
};

/**
 * Get all valid hobby names from database
 */
async function getValidHobbies() {
  const { data: hobbies } = await supabase
    .from('hobbies')
    .select('name')
    .order('name');
  
  if (!hobbies) return new Set();
  
  const validSet = new Set(hobbies.map(h => h.name));
  console.log(`✅ Loaded ${validSet.size} valid hobbies from database\n`);
  
  return validSet;
}

/**
 * Normalize a single hobby name
 */
function normalizeHobby(hobby, validHobbies) {
  // If it's already valid, return as is
  if (validHobbies.has(hobby)) {
    return hobby;
  }
  
  // Check our mapping
  const mapped = NORMALIZATION_MAP[hobby] || NORMALIZATION_MAP[hobby.toLowerCase()];
  if (mapped && validHobbies.has(mapped)) {
    return mapped;
  }
  
  // Try title case conversion
  const titleCase = hobby
    .split(/[\s_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  if (validHobbies.has(titleCase)) {
    return titleCase;
  }
  
  // Special cases
  if (hobby.toLowerCase().includes('bird') && hobby.toLowerCase().includes('watch')) {
    return 'Birdwatching';
  }
  
  // Return null if we can't normalize it
  return null;
}

/**
 * Audit and fix all towns
 */
async function auditAndFix() {
  console.log('🔍 AUDITING ALL TOWNS FOR HOBBY NORMALIZATION\n');
  
  // Get valid hobbies
  const validHobbies = await getValidHobbies();
  
  // Get all towns with top_hobbies
  const { data: towns } = await supabase
    .from('towns')
    .select('id, name, country, top_hobbies')
    .not('top_hobbies', 'is', null)
    .order('name');
  
  console.log(`Checking ${towns.length} towns...\n`);
  
  const issues = [];
  const fixedTowns = [];
  
  // Check each town
  for (const town of towns) {
    if (!town.top_hobbies || town.top_hobbies.length === 0) continue;
    
    const normalizedHobbies = [];
    let hasIssues = false;
    const townIssues = [];
    
    for (const hobby of town.top_hobbies) {
      const normalized = normalizeHobby(hobby, validHobbies);
      
      if (normalized && normalized !== hobby) {
        // Found an issue that we can fix
        townIssues.push(`"${hobby}" → "${normalized}"`);
        normalizedHobbies.push(normalized);
        hasIssues = true;
      } else if (normalized) {
        // Already correct
        normalizedHobbies.push(normalized);
      } else {
        // Can't normalize - not in database
        townIssues.push(`"${hobby}" → NOT IN DATABASE`);
        hasIssues = true;
        // Skip this hobby
      }
    }
    
    if (hasIssues) {
      issues.push({
        town: `${town.name}, ${town.country}`,
        problems: townIssues
      });
      
      // Update the town with normalized hobbies
      if (normalizedHobbies.length > 0) {
        const { error } = await supabase
          .from('towns')
          .update({ top_hobbies: normalizedHobbies })
          .eq('id', town.id);
        
        if (!error) {
          fixedTowns.push(town.name);
        } else {
          console.error(`Error updating ${town.name}:`, error);
        }
      }
    }
  }
  
  // Report findings
  console.log('📊 AUDIT RESULTS:\n');
  console.log(`Total towns checked: ${towns.length}`);
  console.log(`Towns with issues: ${issues.length}`);
  console.log(`Towns fixed: ${fixedTowns.length}\n`);
  
  if (issues.length > 0) {
    console.log('🔧 ISSUES FOUND AND FIXED:\n');
    issues.slice(0, 20).forEach(issue => {
      console.log(`${issue.town}:`);
      issue.problems.forEach(p => console.log(`  - ${p}`));
    });
    
    if (issues.length > 20) {
      console.log(`\n... and ${issues.length - 20} more towns fixed`);
    }
  }
  
  // Show some examples of correct data
  console.log('\n✅ SAMPLE CORRECTED TOWNS:\n');
  const { data: samples } = await supabase
    .from('towns')
    .select('name, country, top_hobbies')
    .in('name', ['Alicante', 'Valencia', 'Barcelona', 'Lisbon', 'Porto'])
    .order('name');
  
  samples?.forEach(town => {
    console.log(`${town.name}, ${town.country}:`);
    console.log(`  ${town.top_hobbies.join(', ')}\n`);
  });
  
  // Final statistics
  console.log('📈 HOBBY DISTRIBUTION CHECK:\n');
  const { data: allTowns } = await supabase
    .from('towns')
    .select('top_hobbies')
    .not('top_hobbies', 'is', null);
  
  const hobbyCount = {};
  let totalHobbies = 0;
  let invalidCount = 0;
  
  allTowns.forEach(t => {
    t.top_hobbies?.forEach(h => {
      totalHobbies++;
      if (validHobbies.has(h)) {
        hobbyCount[h] = (hobbyCount[h] || 0) + 1;
      } else {
        invalidCount++;
        console.log(`⚠️  Invalid hobby still present: "${h}"`);
      }
    });
  });
  
  console.log(`\nTotal hobby entries: ${totalHobbies}`);
  console.log(`Valid entries: ${totalHobbies - invalidCount} (${Math.round((totalHobbies - invalidCount) / totalHobbies * 100)}%)`);
  console.log(`Invalid entries: ${invalidCount} (${Math.round(invalidCount / totalHobbies * 100)}%)`);
  
  if (invalidCount === 0) {
    console.log('\n🎉 ALL HOBBIES ARE NOW PROPERLY NORMALIZED!');
  } else {
    console.log('\n⚠️  Some invalid hobbies remain - these are not in the hobbies table');
  }
}

// Run the audit and fix
auditAndFix().catch(console.error);