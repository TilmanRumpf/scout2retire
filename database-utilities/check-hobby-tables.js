#!/usr/bin/env node

// HOBBY TABLES INVESTIGATION
// Check what hobby-related tables exist and their current state

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function investigateHobbyTables() {
  console.log('🎯 HOBBY TABLES INVESTIGATION');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check what hobby-related tables exist
    console.log('\n1️⃣ CHECKING HOBBY-RELATED TABLES...');
    console.log('─'.repeat(40));
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names_like_hobby');
    
    // Since RPC might not exist, let's use a raw SQL query instead
    const { data: hobbyTables, error: hobbyTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .or('table_name.like.%hobb%,table_name.eq.hobbies')
      .order('table_name');

    if (hobbyTablesError) {
      console.log('⚠️ Could not query information_schema directly');
      console.log('Let\'s check common hobby table names...');
      
      // Check common hobby table names
      const possibleTables = ['hobbies', 'towns_hobbies', 'user_hobbies'];
      
      for (const tableName of possibleTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            console.log(`✅ Table exists: ${tableName}`);
          }
        } catch (err) {
          console.log(`❌ Table does not exist: ${tableName}`);
        }
      }
    } else {
      console.log('Found hobby-related tables:');
      hobbyTables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    }

    // 2. Check towns_hobbies table
    console.log('\n2️⃣ CHECKING TOWNS_HOBBIES TABLE...');
    console.log('─'.repeat(40));
    
    try {
      // Get counts from towns_hobbies
      const { data: townHobbiesCount, error: countError } = await supabase
        .from('towns_hobbies')
        .select('town_id, hobby_id', { count: 'exact' });

      if (countError) {
        console.log('❌ towns_hobbies table does not exist or is inaccessible');
        console.log('Error:', countError.message);
      } else {
        console.log(`📊 Total records in towns_hobbies: ${townHobbiesCount?.length || 0}`);
        
        // Get unique counts
        const { data: uniqueTowns, error: uniqueTownsError } = await supabase
          .from('towns_hobbies')
          .select('town_id')
          .neq('town_id', null);
        
        const { data: uniqueHobbies, error: uniqueHobbiesError } = await supabase
          .from('towns_hobbies')
          .select('hobby_id')
          .neq('hobby_id', null);

        if (!uniqueTownsError && !uniqueHobbiesError) {
          const uniqueTownIds = [...new Set(uniqueTowns.map(t => t.town_id))];
          const uniqueHobbyIds = [...new Set(uniqueHobbies.map(h => h.hobby_id))];
          
          console.log(`🏘️ Unique towns with hobbies: ${uniqueTownIds.length}`);
          console.log(`🎨 Unique hobby IDs: ${uniqueHobbyIds.length}`);
        }

        // Sample data
        const { data: sampleData, error: sampleError } = await supabase
          .from('towns_hobbies')
          .select('*')
          .limit(10);

        if (!sampleError) {
          console.log('\n📋 Sample data from towns_hobbies:');
          sampleData.forEach((row, index) => {
            console.log(`${index + 1}. Town ID: ${row.town_id}, Hobby ID: ${row.hobby_id}`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Error checking towns_hobbies:', err.message);
    }

    // 3. Check hobbies reference table
    console.log('\n3️⃣ CHECKING HOBBIES REFERENCE TABLE...');
    console.log('─'.repeat(40));
    
    try {
      const { data: hobbiesCount, error: hobbiesCountError } = await supabase
        .from('hobbies')
        .select('*', { count: 'exact' });

      if (hobbiesCountError) {
        console.log('❌ hobbies table does not exist or is inaccessible');
        console.log('Error:', hobbiesCountError.message);
      } else {
        console.log(`📊 Total hobbies in reference table: ${hobbiesCount?.length || 0}`);
        
        // Check for universal vs location-specific
        const { data: universalCount, error: universalError } = await supabase
          .from('hobbies')
          .select('*')
          .eq('is_universal', true);

        const { data: locationSpecificCount, error: locationError } = await supabase
          .from('hobbies')
          .select('*')
          .eq('is_universal', false);

        if (!universalError && !locationError) {
          console.log(`🌍 Universal hobbies: ${universalCount?.length || 0}`);
          console.log(`📍 Location-specific hobbies: ${locationSpecificCount?.length || 0}`);
        }

        // Sample hobbies data
        const { data: sampleHobbies, error: sampleHobbiesError } = await supabase
          .from('hobbies')
          .select('*')
          .limit(10);

        if (!sampleHobbiesError) {
          console.log('\n📋 Sample hobbies:');
          sampleHobbies.forEach((hobby, index) => {
            console.log(`${index + 1}. ID: ${hobby.id}, Name: "${hobby.name}", Universal: ${hobby.is_universal}`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Error checking hobbies table:', err.message);
    }

    // 4. Check if there are hobby columns in other tables
    console.log('\n4️⃣ CHECKING FOR HOBBY COLUMNS IN OTHER TABLES...');
    console.log('─'.repeat(40));
    
    // Check towns table for hobby-related columns
    try {
      const { data: townSample, error: townError } = await supabase
        .from('towns')
        .select('*')
        .limit(1);

      if (!townError && townSample.length > 0) {
        const town = townSample[0];
        const hobbyColumns = Object.keys(town).filter(col => 
          col.toLowerCase().includes('hobby') || 
          col.toLowerCase().includes('activit') ||
          col.toLowerCase().includes('interest')
        );
        
        if (hobbyColumns.length > 0) {
          console.log('🏘️ Hobby-related columns in towns table:');
          hobbyColumns.forEach(col => console.log(`   - ${col}`));
        } else {
          console.log('❌ No hobby-related columns found in towns table');
        }
      }
    } catch (err) {
      console.log('❌ Error checking towns table:', err.message);
    }

    // Check user_preferences for hobby data
    try {
      const { data: userPrefSample, error: userPrefError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1);

      if (!userPrefError && userPrefSample.length > 0) {
        const userPref = userPrefSample[0];
        const hobbyColumns = Object.keys(userPref).filter(col => 
          col.toLowerCase().includes('hobby') || 
          col.toLowerCase().includes('activit') ||
          col.toLowerCase().includes('interest')
        );
        
        if (hobbyColumns.length > 0) {
          console.log('👤 Hobby-related columns in user_preferences table:');
          hobbyColumns.forEach(col => console.log(`   - ${col}`));
          
          // Show sample data for these columns
          hobbyColumns.forEach(col => {
            const value = userPref[col];
            console.log(`   ${col}: ${JSON.stringify(value)}`);
          });
        } else {
          console.log('❌ No hobby-related columns found in user_preferences table');
        }
      }
    } catch (err) {
      console.log('❌ Error checking user_preferences table:', err.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error during investigation:', error);
  }

  console.log('\n✅ Hobby tables investigation completed!');
}

// Run the investigation
investigateHobbyTables().catch(console.error);