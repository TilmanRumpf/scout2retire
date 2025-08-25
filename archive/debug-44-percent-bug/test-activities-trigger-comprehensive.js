import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function comprehensiveTriggerTest() {
  console.log('🧪 COMPREHENSIVE ACTIVITIES TRIGGER TEST\n');
  console.log('=' + '='.repeat(60) + '\n');
  
  // Test different infrastructure types
  const tests = [
    {
      name: 'GOLF TEST',
      town: 'Dubai',
      column: 'golf_courses_count',
      values: [0, 1, 2, 5, 10],
      expectedActivities: {
        0: [],
        1: ['golf', 'driving_range'],
        2: ['golf', 'driving_range', 'golf_variety', 'golf_tournaments'],
        5: ['golf', 'driving_range', 'golf_variety', 'golf_tournaments', 'golf_destination'],
        10: ['golf', 'driving_range', 'golf_variety', 'golf_tournaments', 'golf_destination']
      }
    },
    {
      name: 'TENNIS TEST',
      town: 'Barcelona',
      column: 'tennis_courts_count',
      values: [0, 1, 5, 10, 20],
      expectedActivities: {
        0: [],
        1: ['tennis'],
        5: ['tennis', 'tennis_clubs', 'pickleball'],
        10: ['tennis', 'tennis_clubs', 'pickleball', 'tennis_tournaments', 'tennis_lessons'],
        20: ['tennis', 'tennis_clubs', 'pickleball', 'tennis_tournaments', 'tennis_lessons']
      }
    },
    {
      name: 'BEACH TEST',
      town: 'Miami',
      column: 'beaches_nearby',
      values: [false, true],
      expectedActivities: {
        false: [],
        true: ['beach_walking', 'beach_lounging', 'swimming_ocean', 'beachcombing', 'beach_volleyball', 'sunbathing', 'beach_sports']
      }
    },
    {
      name: 'MARINA TEST',
      town: 'Monaco',
      column: 'marinas_count',
      values: [0, 1, 2, 3, 5],
      expectedActivities: {
        0: [],
        1: ['boating', 'sailing', 'yacht_watching'],
        2: ['boating', 'sailing', 'yacht_watching', 'yacht_clubs', 'sailing_lessons', 'fishing_charters'],
        3: ['boating', 'sailing', 'yacht_watching', 'yacht_clubs', 'sailing_lessons', 'fishing_charters', 'yacht_racing', 'marina_dining'],
        5: ['boating', 'sailing', 'yacht_watching', 'yacht_clubs', 'sailing_lessons', 'fishing_charters', 'yacht_racing', 'marina_dining']
      }
    },
    {
      name: 'HIKING TEST',
      town: 'Denver',
      column: 'hiking_trails_km',
      values: [0, 10, 25, 100, 200, 500],
      expectedActivities: {
        0: [],
        10: ['hiking', 'nature_walks', 'trail_photography'],
        25: ['hiking', 'nature_walks', 'trail_photography', 'day_hikes', 'trail_variety'],
        100: ['hiking', 'nature_walks', 'trail_photography', 'day_hikes', 'trail_variety', 'serious_hiking', 'backpacking', 'trail_running', 'mountain_biking'],
        200: ['hiking', 'nature_walks', 'trail_photography', 'day_hikes', 'trail_variety', 'serious_hiking', 'backpacking', 'trail_running', 'mountain_biking', 'multi_day_trekking', 'wilderness_exploration'],
        500: ['hiking', 'nature_walks', 'trail_photography', 'day_hikes', 'trail_variety', 'serious_hiking', 'backpacking', 'trail_running', 'mountain_biking', 'multi_day_trekking', 'wilderness_exploration']
      }
    },
    {
      name: 'SKI TEST',
      town: 'Zurich',
      column: 'ski_resorts_within_100km',
      values: [0, 1, 3, 5, 10],
      expectedActivities: {
        0: [],
        1: ['skiing', 'snowboarding', 'apres_ski'],
        3: ['skiing', 'snowboarding', 'apres_ski', 'ski_variety', 'ski_touring'],
        5: ['skiing', 'snowboarding', 'apres_ski', 'ski_variety', 'ski_touring', 'ski_destination', 'winter_sports_hub'],
        10: ['skiing', 'snowboarding', 'apres_ski', 'ski_variety', 'ski_touring', 'ski_destination', 'winter_sports_hub']
      }
    },
    {
      name: 'COWORKING TEST',
      town: 'Lisbon',
      column: 'coworking_spaces_count',
      values: [0, 1, 3, 5],
      expectedActivities: {
        0: [],
        1: ['coworking', 'digital_nomad_friendly', 'networking'],
        3: ['coworking', 'digital_nomad_friendly', 'networking', 'startup_scene', 'tech_meetups'],
        5: ['coworking', 'digital_nomad_friendly', 'networking', 'startup_scene', 'tech_meetups']
      }
    },
    {
      name: 'DOG PARKS TEST',
      town: 'Austin',
      column: 'dog_parks_count',
      values: [0, 1, 3, 5],
      expectedActivities: {
        0: [],
        1: ['dog_walking', 'pet_friendly'],
        3: ['dog_walking', 'pet_friendly', 'dog_community', 'pet_events'],
        5: ['dog_walking', 'pet_friendly', 'dog_community', 'pet_events']
      }
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const test of tests) {
    console.log(`\n📋 ${test.name}\n`);
    console.log('-'.repeat(40));
    
    // Get the town
    const { data: town, error: fetchError } = await supabase
      .from('towns')
      .select('id, name, country, activities_available')
      .eq('name', test.town)
      .single();
    
    if (fetchError || !town) {
      console.error(`❌ Could not find ${test.town}`);
      failedTests++;
      continue;
    }
    
    console.log(`Testing ${town.name}, ${town.country}`);
    
    // Store original value
    const { data: originalTown } = await supabase
      .from('towns')
      .select(test.column)
      .eq('id', town.id)
      .single();
    
    const originalValue = originalTown[test.column];
    console.log(`Original ${test.column}: ${originalValue}\n`);
    
    // Test each value
    for (const value of test.values) {
      // Update the infrastructure
      const { error: updateError } = await supabase
        .from('towns')
        .update({ [test.column]: value })
        .eq('id', town.id);
      
      if (updateError) {
        console.error(`❌ Failed to update: ${updateError.message}`);
        failedTests++;
        continue;
      }
      
      // Get updated activities
      const { data: updatedTown } = await supabase
        .from('towns')
        .select('activities_available')
        .eq('id', town.id)
        .single();
      
      // Check expected activities
      const expectedActivities = test.expectedActivities[value];
      let allPresent = true;
      let unexpectedPresent = false;
      
      for (const activity of expectedActivities) {
        if (!updatedTown.activities_available?.includes(activity)) {
          allPresent = false;
          break;
        }
      }
      
      // Check no unexpected activities from this category
      const allCategoryActivities = Object.values(test.expectedActivities).flat();
      for (const activity of allCategoryActivities) {
        if (!expectedActivities.includes(activity) && updatedTown.activities_available?.includes(activity)) {
          unexpectedPresent = true;
          break;
        }
      }
      
      const testPassed = allPresent && !unexpectedPresent;
      
      if (testPassed) {
        console.log(`✅ ${test.column}=${value}: ${expectedActivities.length} activities present`);
        passedTests++;
      } else {
        console.log(`❌ ${test.column}=${value}: Activities mismatch`);
        console.log(`   Expected: ${expectedActivities.join(', ')}`);
        const actualActivities = updatedTown.activities_available?.filter(a => allCategoryActivities.includes(a)) || [];
        console.log(`   Got: ${actualActivities.join(', ')}`);
        failedTests++;
      }
    }
    
    // Restore original value
    await supabase
      .from('towns')
      .update({ [test.column]: originalValue })
      .eq('id', town.id);
    
    console.log(`\nRestored original ${test.column}: ${originalValue}`);
  }
  
  // Test multiple infrastructure changes at once
  console.log('\n\n📋 COMBINED INFRASTRUCTURE TEST\n');
  console.log('-'.repeat(40));
  
  const { data: testTown } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Wanaka')
    .single();
  
  if (testTown) {
    // Store original values
    const originalInfra = {
      golf_courses_count: testTown.golf_courses_count,
      beaches_nearby: testTown.beaches_nearby,
      hiking_trails_km: testTown.hiking_trails_km,
      ski_resorts_within_100km: testTown.ski_resorts_within_100km
    };
    
    console.log('Testing Wanaka, New Zealand');
    console.log('Original infrastructure:', originalInfra);
    
    // Update multiple infrastructure
    const { error: multiUpdateError } = await supabase
      .from('towns')
      .update({
        golf_courses_count: 2,
        beaches_nearby: true,
        hiking_trails_km: 150,
        ski_resorts_within_100km: 4
      })
      .eq('id', testTown.id);
    
    if (!multiUpdateError) {
      const { data: updatedMulti } = await supabase
        .from('towns')
        .select('activities_available')
        .eq('id', testTown.id)
        .single();
      
      const expectedMulti = [
        'golf', 'driving_range', 'golf_variety', 'golf_tournaments',
        'beach_walking', 'beach_lounging', 'swimming_ocean',
        'hiking', 'nature_walks', 'serious_hiking', 'trail_running',
        'skiing', 'snowboarding', 'ski_variety', 'ski_touring'
      ];
      
      let multiTestPassed = true;
      for (const activity of expectedMulti) {
        if (!updatedMulti.activities_available?.includes(activity)) {
          multiTestPassed = false;
          break;
        }
      }
      
      if (multiTestPassed) {
        console.log('✅ Multiple infrastructure updates work correctly');
        passedTests++;
      } else {
        console.log('❌ Multiple infrastructure updates failed');
        failedTests++;
      }
      
      // Restore
      await supabase
        .from('towns')
        .update(originalInfra)
        .eq('id', testTown.id);
      
      console.log('Restored original infrastructure');
    }
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`);
  
  if (failedTests === passedTests + failedTests) {
    console.log('⚠️ THE TRIGGER IS NOT INSTALLED!');
    console.log('Please run the SQL from create-activities-trigger.sql in Supabase SQL Editor');
  } else if (failedTests > 0) {
    console.log('⚠️ The trigger is partially working but some tests failed');
  } else {
    console.log('🎉 THE TRIGGER IS WORKING PERFECTLY!');
  }
}

// Run comprehensive test
comprehensiveTriggerTest().catch(console.error);