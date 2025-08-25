#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER - HOBBIES ANALYSIS
// Analyze the hobbies data structure to see if normalized system exists or using legacy fields

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeHobbiesStructure() {
  console.log('🔍 Analyzing hobbies data structure...\n');

  try {
    // 1. Check if hobbies table exists
    console.log('1. Checking if hobbies table exists...');
    try {
      const { count: hobbiesCount, error: hobbiesError } = await supabase
        .from('hobbies')
        .select('*', { count: 'exact', head: true });

      if (hobbiesError) {
        if (hobbiesError.code === '42P01') {
          console.log('❌ hobbies table does not exist');
        } else {
          console.log('❌ Error accessing hobbies table:', hobbiesError.message);
        }
      } else {
        console.log(`✅ hobbies table exists with ${hobbiesCount} records`);
        
        // Get a sample of hobbies data
        const { data: hobbiesSample, error: sampleError } = await supabase
          .from('hobbies')
          .select('*')
          .limit(5);
        
        if (sampleError) {
          console.log('❌ Error getting hobbies sample:', sampleError.message);
        } else {
          console.log('📋 Sample hobbies data:');
          hobbiesSample.forEach(hobby => {
            console.log(`   - ID: ${hobby.id}, Name: ${hobby.name}, Category: ${hobby.category}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ hobbies table does not exist or is not accessible');
    }

    console.log('\n');

    // 2. Check if town_hobbies table exists
    console.log('2. Checking if town_hobbies table exists...');
    try {
      const { count: townHobbiesCount, error: townHobbiesError } = await supabase
        .from('town_hobbies')
        .select('*', { count: 'exact', head: true });

      if (townHobbiesError) {
        if (townHobbiesError.code === '42P01') {
          console.log('❌ town_hobbies table does not exist');
        } else {
          console.log('❌ Error accessing town_hobbies table:', townHobbiesError.message);
        }
      } else {
        console.log(`✅ town_hobbies table exists with ${townHobbiesCount} records`);
        
        // Get a sample of town_hobbies data
        const { data: townHobbiesSample, error: sampleError } = await supabase
          .from('town_hobbies')
          .select('*')
          .limit(5);
        
        if (sampleError) {
          console.log('❌ Error getting town_hobbies sample:', sampleError.message);
        } else {
          console.log('📋 Sample town_hobbies data:');
          townHobbiesSample.forEach(record => {
            console.log(`   - Town ID: ${record.town_id}, Hobby ID: ${record.hobby_id}, Available: ${record.available}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ town_hobbies table does not exist or is not accessible');
    }

    console.log('\n');

    // 3. Check user preferences hobbies structure
    console.log('3. Checking user preferences hobbies structure...');
    try {
      const { data: userPrefsSample, error: userPrefsError } = await supabase
        .from('user_preferences')
        .select('user_id, activities, interests, custom_activities, travel_frequency, lifestyle_importance')
        .not('activities', 'is', null)
        .limit(3);

      if (userPrefsError) {
        console.log('❌ Error accessing user_preferences:', userPrefsError.message);
      } else if (userPrefsSample.length === 0) {
        console.log('⚠️ No user preferences with activities found');
        
        // Check what columns actually exist
        const { data: allUserPrefs, error: allPrefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .limit(1);
        
        if (allPrefsError) {
          console.log('❌ Error getting user preferences structure:', allPrefsError.message);
        } else if (allUserPrefs.length > 0) {
          console.log('📋 Available user_preferences columns:');
          console.log('   ', Object.keys(allUserPrefs[0]).join(', '));
        }
      } else {
        console.log(`✅ Found ${userPrefsSample.length} user preferences with activities`);
        console.log('📋 Sample user preferences data:');
        userPrefsSample.forEach(pref => {
          console.log(`   - User: ${pref.user_id}`);
          console.log(`     Activities: ${JSON.stringify(pref.activities)}`);
          console.log(`     Interests: ${JSON.stringify(pref.interests)}`);
          console.log(`     Custom Activities: ${JSON.stringify(pref.custom_activities)}`);
          console.log(`     Travel Frequency: ${pref.travel_frequency}`);
          console.log(`     Lifestyle Importance: ${pref.lifestyle_importance}`);
        });
      }
    } catch (error) {
      console.log('❌ Error accessing user_preferences:', error.message);
    }

    console.log('\n');

    // 4. Check town hobbies/activities data
    console.log('4. Checking town hobbies/activities data...');
    try {
      const { data: townsSample, error: townsError } = await supabase
        .from('towns')
        .select('name, activities_available, interests_supported, outdoor_activities_rating, cultural_events_rating')
        .in('name', ['Lisbon', 'Athens', 'Vienna'])
        .limit(3);

      if (townsError) {
        console.log('❌ Error accessing towns activities data:', townsError.message);
      } else if (townsSample.length === 0) {
        console.log('⚠️ No towns found with specified names');
        
        // Get any towns with activities data
        const { data: anyTowns, error: anyTownsError } = await supabase
          .from('towns')
          .select('name, activities_available, interests_supported, outdoor_activities_rating, cultural_events_rating')
          .not('activities_available', 'is', null)
          .limit(3);
          
        if (anyTownsError) {
          console.log('❌ Error getting any towns with activities:', anyTownsError.message);
        } else if (anyTowns.length > 0) {
          console.log('📋 Sample towns with activities data:');
          anyTowns.forEach(town => {
            console.log(`   - ${town.name}:`);
            console.log(`     Activities Available: ${JSON.stringify(town.activities_available)}`);
            console.log(`     Interests Supported: ${JSON.stringify(town.interests_supported)}`);
            console.log(`     Outdoor Activities Rating: ${town.outdoor_activities_rating}`);
            console.log(`     Cultural Events Rating: ${town.cultural_events_rating}`);
          });
        } else {
          console.log('⚠️ No towns found with activities_available data');
        }
      } else {
        console.log(`✅ Found ${townsSample.length} towns with activities data`);
        console.log('📋 Town activities data:');
        townsSample.forEach(town => {
          console.log(`   - ${town.name}:`);
          console.log(`     Activities Available: ${JSON.stringify(town.activities_available)}`);
          console.log(`     Interests Supported: ${JSON.stringify(town.interests_supported)}`);
          console.log(`     Outdoor Activities Rating: ${town.outdoor_activities_rating}`);
          console.log(`     Cultural Events Rating: ${town.cultural_events_rating}`);
        });
      }
    } catch (error) {
      console.log('❌ Error accessing towns data:', error.message);
    }

    console.log('\n');

    // Summary
    console.log('📊 SUMMARY:');
    console.log('============');
    
    // Check which approach is being used
    try {
      const { count: hobbiesCount } = await supabase
        .from('hobbies')
        .select('*', { count: 'exact', head: true });
      
      const { count: townHobbiesCount } = await supabase
        .from('town_hobbies')
        .select('*', { count: 'exact', head: true });
        
      if (hobbiesCount && townHobbiesCount && hobbiesCount > 0 && townHobbiesCount > 0) {
        console.log('✅ NORMALIZED HOBBIES SYSTEM IS IMPLEMENTED');
        console.log(`   - ${hobbiesCount} hobbies in master table`);
        console.log(`   - ${townHobbiesCount} town-hobby relationships`);
      } else {
        console.log('❌ NORMALIZED HOBBIES SYSTEM NOT IMPLEMENTED');
        console.log('   - Using legacy activities_available/interests_supported fields');
      }
    } catch (error) {
      console.log('❌ NORMALIZED HOBBIES SYSTEM NOT IMPLEMENTED');
      console.log('   - Using legacy activities_available/interests_supported fields');
    }

  } catch (error) {
    console.error('❌ Unexpected error during analysis:', error);
  }

  console.log('\n✅ Hobbies structure analysis completed!');
}

// Run the analysis
analyzeHobbiesStructure().catch(console.error);