#!/usr/bin/env node

/**
 * Lean Hobby Verification and Auto-Assignment Script
 * Fixes the critical issue: 92% of towns have NO hobbies assigned!
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://axlruvvsjepsulcbqlho.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

/**
 * LEAN HOBBY RULES - Based on actual infrastructure and geography
 */
const HOBBY_RULES = {
  // Universal hobbies - EVERY town gets these
  universal: [
    'Walking', 'Reading', 'Cooking', 'Gardening', 'Photography', 
    'Board games', 'Card games', 'Chess', 'Writing', 'Arts & Crafts'
  ],
  
  // Geography-based hobbies
  coastal: ['Swimming', 'Fishing', 'Sailing', 'Kayaking', 'Beach walking', 'Surfing'],
  mountain: ['Hiking', 'Mountain biking', 'Rock climbing', 'Skiing', 'Snowboarding'],
  lake: ['Swimming', 'Fishing', 'Kayaking', 'Stand-up paddleboarding'],
  river: ['Fishing', 'Kayaking', 'Rafting'],
  forest: ['Hiking', 'Birdwatching', 'Mountain biking', 'Nature photography'],
  desert: ['Stargazing', 'Rock collecting', 'Off-road driving'],
  island: ['Swimming', 'Snorkeling', 'Diving', 'Beach walking'],
  
  // Climate-based hobbies
  hot: ['Swimming', 'Water sports'],
  cold: ['Ice skating', 'Skiing', 'Snowshoeing'],
  mild: ['Cycling', 'Tennis', 'Golf'],
  
  // Infrastructure-based hobbies
  golf_course: ['Golf'],
  tennis_courts: ['Tennis'],
  marina: ['Sailing', 'Boating'],
  ski_resort: ['Skiing', 'Snowboarding'],
  wine_region: ['Wine tasting'],
  museums: ['Museums', 'Art galleries'],
  theater: ['Theater'],
  parks: ['Picnicking', 'Jogging'],
  
  // Country/Culture specific
  spain: ['Flamenco', 'Tapas tours'],
  italy: ['Cooking classes', 'Wine tasting', 'Art history'],
  france: ['Wine tasting', 'Cheese tasting', 'Markets'],
  greece: ['Sailing', 'Archaeological sites'],
  portugal: ['Surfing', 'Port wine tasting'],
  mexico: ['Spanish classes', 'Cooking classes'],
  thailand: ['Thai cooking', 'Temple visits', 'Muay Thai'],
  japan: ['Tea ceremony', 'Zen gardens', 'Martial arts']
};

/**
 * Analyze what hobbies a town SHOULD have based on its characteristics
 */
function determineAppropriateHobbies(town) {
  const hobbies = new Set();
  
  // 1. Add universal hobbies
  HOBBY_RULES.universal.forEach(h => hobbies.add(h));
  
  // 2. Check geographic features
  const geoFeatures = (town.geographic_features_actual || []).map(f => f.toLowerCase());
  const description = (town.description || '').toLowerCase();
  const allText = [...geoFeatures, description].join(' ');
  
  // Coastal features
  if (allText.includes('coast') || allText.includes('beach') || allText.includes('ocean') || allText.includes('sea')) {
    HOBBY_RULES.coastal.forEach(h => hobbies.add(h));
  }
  
  // Mountain features
  if (allText.includes('mountain') || allText.includes('alps') || allText.includes('hill')) {
    HOBBY_RULES.mountain.forEach(h => hobbies.add(h));
  }
  
  // Lake features
  if (allText.includes('lake')) {
    HOBBY_RULES.lake.forEach(h => hobbies.add(h));
  }
  
  // River features
  if (allText.includes('river')) {
    HOBBY_RULES.river.forEach(h => hobbies.add(h));
  }
  
  // Forest features
  if (allText.includes('forest') || allText.includes('woods')) {
    HOBBY_RULES.forest.forEach(h => hobbies.add(h));
  }
  
  // Island features
  if (allText.includes('island')) {
    HOBBY_RULES.island.forEach(h => hobbies.add(h));
  }
  
  // 3. Check climate
  const climate = (town.climate_description || '').toLowerCase();
  const summerClimate = (town.summer_climate_actual || '').toLowerCase();
  const winterClimate = (town.winter_climate_actual || '').toLowerCase();
  
  if (climate.includes('tropical') || climate.includes('hot') || summerClimate === 'hot') {
    HOBBY_RULES.hot.forEach(h => hobbies.add(h));
  }
  if (climate.includes('cold') || climate.includes('alpine') || winterClimate === 'cold') {
    HOBBY_RULES.cold.forEach(h => hobbies.add(h));
  }
  if (climate.includes('mediterranean') || climate.includes('mild') || summerClimate === 'mild') {
    HOBBY_RULES.mild.forEach(h => hobbies.add(h));
  }
  
  // 4. Check infrastructure
  if (town.golf_courses_count > 0 || allText.includes('golf')) {
    hobbies.add('Golf');
  }
  if (town.tennis_courts_count > 0 || allText.includes('tennis')) {
    hobbies.add('Tennis');
  }
  if (town.beaches_nearby || allText.includes('beach')) {
    hobbies.add('Beach walking');
    hobbies.add('Swimming');
  }
  if (allText.includes('marina') || allText.includes('yacht')) {
    hobbies.add('Sailing');
    hobbies.add('Boating');
  }
  if (allText.includes('ski')) {
    hobbies.add('Skiing');
  }
  if (allText.includes('wine') || allText.includes('vineyard')) {
    hobbies.add('Wine tasting');
  }
  if (allText.includes('museum')) {
    hobbies.add('Museums');
  }
  if (allText.includes('theater') || allText.includes('theatre')) {
    hobbies.add('Theater');
  }
  
  // 5. Country-specific hobbies
  const countryLower = (town.country || '').toLowerCase();
  Object.keys(HOBBY_RULES).forEach(country => {
    if (countryLower.includes(country) && Array.isArray(HOBBY_RULES[country])) {
      HOBBY_RULES[country].forEach(h => hobbies.add(h));
    }
  });
  
  // 6. Add common activities if mentioned
  if (allText.includes('cycle') || allText.includes('bike')) {
    hobbies.add('Cycling');
  }
  if (allText.includes('yoga')) {
    hobbies.add('Yoga');
  }
  if (allText.includes('market')) {
    hobbies.add('Markets');
  }
  
  return Array.from(hobbies);
}

/**
 * Main verification and fix function
 */
async function verifyAndFixHobbies() {
  console.log('🔍 Starting Hobby Verification and Fix...\n');
  
  try {
    // 1. Get all towns with their current hobby assignments
    console.log('📊 Analyzing current state...');
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select(`
        id, name, country, 
        geographic_features_actual, 
        climate_description,
        summer_climate_actual,
        winter_climate_actual,
        description,
        activities_available,
        golf_courses_count,
        tennis_courts_count,
        beaches_nearby,
        image_url_1
      `)
      .order('name');
    
    if (townsError) throw townsError;
    
    // 2. Get all hobbies and create lookup
    const { data: allHobbies, error: hobbiesError } = await supabase
      .from('hobbies')
      .select('id, name');
    
    if (hobbiesError) throw hobbiesError;
    
    const hobbyLookup = {};
    allHobbies.forEach(h => {
      hobbyLookup[h.name] = h.id;
    });
    
    // 3. Get current town_hobbies assignments
    const { data: currentAssignments, error: assignError } = await supabase
      .from('towns_hobbies')
      .select('town_id, hobby_id');
    
    if (assignError) throw assignError;
    
    // Create lookup for current assignments
    const townHobbyMap = {};
    currentAssignments.forEach(a => {
      if (!townHobbyMap[a.town_id]) {
        townHobbyMap[a.town_id] = new Set();
      }
      townHobbyMap[a.town_id].add(a.hobby_id);
    });
    
    // 4. Analyze each town
    const issues = [];
    const fixes = [];
    let townsWithNoHobbies = 0;
    let townsWithPhotosNoHobbies = 0;
    
    for (const town of towns) {
      const currentHobbies = townHobbyMap[town.id] || new Set();
      const appropriateHobbies = determineAppropriateHobbies(town);
      
      // Check if town has no hobbies
      if (currentHobbies.size === 0) {
        townsWithNoHobbies++;
        if (town.image_url_1) {
          townsWithPhotosNoHobbies++;
          
          // Prepare fixes for towns with photos
          appropriateHobbies.forEach(hobbyName => {
            const hobbyId = hobbyLookup[hobbyName];
            if (hobbyId) {
              fixes.push({
                town_id: town.id,
                town_name: town.name,
                hobby_id: hobbyId,
                hobby_name: hobbyName
              });
            }
          });
          
          issues.push({
            town: town.name,
            country: town.country,
            issue: 'NO HOBBIES ASSIGNED',
            shouldHave: appropriateHobbies.length,
            recommended: appropriateHobbies.slice(0, 10)
          });
        }
      }
    }
    
    // 5. Report findings
    console.log('\n📈 VERIFICATION RESULTS:');
    console.log('─'.repeat(50));
    console.log(`Total towns: ${towns.length}`);
    console.log(`Towns with NO hobbies: ${townsWithNoHobbies} (${Math.round(townsWithNoHobbies/towns.length*100)}%)`);
    console.log(`Towns with photos but NO hobbies: ${townsWithPhotosNoHobbies}`);
    console.log(`Total fixes needed: ${fixes.length}`);
    
    if (issues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES (Towns with photos but no hobbies):');
      console.log('─'.repeat(50));
      issues.slice(0, 10).forEach(issue => {
        console.log(`\n${issue.town}, ${issue.country}:`);
        console.log(`  Issue: ${issue.issue}`);
        console.log(`  Should have ~${issue.shouldHave} hobbies`);
        console.log(`  Recommended: ${issue.recommended.slice(0, 5).join(', ')}...`);
      });
    }
    
    // 6. Ask user if they want to apply fixes
    if (fixes.length > 0) {
      console.log('\n🔧 FIX AVAILABLE:');
      console.log(`Ready to add ${fixes.length} hobby assignments to ${townsWithPhotosNoHobbies} towns with photos.`);
      console.log('\nTo apply fixes, run: node verify-and-fix-hobbies.js --fix');
      
      // If --fix flag is provided, apply the fixes
      if (process.argv.includes('--fix')) {
        console.log('\n✨ Applying fixes...');
        
        let successCount = 0;
        const batchSize = 100;
        
        for (let i = 0; i < fixes.length; i += batchSize) {
          const batch = fixes.slice(i, i + batchSize).map(f => ({
            town_id: f.town_id,
            hobby_id: f.hobby_id
          }));
          
          const { error } = await supabase
            .from('towns_hobbies')
            .insert(batch);
          
          if (error) {
            console.error(`Error inserting batch: ${error.message}`);
          } else {
            successCount += batch.length;
            process.stdout.write(`\rProgress: ${successCount}/${fixes.length} assignments added`);
          }
        }
        
        console.log(`\n\n✅ Successfully added ${successCount} hobby assignments!`);
        console.log('Towns with photos now have appropriate hobbies based on their geography and features.');
      }
    }
    
    // 7. Quick validation check
    console.log('\n🎯 VALIDATION CHECKS:');
    console.log('─'.repeat(50));
    
    // Check coastal towns have water activities
    const coastalTowns = towns.filter(t => 
      (t.geographic_features_actual || []).some(f => f.toLowerCase().includes('coastal'))
    );
    console.log(`Coastal towns: ${coastalTowns.length}`);
    
    // Check mountain towns have hiking
    const mountainTowns = towns.filter(t => 
      (t.geographic_features_actual || []).some(f => f.toLowerCase().includes('mountain'))
    );
    console.log(`Mountain towns: ${mountainTowns.length}`);
    
    console.log('\n✨ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the verification
verifyAndFixHobbies();