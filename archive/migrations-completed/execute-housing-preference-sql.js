#!/usr/bin/env node

// Execute housing preference column addition using direct table operations
// This is a workaround since DDL operations are restricted via API

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkAndAddHousingPreference() {
  console.log('🔍 Checking if housing_preference column exists...\n');

  try {
    // First, try to check if the column already exists by querying user_preferences
    const { data: testData, error: testError } = await supabase
      .from('user_preferences')
      .select('housing_preference')
      .limit(1);

    if (!testError) {
      console.log('✅ housing_preference column already exists!');
      console.log('Column is accessible and ready to use.');
      
      // Show sample data if any exists
      if (testData && testData.length > 0) {
        console.log(`Sample value: ${testData[0].housing_preference || 'NULL'}`);
      }
      
      return true;
    }

    // If we get an error, it might mean the column doesn't exist
    console.log('Column appears to not exist. Error:', testError.message);
    
    // Check the table structure to see what columns exist
    console.log('\n🔍 Checking current table structure...');
    
    const { data: sampleRow, error: structureError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
      
    if (!structureError && sampleRow && sampleRow.length > 0) {
      console.log('Current columns in user_preferences:');
      Object.keys(sampleRow[0]).forEach(col => {
        console.log(`  - ${col}`);
      });
      
      if (!Object.keys(sampleRow[0]).includes('housing_preference')) {
        console.log('\n❌ housing_preference column is missing');
        console.log('\n📋 MANUAL ACTION REQUIRED:');
        console.log('The housing_preference column needs to be added via the Supabase dashboard.');
        console.log('Please execute this SQL in the Supabase SQL editor:');
        console.log('\nALTER TABLE user_preferences');
        console.log('ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT \'both\';');
        return false;
      }
    }

  } catch (err) {
    console.error('❌ Error checking table:', err.message);
    return false;
  }
}

// Also check if we can get any info about the table schema
async function getTableInfo() {
  console.log('\n🔍 Attempting to get table schema information...');
  
  try {
    // Try to get information about the user_preferences table
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(0); // Get structure without data
      
    if (error) {
      console.log('Could not access table structure:', error.message);
    } else {
      console.log('✅ Successfully connected to user_preferences table');
    }
  } catch (err) {
    console.log('Error accessing table info:', err.message);
  }
}

// Run the checks
async function main() {
  await getTableInfo();
  const columnExists = await checkAndAddHousingPreference();
  
  if (!columnExists) {
    console.log('\n⚠️  NEXT STEPS:');
    console.log('1. Go to https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Execute the SQL from /sql/add-housing-preference-column.sql');
    console.log('4. Run this script again to verify');
  }
}

main().catch(console.error);