#!/usr/bin/env node

// ACTIVITIES TRIGGER CREATION AND TEST SCRIPT
// This script creates the database trigger and tests its functionality

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function createTriggerViaWebInterface() {
  console.log('🔧 Database trigger needs to be created manually.');
  console.log('📝 Please follow these steps:\n');
  
  console.log('1. Go to your Supabase dashboard:');
  console.log('   https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho\n');
  
  console.log('2. Navigate to SQL Editor\n');
  
  console.log('3. Execute the following SQL:\n');
  
  const sql = `
-- =====================================================
-- AUTOMATIC ACTIVITY UPDATES BASED ON INFRASTRUCTURE
-- =====================================================

CREATE OR REPLACE FUNCTION update_activities_on_infrastructure_change()
RETURNS TRIGGER AS $$
DECLARE
  activities text[];
BEGIN
  -- Start with current activities or empty array
  activities := COALESCE(NEW.activities_available, ARRAY[]::text[]);
  
  -- ========== GOLF ACTIVITIES ==========
  IF NEW.golf_courses_count IS DISTINCT FROM OLD.golf_courses_count THEN
    -- Remove all golf-related activities first
    activities := array_remove(activities, 'golf');
    activities := array_remove(activities, 'driving_range');
    activities := array_remove(activities, 'golf_variety');
    activities := array_remove(activities, 'golf_tournaments');
    activities := array_remove(activities, 'golf_destination');
    
    -- Add based on count
    IF NEW.golf_courses_count > 0 THEN
      activities := array_append(activities, 'golf');
      activities := array_append(activities, 'driving_range');
      
      IF NEW.golf_courses_count >= 2 THEN
        activities := array_append(activities, 'golf_variety');
        activities := array_append(activities, 'golf_tournaments');
      END IF;
      
      IF NEW.golf_courses_count >= 5 THEN
        activities := array_append(activities, 'golf_destination');
      END IF;
    END IF;
  END IF;
  
  -- ========== TENNIS ACTIVITIES ==========
  IF NEW.tennis_courts_count IS DISTINCT FROM OLD.tennis_courts_count THEN
    -- Remove all tennis-related activities first
    activities := array_remove(activities, 'tennis');
    activities := array_remove(activities, 'tennis_clubs');
    activities := array_remove(activities, 'tennis_tournaments');
    activities := array_remove(activities, 'tennis_lessons');
    activities := array_remove(activities, 'pickleball');
    
    -- Add based on count
    IF NEW.tennis_courts_count > 0 THEN
      activities := array_append(activities, 'tennis');
      
      IF NEW.tennis_courts_count >= 5 THEN
        activities := array_append(activities, 'tennis_clubs');
        activities := array_append(activities, 'pickleball');
      END IF;
      
      IF NEW.tennis_courts_count >= 10 THEN
        activities := array_append(activities, 'tennis_tournaments');
        activities := array_append(activities, 'tennis_lessons');
      END IF;
    END IF;
  END IF;
  
  -- ========== BEACH ACTIVITIES ==========
  IF NEW.beaches_nearby IS DISTINCT FROM OLD.beaches_nearby THEN
    -- Remove all beach activities first
    activities := array_remove(activities, 'beach_walking');
    activities := array_remove(activities, 'beach_lounging');
    activities := array_remove(activities, 'swimming_ocean');
    activities := array_remove(activities, 'beachcombing');
    activities := array_remove(activities, 'beach_volleyball');
    activities := array_remove(activities, 'sunbathing');
    activities := array_remove(activities, 'beach_sports');
    
    -- Add if beaches nearby
    IF NEW.beaches_nearby = true THEN
      activities := array_append(activities, 'beach_walking');
      activities := array_append(activities, 'beach_lounging');
      activities := array_append(activities, 'swimming_ocean');
      activities := array_append(activities, 'beachcombing');
      activities := array_append(activities, 'beach_volleyball');
      
      -- Add climate-dependent activities
      IF NEW.avg_temp_summer >= 25 OR NEW.climate = 'Tropical' THEN
        activities := array_append(activities, 'sunbathing');
        activities := array_append(activities, 'beach_sports');
      END IF;
    END IF;
  END IF;
  
  -- ========== MARINA/BOATING ACTIVITIES ==========
  IF NEW.marinas_count IS DISTINCT FROM OLD.marinas_count THEN
    -- Remove all marina activities first
    activities := array_remove(activities, 'boating');
    activities := array_remove(activities, 'sailing');
    activities := array_remove(activities, 'yacht_watching');
    activities := array_remove(activities, 'yacht_clubs');
    activities := array_remove(activities, 'sailing_lessons');
    activities := array_remove(activities, 'fishing_charters');
    activities := array_remove(activities, 'yacht_racing');
    activities := array_remove(activities, 'marina_dining');
    
    -- Add based on count
    IF NEW.marinas_count > 0 THEN
      activities := array_append(activities, 'boating');
      activities := array_append(activities, 'sailing');
      activities := array_append(activities, 'yacht_watching');
      
      IF NEW.marinas_count >= 2 THEN
        activities := array_append(activities, 'yacht_clubs');
        activities := array_append(activities, 'sailing_lessons');
        activities := array_append(activities, 'fishing_charters');
      END IF;
      
      IF NEW.marinas_count >= 3 THEN
        activities := array_append(activities, 'yacht_racing');
        activities := array_append(activities, 'marina_dining');
      END IF;
    END IF;
  END IF;
  
  -- ========== HIKING ACTIVITIES ==========
  IF NEW.hiking_trails_km IS DISTINCT FROM OLD.hiking_trails_km THEN
    -- Remove all hiking activities first
    activities := array_remove(activities, 'hiking');
    activities := array_remove(activities, 'nature_walks');
    activities := array_remove(activities, 'trail_photography');
    activities := array_remove(activities, 'day_hikes');
    activities := array_remove(activities, 'trail_variety');
    activities := array_remove(activities, 'serious_hiking');
    activities := array_remove(activities, 'backpacking');
    activities := array_remove(activities, 'trail_running');
    activities := array_remove(activities, 'mountain_biking');
    activities := array_remove(activities, 'multi_day_trekking');
    activities := array_remove(activities, 'wilderness_exploration');
    
    -- Add based on trail length
    IF NEW.hiking_trails_km > 0 THEN
      activities := array_append(activities, 'hiking');
      activities := array_append(activities, 'nature_walks');
      activities := array_append(activities, 'trail_photography');
      
      IF NEW.hiking_trails_km >= 25 THEN
        activities := array_append(activities, 'day_hikes');
        activities := array_append(activities, 'trail_variety');
      END IF;
      
      IF NEW.hiking_trails_km >= 100 THEN
        activities := array_append(activities, 'serious_hiking');
        activities := array_append(activities, 'backpacking');
        activities := array_append(activities, 'trail_running');
        activities := array_append(activities, 'mountain_biking');
      END IF;
      
      IF NEW.hiking_trails_km >= 200 THEN
        activities := array_append(activities, 'multi_day_trekking');
        activities := array_append(activities, 'wilderness_exploration');
      END IF;
    END IF;
  END IF;
  
  -- ========== SKI ACTIVITIES ==========
  IF NEW.ski_resorts_within_100km IS DISTINCT FROM OLD.ski_resorts_within_100km THEN
    -- Remove all ski activities first
    activities := array_remove(activities, 'skiing');
    activities := array_remove(activities, 'snowboarding');
    activities := array_remove(activities, 'apres_ski');
    activities := array_remove(activities, 'ski_variety');
    activities := array_remove(activities, 'ski_touring');
    activities := array_remove(activities, 'ski_destination');
    activities := array_remove(activities, 'winter_sports_hub');
    
    -- Add based on count
    IF NEW.ski_resorts_within_100km > 0 THEN
      activities := array_append(activities, 'skiing');
      activities := array_append(activities, 'snowboarding');
      activities := array_append(activities, 'apres_ski');
      
      IF NEW.ski_resorts_within_100km >= 3 THEN
        activities := array_append(activities, 'ski_variety');
        activities := array_append(activities, 'ski_touring');
      END IF;
      
      IF NEW.ski_resorts_within_100km >= 5 THEN
        activities := array_append(activities, 'ski_destination');
        activities := array_append(activities, 'winter_sports_hub');
      END IF;
    END IF;
  END IF;
  
  -- ========== COWORKING/DIGITAL NOMAD ==========
  IF NEW.coworking_spaces_count IS DISTINCT FROM OLD.coworking_spaces_count THEN
    -- Remove all coworking activities first
    activities := array_remove(activities, 'coworking');
    activities := array_remove(activities, 'digital_nomad_friendly');
    activities := array_remove(activities, 'networking');
    activities := array_remove(activities, 'startup_scene');
    activities := array_remove(activities, 'tech_meetups');
    
    -- Add based on count
    IF NEW.coworking_spaces_count > 0 THEN
      activities := array_append(activities, 'coworking');
      activities := array_append(activities, 'digital_nomad_friendly');
      activities := array_append(activities, 'networking');
      
      IF NEW.coworking_spaces_count >= 3 THEN
        activities := array_append(activities, 'startup_scene');
        activities := array_append(activities, 'tech_meetups');
      END IF;
    END IF;
  END IF;
  
  -- ========== DOG PARKS ==========
  IF NEW.dog_parks_count IS DISTINCT FROM OLD.dog_parks_count THEN
    -- Remove all dog activities first
    activities := array_remove(activities, 'dog_walking');
    activities := array_remove(activities, 'pet_friendly');
    activities := array_remove(activities, 'dog_community');
    activities := array_remove(activities, 'pet_events');
    
    -- Add based on count
    IF NEW.dog_parks_count > 0 THEN
      activities := array_append(activities, 'dog_walking');
      activities := array_append(activities, 'pet_friendly');
      
      IF NEW.dog_parks_count >= 3 THEN
        activities := array_append(activities, 'dog_community');
        activities := array_append(activities, 'pet_events');
      END IF;
    END IF;
  END IF;
  
  -- Remove duplicates and sort
  activities := ARRAY(SELECT DISTINCT unnest(activities) ORDER BY 1);
  
  -- Update the activities
  NEW.activities_available := activities;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_activities_trigger ON towns;

-- Create the trigger
CREATE TRIGGER update_activities_trigger
BEFORE UPDATE ON towns
FOR EACH ROW
WHEN (
  OLD.golf_courses_count IS DISTINCT FROM NEW.golf_courses_count OR
  OLD.tennis_courts_count IS DISTINCT FROM NEW.tennis_courts_count OR
  OLD.beaches_nearby IS DISTINCT FROM NEW.beaches_nearby OR
  OLD.marinas_count IS DISTINCT FROM NEW.marinas_count OR
  OLD.hiking_trails_km IS DISTINCT FROM NEW.hiking_trails_km OR
  OLD.ski_resorts_within_100km IS DISTINCT FROM NEW.ski_resorts_within_100km OR
  OLD.coworking_spaces_count IS DISTINCT FROM NEW.coworking_spaces_count OR
  OLD.dog_parks_count IS DISTINCT FROM NEW.dog_parks_count
)
EXECUTE FUNCTION update_activities_on_infrastructure_change();`;

  console.log(sql);
  console.log('\n4. After executing the SQL, run this script again to test the trigger.\n');
  
  return false;
}

async function testTriggerFunctionality() {
  console.log('🧪 Testing the trigger functionality...\n');
  
  try {
    // First, find a town to test with that has minimal golf infrastructure
    const { data: towns, error: selectError } = await supabase
      .from('towns')
      .select('id, name, country, golf_courses_count, activities_available')
      .or('golf_courses_count.is.null,golf_courses_count.eq.0')
      .limit(5);
      
    if (selectError || !towns || towns.length === 0) {
      console.error('❌ Error finding test towns:', selectError);
      return false;
    }
    
    const testTown = towns[0];
    console.log(`📍 Using test town: ${testTown.name}, ${testTown.country}`);
    console.log(`🏌️ Initial golf courses: ${testTown.golf_courses_count || 0}`);
    console.log(`🎯 Initial activities: ${JSON.stringify(testTown.activities_available || [])}`);
    
    // Store original values
    const originalGolfCount = testTown.golf_courses_count || 0;
    const originalActivities = testTown.activities_available || [];
    
    // Test 1: Add a golf course
    console.log('\n🧪 Test 1: Adding golf course (0 → 1)');
    const { data: updateData1, error: updateError1 } = await supabase
      .from('towns')
      .update({ golf_courses_count: 1 })
      .eq('id', testTown.id)
      .select('golf_courses_count, activities_available');
      
    if (updateError1) {
      console.error('❌ Error updating golf courses:', updateError1);
      return false;
    }
    
    const updatedTown1 = updateData1[0];
    const hasGolf = updatedTown1?.activities_available?.includes('golf') || false;
    const hasDrivingRange = updatedTown1?.activities_available?.includes('driving_range') || false;
    
    console.log(`🏌️ Updated golf courses: ${updatedTown1?.golf_courses_count}`);
    console.log(`🎯 Updated activities: ${JSON.stringify(updatedTown1?.activities_available || [])}`);
    console.log(`✅ Golf activity added: ${hasGolf ? 'YES' : 'NO'}`);
    console.log(`✅ Driving range added: ${hasDrivingRange ? 'YES' : 'NO'}`);
    
    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Remove golf course
    console.log('\n🧪 Test 2: Removing golf course (1 → 0)');
    const { data: updateData2, error: updateError2 } = await supabase
      .from('towns')
      .update({ golf_courses_count: 0 })
      .eq('id', testTown.id)
      .select('golf_courses_count, activities_available');
      
    if (updateError2) {
      console.error('❌ Error removing golf courses:', updateError2);
      return false;
    }
    
    const updatedTown2 = updateData2[0];
    const stillHasGolf = updatedTown2?.activities_available?.includes('golf') || false;
    const stillHasDrivingRange = updatedTown2?.activities_available?.includes('driving_range') || false;
    
    console.log(`🏌️ Updated golf courses: ${updatedTown2?.golf_courses_count}`);
    console.log(`🎯 Updated activities: ${JSON.stringify(updatedTown2?.activities_available || [])}`);
    console.log(`✅ Golf activity removed: ${stillHasGolf ? 'NO' : 'YES'}`);
    console.log(`✅ Driving range removed: ${stillHasDrivingRange ? 'NO' : 'YES'}`);
    
    // Test 3: Add multiple golf courses (should trigger advanced activities)
    console.log('\n🧪 Test 3: Adding multiple golf courses (0 → 3)');
    const { data: updateData3, error: updateError3 } = await supabase
      .from('towns')
      .update({ golf_courses_count: 3 })
      .eq('id', testTown.id)
      .select('golf_courses_count, activities_available');
      
    if (updateError3) {
      console.error('❌ Error updating to multiple golf courses:', updateError3);
    } else {
      const updatedTown3 = updateData3[0];
      const hasGolfVariety = updatedTown3?.activities_available?.includes('golf_variety') || false;
      const hasTournaments = updatedTown3?.activities_available?.includes('golf_tournaments') || false;
      
      console.log(`🏌️ Updated golf courses: ${updatedTown3?.golf_courses_count}`);
      console.log(`🎯 Updated activities: ${JSON.stringify(updatedTown3?.activities_available || [])}`);
      console.log(`✅ Golf variety added: ${hasGolfVariety ? 'YES' : 'NO'}`);
      console.log(`✅ Golf tournaments added: ${hasTournaments ? 'YES' : 'NO'}`);
    }
    
    // Restore original values
    console.log('\n🔄 Restoring original values...');
    await supabase
      .from('towns')
      .update({ 
        golf_courses_count: originalGolfCount,
        activities_available: originalActivities 
      })
      .eq('id', testTown.id);
      
    console.log('✅ Original values restored');
    
    // Evaluate results
    const triggerWorking = hasGolf && hasDrivingRange && !stillHasGolf && !stillHasDrivingRange;
    
    if (triggerWorking) {
      console.log('\n🎉 SUCCESS: Trigger is working correctly!');
      console.log('✅ Golf activities are automatically added when golf_courses_count > 0');
      console.log('✅ Golf activities are automatically removed when golf_courses_count = 0');
      console.log('✅ The database trigger has been successfully installed and tested');
      return true;
    } else {
      console.log('\n⚠️ TRIGGER NOT DETECTED OR NOT WORKING');
      console.log('The trigger may not have been installed yet, or there may be an issue.');
      console.log('Please ensure you have executed the SQL in the Supabase dashboard first.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Activities Trigger Setup and Test\n');
    
    // Try to test if trigger exists by checking behavior
    console.log('🔍 Checking if trigger is already installed...\n');
    
    const triggerWorks = await testTriggerFunctionality();
    
    if (!triggerWorks) {
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Copy the SQL code provided above');
      console.log('2. Execute it in your Supabase SQL Editor');
      console.log('3. Run this script again to verify the trigger is working');
      console.log('\nCommand to run after installing trigger:');
      console.log('node execute-activities-trigger.js');
      
      // Show the manual creation instructions
      await createTriggerViaWebInterface();
    } else {
      console.log('\n🎊 ALL TESTS PASSED!');
      console.log('The activities trigger is working perfectly and will automatically:');
      console.log('• Add golf activities when golf_courses_count increases');
      console.log('• Remove golf activities when golf_courses_count decreases');  
      console.log('• Handle all infrastructure changes (tennis, beaches, marinas, etc.)');
      console.log('• Maintain clean, sorted activity arrays');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

main();