#!/usr/bin/env node

// DETAILED HOBBY DATA ANALYSIS
// Get comprehensive details about hobby tables and data relationships

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function analyzeHobbyData() {
  console.log('🔍 DETAILED HOBBY DATA ANALYSIS');
  console.log('=' .repeat(60));

  try {
    // 1. Detailed analysis of hobbies reference table
    console.log('\n1️⃣ HOBBIES REFERENCE TABLE ANALYSIS...');
    console.log('─'.repeat(40));
    
    const { data: allHobbies, error: hobbiesError } = await supabase
      .from('hobbies')
      .select('*')
      .order('name');

    if (hobbiesError) {
      console.log('❌ Error fetching hobbies:', hobbiesError.message);
    } else {
      console.log(`📊 Total hobbies: ${allHobbies.length}`);
      
      // Categorize by universal vs location-specific
      const universal = allHobbies.filter(h => h.is_universal === true);
      const locationSpecific = allHobbies.filter(h => h.is_universal === false);
      
      console.log(`🌍 Universal hobbies: ${universal.length}`);
      console.log(`📍 Location-specific hobbies: ${locationSpecific.length}`);

      console.log('\n🌍 UNIVERSAL HOBBIES (first 20):');
      universal.slice(0, 20).forEach((hobby, index) => {
        console.log(`   ${index + 1}. ${hobby.name} (ID: ${hobby.id})`);
      });

      console.log('\n📍 LOCATION-SPECIFIC HOBBIES (first 20):');
      locationSpecific.slice(0, 20).forEach((hobby, index) => {
        console.log(`   ${index + 1}. ${hobby.name} (ID: ${hobby.id})`);
      });

      // Check for any additional fields
      if (allHobbies.length > 0) {
        const sampleHobby = allHobbies[0];
        const fields = Object.keys(sampleHobby);
        console.log('\n📋 Available fields in hobbies table:');
        fields.forEach(field => console.log(`   - ${field}`));
      }
    }

    // 2. User hobbies analysis
    console.log('\n2️⃣ USER_HOBBIES TABLE ANALYSIS...');
    console.log('─'.repeat(40));
    
    const { data: userHobbies, error: userHobbiesError } = await supabase
      .from('user_hobbies')
      .select('*');

    if (userHobbiesError) {
      console.log('❌ Error fetching user_hobbies:', userHobbiesError.message);
    } else {
      console.log(`📊 Total user-hobby relationships: ${userHobbies.length}`);
      
      if (userHobbies.length > 0) {
        // Get unique users and hobbies
        const uniqueUsers = [...new Set(userHobbies.map(uh => uh.user_id))];
        const uniqueHobbyIds = [...new Set(userHobbies.map(uh => uh.hobby_id))];
        
        console.log(`👥 Users with hobbies: ${uniqueUsers.length}`);
        console.log(`🎯 Hobbies selected by users: ${uniqueHobbyIds.length}`);

        // Show sample data
        console.log('\n📋 Sample user_hobbies records:');
        userHobbies.slice(0, 10).forEach((record, index) => {
          console.log(`   ${index + 1}. User: ${record.user_id}, Hobby: ${record.hobby_id}`);
        });

        // Check table structure
        const sampleRecord = userHobbies[0];
        const fields = Object.keys(sampleRecord);
        console.log('\n📋 Available fields in user_hobbies table:');
        fields.forEach(field => console.log(`   - ${field}`));
      } else {
        console.log('❌ No user hobby relationships found');
      }
    }

    // 3. Check towns table hobby-related columns in detail
    console.log('\n3️⃣ TOWNS TABLE HOBBY COLUMNS ANALYSIS...');
    console.log('─'.repeat(40));
    
    const { data: townSamples, error: townSamplesError } = await supabase
      .from('towns')
      .select('id, name, activities_available, interests_supported, activity_infrastructure, outdoor_activities_rating')
      .limit(10);

    if (townSamplesError) {
      console.log('❌ Error fetching town hobby data:', townSamplesError.message);
    } else {
      console.log('📋 Sample towns hobby-related data:');
      townSamples.forEach((town, index) => {
        console.log(`\n   ${index + 1}. ${town.name} (ID: ${town.id})`);
        console.log(`      Activities Available: ${JSON.stringify(town.activities_available)}`);
        console.log(`      Interests Supported: ${JSON.stringify(town.interests_supported)}`);
        console.log(`      Activity Infrastructure: ${town.activity_infrastructure}`);
        console.log(`      Outdoor Activities Rating: ${town.outdoor_activities_rating}`);
      });

      // Check how many towns have hobby data
      const { data: townCounts, error: townCountsError } = await supabase
        .from('towns')
        .select('id')
        .not('activities_available', 'is', null);

      const { data: interestCounts, error: interestCountsError } = await supabase
        .from('towns')
        .select('id')
        .not('interests_supported', 'is', null);

      if (!townCountsError && !interestCountsError) {
        console.log(`\n📊 Towns with activities_available data: ${townCounts?.length || 0}`);
        console.log(`📊 Towns with interests_supported data: ${interestCounts?.length || 0}`);
      }
    }

    // 4. Check user_preferences hobby columns in detail
    console.log('\n4️⃣ USER_PREFERENCES HOBBY COLUMNS ANALYSIS...');
    console.log('─'.repeat(40));
    
    const { data: userPrefSamples, error: userPrefSamplesError } = await supabase
      .from('user_preferences')
      .select('user_id, activities, interests, custom_activities')
      .limit(10);

    if (userPrefSamplesError) {
      console.log('❌ Error fetching user preference hobby data:', userPrefSamplesError.message);
    } else {
      console.log('📋 Sample user preference hobby data:');
      userPrefSamples.forEach((userPref, index) => {
        console.log(`\n   ${index + 1}. User ID: ${userPref.user_id}`);
        console.log(`      Activities: ${JSON.stringify(userPref.activities)}`);
        console.log(`      Interests: ${JSON.stringify(userPref.interests)}`);
        console.log(`      Custom Activities: ${JSON.stringify(userPref.custom_activities)}`);
      });

      // Check how many users have hobby preferences
      const { data: activitiesCounts, error: activitiesCountsError } = await supabase
        .from('user_preferences')
        .select('user_id')
        .not('activities', 'is', null);

      const { data: interestsUserCounts, error: interestsUserCountsError } = await supabase
        .from('user_preferences')
        .select('user_id')
        .not('interests', 'is', null);

      if (!activitiesCountsError && !interestsUserCountsError) {
        console.log(`\n📊 Users with activities preferences: ${activitiesCounts?.length || 0}`);
        console.log(`📊 Users with interests preferences: ${interestsUserCounts?.length || 0}`);
      }
    }

    // 5. Look for any relationship between hobby reference table and actual usage
    console.log('\n5️⃣ HOBBY USAGE ANALYSIS...');
    console.log('─'.repeat(40));
    
    if (userHobbies && userHobbies.length > 0 && allHobbies && allHobbies.length > 0) {
      // Count which hobbies are most popular
      const hobbyUsage = new Map();
      
      userHobbies.forEach(uh => {
        const count = hobbyUsage.get(uh.hobby_id) || 0;
        hobbyUsage.set(uh.hobby_id, count + 1);
      });

      // Get hobby names for the most used hobbies
      const sortedUsage = Array.from(hobbyUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      console.log('🏆 TOP 10 MOST POPULAR HOBBIES:');
      for (const [hobbyId, count] of sortedUsage) {
        const hobby = allHobbies.find(h => h.id === hobbyId);
        const hobbyName = hobby ? hobby.name : 'Unknown';
        const isUniversal = hobby ? hobby.is_universal : 'Unknown';
        console.log(`   ${hobbyName} (${isUniversal ? 'Universal' : 'Location-specific'}) - ${count} users`);
      }

      // Check which hobbies are not used at all
      const usedHobbyIds = new Set(userHobbies.map(uh => uh.hobby_id));
      const unusedHobbies = allHobbies.filter(h => !usedHobbyIds.has(h.id));
      
      console.log(`\n📊 Unused hobbies: ${unusedHobbies.length} out of ${allHobbies.length} total`);
      if (unusedHobbies.length > 0) {
        console.log('🚫 UNUSED HOBBIES (first 10):');
        unusedHobbies.slice(0, 10).forEach((hobby, index) => {
          console.log(`   ${index + 1}. ${hobby.name} (${hobby.is_universal ? 'Universal' : 'Location-specific'})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error during detailed analysis:', error);
  }

  console.log('\n✅ Detailed hobby data analysis completed!');
}

// Run the analysis
analyzeHobbyData().catch(console.error);