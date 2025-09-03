#!/usr/bin/env node

// Check hobbies-related database schema and relationships
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkHobbiesSchema() {
  console.log('🔍 CHECKING HOBBIES DATABASE SCHEMA');
  console.log('=' .repeat(80));
  
  try {
    // 1. Check user_hobbies table
    console.log('\n📊 USER_HOBBIES TABLE SCHEMA:');
    console.log('-'.repeat(40));
    
    const { data: userHobbiesSchema, error: uhError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'user_hobbies'
          ORDER BY ordinal_position
        `
      });
    
    if (uhError) {
      // Try direct query
      const { data: userHobbies, error } = await supabase
        .from('user_hobbies')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ user_hobbies table not found or not accessible');
      } else {
        console.log('✅ user_hobbies table exists');
        if (userHobbies && userHobbies[0]) {
          console.log('Columns:', Object.keys(userHobbies[0]));
        }
      }
    } else {
      userHobbiesSchema?.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
      });
    }
    
    // 2. Check towns_hobbies table
    console.log('\n📊 TOWNS_HOBBIES TABLE SCHEMA:');
    console.log('-'.repeat(40));
    
    const { data: townsHobbiesSchema, error: thError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'towns_hobbies'
          ORDER BY ordinal_position
        `
      });
    
    if (thError) {
      // Try direct query
      const { data: townsHobbies, error } = await supabase
        .from('towns_hobbies')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ towns_hobbies table not found or not accessible');
        console.log('Error:', error.message);
      } else {
        console.log('✅ towns_hobbies table exists');
        if (townsHobbies && townsHobbies[0]) {
          console.log('Columns:', Object.keys(townsHobbies[0]));
        }
      }
    } else {
      townsHobbiesSchema?.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
      });
    }
    
    // 3. Get sample data from towns_hobbies
    console.log('\n📊 SAMPLE DATA FROM TOWNS_HOBBIES:');
    console.log('-'.repeat(40));
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('towns_hobbies')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.log('❌ Could not fetch sample data:', sampleError.message);
    } else if (sampleData && sampleData.length > 0) {
      console.log(`Found ${sampleData.length} sample records:`);
      sampleData.forEach((record, i) => {
        console.log(`\nRecord ${i + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      });
    } else {
      console.log('⚠️ No data found in towns_hobbies table');
    }
    
    // 4. Check hobbies reference table
    console.log('\n📊 HOBBIES REFERENCE TABLE INFO:');
    console.log('-'.repeat(40));
    
    const { data: hobbiesCount, error: hcError } = await supabase
      .from('hobbies')
      .select('*', { count: 'exact', head: true });
    
    if (!hcError) {
      console.log(`Total hobbies in reference table: ${hobbiesCount}`);
    }
    
    // 5. Check for user_hobbies sample
    console.log('\n📊 SAMPLE DATA FROM USER_HOBBIES:');
    console.log('-'.repeat(40));
    
    const { data: userHobbiesSample, error: uhSampleError } = await supabase
      .from('user_hobbies')
      .select('*')
      .limit(5);
    
    if (uhSampleError) {
      console.log('❌ Could not fetch user_hobbies data:', uhSampleError.message);
    } else if (userHobbiesSample && userHobbiesSample.length > 0) {
      console.log(`Found ${userHobbiesSample.length} sample records:`);
      userHobbiesSample.forEach((record, i) => {
        console.log(`\nRecord ${i + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      });
    } else {
      console.log('⚠️ No data found in user_hobbies table');
    }
    
    // 6. Check relationships
    console.log('\n📊 CHECKING RELATIONSHIPS:');
    console.log('-'.repeat(40));
    
    // Check if we can join tables
    const { data: joinTest, error: joinError } = await supabase
      .from('hobbies')
      .select(`
        id,
        name,
        category,
        is_universal,
        towns_hobbies!inner(town_id)
      `)
      .limit(3);
    
    if (joinError) {
      console.log('❌ Could not test join:', joinError.message);
    } else if (joinTest) {
      console.log('✅ Successfully joined hobbies with towns_hobbies');
      console.log(`Sample joined data: ${joinTest.length} records`);
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

// Run the check
checkHobbiesSchema();