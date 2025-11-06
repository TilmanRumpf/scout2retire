#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { inferHobbyAvailability, calculateHobbyScore } from '../src/utils/scoring/geographicInference.js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInference() {
  console.log('🧪 TESTING GEOGRAPHIC INFERENCE SYSTEM\n');
  console.log('=' .repeat(60) + '\n');
  
  // Test cases with different town types
  const testCases = [
    {
      name: 'Alicante',
      country: 'Spain',
      userHobbies: ['Swimming', 'Sailing', 'Golf', 'Tennis', 'Museums', 'Reading', 'Skiing']
    },
    {
      name: 'Chamonix',
      country: 'France',
      userHobbies: ['Skiing', 'Snowboarding', 'Hiking', 'Mountain Biking', 'Swimming']
    },
    {
      name: 'Florence',
      country: 'Italy',
      userHobbies: ['Museums', 'Art Galleries', 'Wine Tasting', 'Cooking', 'Opera']
    },
    {
      name: 'Lagos',
      country: 'Portugal',
      userHobbies: ['Surfing', 'Scuba Diving', 'Kayaking', 'Fishing', 'Golf']
    }
  ];
  
  for (const testCase of testCases) {
    // Get town data
    const { data: town } = await supabase
      .from('towns')
      .select('*')
      .eq('name', testCase.name)
      .eq('country', testCase.country)
      .single();
    
    if (!town) {
      console.log(`❌ ${testCase.name} not found\n`);
      continue;
    }
    
    console.log(`📍 ${town.town_name}, ${town.country}`);
    console.log('-'.repeat(40));
    
    // Show town characteristics
    console.log('Town characteristics:');
    console.log(`  Population: ${town.population?.toLocaleString()}`);
    console.log(`  Ocean distance: ${town.distance_to_ocean_km}km`);
    console.log(`  Elevation: ${town.elevation_meters}m`);
    console.log(`  Golf courses: ${town.golf_courses_count}`);
    console.log(`  Tennis courts: ${town.tennis_courts_count}`);
    console.log(`  Features: ${town.geographic_features_actual?.join(', ') || 'none'}`);
    console.log(`  Top hobbies: ${town.top_hobbies?.slice(0, 5).join(', ')}...`);
    
    // Test inference
    console.log(`\nUser requested: ${testCase.userHobbies.join(', ')}`);
    
    const inference = inferHobbyAvailability(town, testCase.userHobbies);
    const score = calculateHobbyScore(town, testCase.userHobbies);
    
    console.log(`\nInference results:`);
    console.log(`  ✅ Available: ${inference.availableHobbies.length}/${testCase.userHobbies.length}`);
    console.log(`  📊 Match: ${inference.matchPercentage}%`);
    console.log(`  🎯 Score: ${score.score}/100`);
    
    console.log(`\nBreakdown:`);
    if (inference.details.distinctive.length > 0) {
      console.log(`  🌟 Distinctive (in top_hobbies): ${inference.details.distinctive.join(', ')}`);
    }
    if (inference.details.inferred.length > 0) {
      console.log(`  🔍 Inferred (from geography): ${inference.details.inferred.join(', ')}`);
    }
    if (inference.details.universal.length > 0) {
      console.log(`  🌍 Universal (everywhere): ${inference.details.universal.join(', ')}`);
    }
    if (inference.details.notAvailable.length > 0) {
      console.log(`  ❌ Not available: ${inference.details.notAvailable.join(', ')}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  // Test accuracy across many towns
  console.log('📊 TESTING INFERENCE ACCURACY\n');
  
  // Get a sample of diverse towns
  const { data: sampleTowns } = await supabase
    .from('towns')
    .select('*')
    .in('name', ['Barcelona', 'Dubai', 'Aspen', 'Bath', 'Singapore'])
    .order('town_name');
  
  const testHobbies = ['Swimming', 'Golf', 'Museums', 'Skiing', 'Wine Tasting'];
  
  console.log('Testing hobby availability inference:\n');
  console.log('Town'.padEnd(20) + testHobbies.map(h => h.substring(0, 8)).join('  '));
  console.log('-'.repeat(70));
  
  for (const town of sampleTowns) {
    const row = town.town_name.padEnd(20);
    const results = [];
    
    for (const hobby of testHobbies) {
      const inference = inferHobbyAvailability(town, [hobby]);
      if (inference.availableHobbies.includes(hobby)) {
        results.push('✅'.padEnd(10));
      } else {
        results.push('❌'.padEnd(10));
      }
    }
    
    console.log(row + results.join(''));
  }
  
  console.log('\n✅ INFERENCE TESTING COMPLETE');
}