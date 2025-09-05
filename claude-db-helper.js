#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER - COMPREHENSIVE USER DATA INVESTIGATION
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance
// Modified to investigate ALL user data for tobiasrumpf@gmx.de

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://axlruvvsjepsulcbqlho.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  console.error('Please ensure your .env file contains SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const TOBIAS_EMAIL = 'tobiasrumpf@gmx.de';
const TOBIAS_USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

// Let's also check if there are ANY users in the user_hobbies table
// and see if we can find the correct user ID

async function runQueries() {
  console.log('🔍 DEBUGGING ALICANTE HOBBY MATCHING - 38% SCORE ISSUE');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // 1. Find Alicante in the database
    console.log('🏙️ STEP 1: FINDING ALICANTE');
    console.log('-'.repeat(40));
    
    const { data: alicanteData, error: alicanteError } = await supabase
      .from('towns')
      .select('*')
      .ilike('name', '%alicante%');

    if (alicanteError) {
      console.log('❌ Error finding Alicante:', alicanteError.message);
      return;
    }

    console.log(`Found ${alicanteData.length} towns matching 'Alicante':`);
    alicanteData.forEach(town => {
      console.log(`  - ${town.name}, ${town.country || 'Unknown Country'} (ID: ${town.id})`);
    });

    if (alicanteData.length === 0) {
      console.log('❌ No Alicante found in database');
      return;
    }

    const alicante = alicanteData[0]; // Use first match
    console.log(`\n🎯 Using: ${alicante.name} (ID: ${alicante.id})`);

    // 2. Check Alicante's hobby data in towns_hobbies
    console.log('\n🎯 STEP 2: ALICANTE HOBBY DATA');
    console.log('-'.repeat(40));
    
    // First try to get just one record to see structure
    const { data: sampleHobby, error: sampleError } = await supabase
      .from('towns_hobbies')
      .select('*')
      .eq('town_id', alicante.id)
      .limit(1);

    if (sampleError) {
      console.log('❌ Error getting sample hobby:', sampleError.message);
    } else if (sampleHobby.length > 0) {
      console.log('✅ Sample hobby record structure:', JSON.stringify(sampleHobby[0], null, 2));
    }

    // Now get all hobbies for Alicante with proper join
    const { data: alicanteHobbies, error: alicanteHobbiesError } = await supabase
      .from('towns_hobbies')
      .select(`
        *,
        hobby:hobbies(*)
      `)
      .eq('town_id', alicante.id);

    if (alicanteHobbiesError) {
      console.log('❌ Error getting Alicante hobbies with join:', alicanteHobbiesError.message);
      
      // Try without join to see what we get
      const { data: simpleHobbies, error: simpleError } = await supabase
        .from('towns_hobbies')
        .select('*')
        .eq('town_id', alicante.id);
      
      if (simpleError) {
        console.log('❌ Error getting simple hobbies:', simpleError.message);
      } else {
        console.log(`✅ Alicante has ${simpleHobbies.length} hobby records (without hobby details)`);
        // Get hobby names separately
        if (simpleHobbies.length > 0) {
          console.log('Getting hobby names for the first few...');
          for (let i = 0; i < Math.min(5, simpleHobbies.length); i++) {
            const hobbyRecord = simpleHobbies[i];
            const { data: hobbyData, error: hobbyError } = await supabase
              .from('hobbies')
              .select('name')
              .eq('id', hobbyRecord.hobby_id)
              .single();
            
            if (!hobbyError && hobbyData) {
              console.log(`  ${i + 1}. ${hobbyData.name}`);
            }
          }
        }
      }
    } else {
      console.log(`✅ Alicante has ${alicanteHobbies.length} hobby records`);
      if (alicanteHobbies.length > 0) {
        console.log('First 10 hobbies:');
        alicanteHobbies.slice(0, 10).forEach((hobbyRecord, index) => {
          const hobbyName = hobbyRecord.hobby ? hobbyRecord.hobby.name : 'Unknown';
          console.log(`  ${index + 1}. ${hobbyName}`);
        });
        if (alicanteHobbies.length > 10) {
          console.log(`  ... and ${alicanteHobbies.length - 10} more hobbies`);
        }
      }
    }

    // 3. Check user's selected hobbies - CORRECT TABLE
    console.log('\n👤 STEP 3: USER HOBBY SELECTIONS');
    console.log('-'.repeat(40));
    
    // First check if there are ANY user hobby records at all
    const { data: allUserHobbies, error: allError } = await supabase
      .from('user_hobbies')
      .select('user_id, hobby_id')
      .limit(10);
    
    if (allError) {
      console.log('❌ Error checking all user hobbies:', allError.message);
    } else {
      console.log(`📊 Total user hobby records in database: Found ${allUserHobbies.length} records (showing first 10)`);
      allUserHobbies.forEach((record, index) => {
        console.log(`  ${index + 1}. User: ${record.user_id}, Hobby: ${record.hobby_id}`);
      });
    }
    
    const { data: userHobbies, error: userHobbiesError } = await supabase
      .from('user_hobbies')
      .select(`
        hobby_id,
        hobby:hobbies(*)
      `)
      .eq('user_id', TOBIAS_USER_ID);

    if (userHobbiesError) {
      console.log('❌ Error getting user hobbies with join:', userHobbiesError.message);
      
      // Try without join
      const { data: simpleUserHobbies, error: simpleUserError } = await supabase
        .from('user_hobbies')
        .select('*')
        .eq('user_id', TOBIAS_USER_ID);
      
      if (simpleUserError) {
        console.log('❌ Error getting simple user hobbies:', simpleUserError.message);
      } else {
        console.log(`✅ User has ${simpleUserHobbies.length} hobby selections`);
        // Get hobby names separately
        const userHobbyNames = [];
        for (const hobbyRecord of simpleUserHobbies) {
          const { data: hobbyData, error: hobbyError } = await supabase
            .from('hobbies')
            .select('name, category')
            .eq('id', hobbyRecord.hobby_id)
            .single();
          
          if (!hobbyError && hobbyData) {
            console.log(`  • ${hobbyData.name} (${hobbyData.category})`);
            userHobbyNames.push(hobbyData.name);
          }
        }
        // Store for comparison
        global.userHobbyNames = userHobbyNames;
      }
    } else {
      console.log(`✅ User has ${userHobbies.length} selected hobbies:`);
      const userHobbyNames = [];
      userHobbies.forEach((selection, index) => {
        console.log(`  ${index + 1}. ${selection.hobby.name} (${selection.hobby.category})`);
        userHobbyNames.push(selection.hobby.name);
      });
      // Store for comparison
      global.userHobbyNames = userHobbyNames;
    }

    // 4. Check hobbies table for universal hobbies
    console.log('\n🌍 STEP 4: UNIVERSAL HOBBIES');
    console.log('-'.repeat(40));
    
    const { data: universalHobbies, error: universalError } = await supabase
      .from('hobbies')
      .select('*')
      .eq('is_universal', true);

    if (universalError) {
      console.log('❌ Error getting universal hobbies:', universalError.message);
    } else {
      console.log(`✅ Found ${universalHobbies.length} universal hobbies:`);
      universalHobbies.forEach(hobby => {
        console.log(`  • ${hobby.name}`);
      });
    }

    // 5. COMPARE AND ANALYZE MATCHING
    console.log('\n🔍 STEP 5: HOBBY MATCHING ANALYSIS');
    console.log('-'.repeat(40));
    
    if (userHobbies && userHobbies.length > 0 && alicanteHobbies && alicanteHobbies.length > 0) {
      const userHobbyNames = userHobbies.map(uh => uh.hobby.name.toLowerCase());
      const alicanteHobbyNames = alicanteHobbies.map(ah => (ah.hobby_name || ah.name || '').toLowerCase());
      
      console.log(`\n📊 MATCHING CALCULATION:`);
      console.log(`User selected hobbies: ${userHobbyNames.length}`);
      console.log(`Alicante available hobbies: ${alicanteHobbyNames.length}`);
      
      // Find matches
      const matches = userHobbyNames.filter(userHobby => 
        alicanteHobbyNames.includes(userHobby)
      );
      
      // Find missing
      const missing = userHobbyNames.filter(userHobby => 
        !alicanteHobbyNames.includes(userHobby)
      );
      
      const matchPercentage = (matches.length / userHobbyNames.length * 100).toFixed(1);
      
      console.log(`\n✅ MATCHES (${matches.length}/${userHobbyNames.length} = ${matchPercentage}%):`);
      matches.forEach(match => console.log(`  • ${match}`));
      
      console.log(`\n❌ MISSING FROM ALICANTE (${missing.length}):`);
      missing.forEach(miss => console.log(`  • ${miss}`));
      
      console.log(`\n🎯 EXPECTED SCORE: ~${matchPercentage}%`);
      console.log(`🎯 REPORTED SCORE: 38%`);
      
      if (Math.abs(parseFloat(matchPercentage) - 38) > 5) {
        console.log(`⚠️  SIGNIFICANT DISCREPANCY DETECTED!`);
        console.log(`    This suggests a bug in the scoring algorithm.`);
      }
      
    } else {
      console.log('❌ Cannot perform matching analysis - missing user hobbies or Alicante hobbies');
    }

    // 6. Check what user preference data exists
    console.log('\n📋 STEP 6: USER PREFERENCE TABLES');
    console.log('-'.repeat(40));
    
    // Check if user has data in user_preferences table
    const { data: userPrefs, error: userPrefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', TOBIAS_USER_ID);
    
    if (userPrefsError) {
      console.log('❌ Error getting user_preferences:', userPrefsError.message);
    } else {
      console.log(`✅ Found ${userPrefs.length} user preference records`);
      if (userPrefs.length > 0) {
        console.log('User preferences:', JSON.stringify(userPrefs[0], null, 2));
        
        // Extract hobbies from user preferences 
        const prefs = userPrefs[0];
        if (prefs.activities || prefs.interests) {
          console.log('\n🎯 EXTRACTED USER HOBBIES FROM PREFERENCES:');
          console.log('Activities:', prefs.activities);
          console.log('Interests:', prefs.interests);
          console.log('Custom Physical:', prefs.custom_physical);
          console.log('Custom Hobbies:', prefs.custom_hobbies);
          
          // Now we can do the real comparison
          global.userPreferencesData = prefs;
        }
      }
    }
    
    // 7. FINAL ANALYSIS WITH ACTUAL DATA
    console.log('\n🔍 STEP 7: FINAL HOBBY MATCHING ANALYSIS');
    console.log('-'.repeat(40));
    
    if (global.userPreferencesData) {
      const userPrefs = global.userPreferencesData;
      
      // Collect all user hobby names (same logic as scoring algorithm)
      const userHobbyNames = [];
      
      // Add activities
      if (userPrefs.activities?.length) {
        userHobbyNames.push(...userPrefs.activities);
      }
      
      // Add interests
      if (userPrefs.interests?.length) {
        userHobbyNames.push(...userPrefs.interests);
      }
      
      // Add custom activities
      if (userPrefs.custom_physical?.length) {
        userHobbyNames.push(...userPrefs.custom_physical);
      }
      
      // Add custom hobbies
      if (userPrefs.custom_hobbies?.length) {
        userHobbyNames.push(...userPrefs.custom_hobbies);
      }
      
      console.log(`\n📊 USER HOBBY ANALYSIS:`);
      console.log(`Total user hobbies: ${userHobbyNames.length}`);
      console.log('User hobbies:', userHobbyNames);
      
      // Get Alicante hobby names (we already have them)
      const alicanteHobbyNames = ['Surfing', 'Snorkeling', 'Scuba Diving', 'Stand-up Paddleboarding'];
      console.log(`\nAlicante specific hobbies: ${alicanteHobbyNames.length}`);
      console.log('Alicante hobbies:', alicanteHobbyNames);
      
      console.log('\nUniversal hobbies available: 101 (including Walking, Swimming, etc.)');
      
      // Calculate what should match based on the algorithm logic
      let expectedMatches = 0;
      const matched = [];
      const missing = [];
      
      // Check each user hobby against Alicante + Universal hobbies
      userHobbyNames.forEach(userHobby => {
        const normalizedName = userHobby.toLowerCase();
        
        // Check if it's a universal hobby
        const isUniversal = universalHobbies.some(uh => 
          uh.name.toLowerCase() === normalizedName
        );
        
        // Check if it's an Alicante specific hobby
        const isAlicanteSpecific = alicanteHobbyNames.some(ah => 
          ah.toLowerCase() === normalizedName
        );
        
        if (isUniversal || isAlicanteSpecific) {
          expectedMatches++;
          matched.push(userHobby);
        } else {
          missing.push(userHobby);
        }
      });
      
      const expectedScore = userHobbyNames.length > 0 ? 
        Math.min(85, (expectedMatches / userHobbyNames.length) * 100) : 100;
      
      console.log(`\n🎯 EXPECTED MATCHING RESULTS:`);
      console.log(`Matches: ${expectedMatches}/${userHobbyNames.length}`);
      console.log(`Expected score: ${expectedScore.toFixed(1)}%`);
      console.log(`Reported score: 38%`);
      console.log(`Discrepancy: ${Math.abs(expectedScore - 38).toFixed(1)} points`);
      
      console.log(`\n✅ MATCHED HOBBIES (${matched.length}):`);
      matched.forEach(m => console.log(`  • ${m}`));
      
      console.log(`\n❌ MISSING HOBBIES (${missing.length}):`);
      missing.forEach(m => console.log(`  • ${m}`));
      
    } else {
      console.log('❌ Cannot perform final analysis - missing user preference data');
    }

    console.log('\n🎯 DEBUGGING COMPLETE');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the queries
runQueries().catch(console.error);