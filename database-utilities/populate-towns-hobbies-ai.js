#!/usr/bin/env node

/**
 * AI-POWERED TOWNS_HOBBIES POPULATION
 *
 * Populates the towns_hobbies junction table using geographic inference.
 * This makes the inference system's logic VISIBLE and EDITABLE in the admin UI.
 *
 * Strategy:
 * 1. For each town, run the geographic inference logic
 * 2. Insert inferred hobbies into towns_hobbies (is_excluded = false)
 * 3. Universal hobbies are NOT stored (available everywhere, handled by code)
 * 4. Admins can later manually exclude specific hobbies via Towns Manager
 *
 * This bridges the gap between:
 * - The working inference system (hobbiesInference.js)
 * - The admin UI display (HobbiesDisplay.jsx)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

/**
 * Infer location-specific hobbies for a town
 * Based on hobbiesInference.js logic
 */
function inferLocationSpecificHobbies(town) {
  const hobbies = [];

  // WATER SPORTS - Coastal or near water
  const waterSports = [
    'Swimming', 'Swimming Laps', 'Sailing', 'Surfing', 'Scuba Diving',
    'Kayaking', 'Fishing', 'Boating', 'Snorkeling', 'Water Skiing',
    'Water Aerobics', 'Water Polo', 'Canoeing', 'Paddleboarding',
    'Stand-up Paddleboarding', 'Windsurfing', 'Kitesurfing',
    'Jet Skiing', 'Deep Sea Fishing', 'Yacht Racing', 'Rowing'
  ];

  const hasCoastal = town.geographic_features_actual?.some(f =>
    f && f.toString().toLowerCase() === 'coastal'
  );

  const isFloridaTown = town.state_code === 'FL';

  if (isFloridaTown ||
      town.distance_to_ocean_km === 0 ||
      hasCoastal ||
      town.distance_to_ocean_km <= 100) {
    hobbies.push(...waterSports);
  }

  // WINTER SPORTS - Mountains and cold climate
  const winterSports = [
    'Downhill Skiing', 'Snowboarding', 'Cross-country Skiing',
    'Snowshoeing', 'Ice Skating', 'Ice Hockey', 'Ice Fishing',
    'Sledding', 'Curling', 'Snowmobiling'
  ];

  const hasMountain = town.geographic_features_actual?.some(f =>
    f && f.toString().toLowerCase() === 'mountain'
  );

  if (town.elevation_meters > 800 ||
      town.ski_resorts_count > 0 ||
      hasMountain) {
    hobbies.push(...winterSports);
  }

  // GOLF - Infrastructure dependent
  if (town.golf_courses_count > 0) {
    hobbies.push('Golf');
  }

  // TENNIS/RACQUET SPORTS - Infrastructure dependent
  const racquetSports = ['Tennis', 'Padel', 'Pickleball', 'Bocce Ball', 'Petanque'];
  if (town.tennis_courts_count > 0) {
    hobbies.push(...racquetSports);
  }

  // CULTURAL ACTIVITIES - Urban areas
  const culturalActivities = [
    'Museums', 'Theater', 'Opera', 'Art Galleries', 'Ballet',
    'Concerts', 'Community Theater'
  ];

  if (town.population >= 100000 || town.distance_to_urban_center === 0) {
    hobbies.push(...culturalActivities);
  } else if (town.distance_to_urban_center <= 40 && town.population >= 20000) {
    // Smaller towns near urban centers get partial cultural access
    hobbies.push('Museums', 'Theater', 'Concerts');
  }

  // MARKETS - Population dependent
  if (town.population >= 10000) {
    hobbies.push('Farmers Markets', 'Flea Markets');
  }

  // WINE ACTIVITIES - Wine regions
  const wineActivities = ['Wine Tasting', 'Wine Tours', 'Wine'];
  const wineCountries = ['Spain', 'France', 'Italy', 'Portugal', 'Greece'];
  const wineStates = ['CA', 'OR', 'WA', 'NY'];

  if (wineCountries.includes(town.country)) {
    hobbies.push(...wineActivities);
  } else if (wineStates.includes(town.state_code)) {
    const hasValley = town.geographic_features_actual?.some(f =>
      f && f.toString().toLowerCase() === 'valley'
    );
    if (hasValley) {
      hobbies.push(...wineActivities);
    }
  }

  // CULINARY - Urban and tourist areas
  if (town.population >= 50000 || town.distance_to_urban_center === 0) {
    hobbies.push('Cooking Classes', 'Food Tours', 'Culinary Arts', 'Fine Dining');
  }

  // SPA & WELLNESS - Resort/tourist towns or large population
  if (town.population >= 50000 ||
      (town.geographic_features_actual?.some(f => f?.toLowerCase().includes('coast')) && town.population >= 20000)) {
    hobbies.push('Spa & Wellness');
  }

  // SPECIALIZED OUTDOOR - Geography dependent
  const hasMountains = town.geographic_features_actual?.some(f =>
    f?.toLowerCase() === 'mountain' || f?.toLowerCase() === 'mountains'
  );

  if (hasMountains || town.elevation_meters > 500) {
    hobbies.push('Rock Climbing', 'Mountain Biking');
  }

  // HORSEBACK RIDING - Rural or mountainous areas
  if (town.population < 100000 || hasMountains) {
    hobbies.push('Horseback Riding');
  }

  // BEEKEEPING - Rural areas
  if (town.population < 50000) {
    hobbies.push('Beekeeping');
  }

  // Remove duplicates
  return [...new Set(hobbies)];
}

async function populateTownsHobbies() {
  console.log('🤖 AI-POWERED TOWNS_HOBBIES POPULATION\n');
  console.log('═'.repeat(70));

  // Get all hobbies
  const { data: allHobbies, error: hobbiesError } = await supabase
    .from('hobbies')
    .select('*');

  if (hobbiesError) {
    console.error('❌ Error fetching hobbies:', hobbiesError);
    process.exit(1);
  }

  console.log(`\n📚 Loaded ${allHobbies.length} hobbies from master table`);

  // Create hobby lookup map
  const hobbyMap = new Map();
  allHobbies.forEach(h => hobbyMap.set(h.name, h));

  // Get all towns
  const { data: towns, error: townsError } = await supabase
    .from('towns')
    .select('*');

  if (townsError) {
    console.error('❌ Error fetching towns:', townsError);
    process.exit(1);
  }

  console.log(`🏘️  Processing ${towns.length} towns...\n`);

  // Check current state
  const { count: currentCount } = await supabase
    .from('towns_hobbies')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Current towns_hobbies entries: ${currentCount}`);

  if (currentCount > 0) {
    console.log('⚠️  WARNING: towns_hobbies table already has data!');
    console.log('   This script will ADD new associations (may create duplicates)');
    console.log('   To start fresh, manually truncate towns_hobbies first.\n');
  }

  console.log('═'.repeat(70));
  console.log('Starting AI inference...\n');

  let totalInserted = 0;
  let totalSkipped = 0;
  let processedTowns = 0;

  for (const town of towns) {
    // Infer hobbies for this town
    const inferredHobbyNames = inferLocationSpecificHobbies(town);

    if (inferredHobbyNames.length === 0) {
      console.log(`⚪ ${town.name}, ${town.state_code || town.country} - No location-specific hobbies (universal only)`);
      processedTowns++;
      continue;
    }

    // Convert hobby names to IDs
    const hobbiesToInsert = [];
    const notFoundHobbies = [];

    for (const hobbyName of inferredHobbyNames) {
      const hobby = hobbyMap.get(hobbyName);
      if (!hobby) {
        notFoundHobbies.push(hobbyName);
        totalSkipped++;
        continue;
      }

      // Verify hobby has valid ID
      if (!hobby.id) {
        console.log(`   ⚠️  Hobby "${hobbyName}" has no ID - skipping`);
        totalSkipped++;
        continue;
      }

      // Check if association already exists
      const { data: existing, error: checkError } = await supabase
        .from('towns_hobbies')
        .select('id')
        .eq('town_id', town.id)
        .eq('hobby_id', hobby.id)
        .maybeSingle();  // Use maybeSingle() instead of single() to avoid errors

      if (checkError) {
        console.log(`   ⚠️  Error checking existing hobby "${hobbyName}": ${checkError.message}`);
        continue;
      }

      if (!existing) {
        hobbiesToInsert.push({
          town_id: town.id,
          hobby_id: hobby.id,
          is_excluded: false  // Default: not excluded (admins can change later)
        });
      }
    }

    // Log hobbies not found in database
    if (notFoundHobbies.length > 0) {
      console.log(`   ⚠️  Not found in database: ${notFoundHobbies.join(', ')}`);
    }

    // Batch insert for this town
    if (hobbiesToInsert.length > 0) {
      const { error: insertError, data: insertData } = await supabase
        .from('towns_hobbies')
        .insert(hobbiesToInsert)
        .select();

      if (insertError) {
        console.log(`❌ ${town.name} - INSERT ERROR: ${insertError.message}`);
        console.log(`   Details: ${JSON.stringify(insertError.details || {})}`);
        console.log(`   First item to insert:`, JSON.stringify(hobbiesToInsert[0], null, 2));
      } else {
        const sampleHobbies = inferredHobbyNames.filter(h => hobbyMap.has(h)).slice(0, 5).join(', ');
        const more = hobbiesToInsert.length > 5 ? ` +${hobbiesToInsert.length - 5} more` : '';
        console.log(`✅ ${town.name}, ${town.state_code || town.country} - ${hobbiesToInsert.length} hobbies`);
        console.log(`   ${sampleHobbies}${more}`);
        totalInserted += hobbiesToInsert.length;
      }
    } else {
      console.log(`⏭️  ${town.name} - All hobbies already exist`);
    }

    processedTowns++;

    // Progress indicator every 50 towns
    if (processedTowns % 50 === 0) {
      console.log(`\n📍 Progress: ${processedTowns}/${towns.length} towns processed...\n`);
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📊 FINAL SUMMARY:');
  console.log(`   🏘️  Towns processed: ${processedTowns}`);
  console.log(`   ✅ Associations inserted: ${totalInserted}`);
  console.log(`   ⏭️  Skipped (already existed or not found): ${totalSkipped}`);

  // Final count
  const { count: finalCount } = await supabase
    .from('towns_hobbies')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📈 Final database state:`);
  console.log(`   Total town-hobby associations: ${finalCount}`);
  console.log(`   Average per town: ${(finalCount / towns.length).toFixed(1)} hobbies`);

  // Sample some results
  const { data: sample } = await supabase
    .from('towns_hobbies')
    .select(`
      is_excluded,
      towns!inner(name, state_code, country),
      hobbies!inner(name, category, is_universal)
    `)
    .limit(10);

  if (sample && sample.length > 0) {
    console.log('\n📝 Sample associations:');
    sample.forEach(s => {
      const excluded = s.is_excluded ? '🚫 EXCLUDED' : '✓';
      console.log(`   ${excluded} ${s.towns.name}, ${s.towns.state_code || s.towns.country} → ${s.hobbies.name} (${s.hobbies.category})`);
    });
  }

  console.log('\n✅ AI population complete!');
  console.log('\n🎯 Next: Check Admin UI at http://localhost:5173/admin/towns-manager');
  console.log('   Navigate to any town → Hobbies tab to see the results');
  console.log('═'.repeat(70));
}

populateTownsHobbies().catch(console.error);
