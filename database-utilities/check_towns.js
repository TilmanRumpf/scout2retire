#!/usr/bin/env node

// Import required modules
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('   - VITE_SUPABASE_URL');
  if (!supabaseAnonKey) console.error('   - VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main function to check towns
async function checkTowns() {
  console.log('🔍 Checking towns in Scout2Retire database...\n');

  try {
    // Query all towns without limit, ordered by name
    console.log('📊 Fetching all towns from database...');
    const { data: towns, error, count } = await supabase
      .from('towns')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching towns:', error.message);
      console.error('Details:', error);
      return;
    }

    if (!towns || towns.length === 0) {
      console.log('⚠️  No towns found in the database.');
      return;
    }

    // Display total count
    console.log(`\n✅ Total towns in database: ${towns.length}`);
    console.log(`✅ Query count: ${count}`);

    // Display all town names
    console.log('\n📋 All towns (alphabetically ordered):\n');
    console.log('Index | Town Name | State | Country');
    console.log('------|-----------|-------|--------');
    
    towns.forEach((town, index) => {
      console.log(`${String(index + 1).padStart(5)} | ${town.name.padEnd(30)} | ${(town.state || '').padEnd(6)} | ${town.country || ''}`);
    });

    // Check for duplicates
    console.log('\n🔍 Checking for duplicate town names...');
    const nameCount = {};
    const duplicates = [];

    towns.forEach(town => {
      if (nameCount[town.name]) {
        nameCount[town.name]++;
        duplicates.push(town);
      } else {
        nameCount[town.name] = 1;
      }
    });

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate town names:`);
      
      // Group duplicates by name
      const duplicateGroups = {};
      towns.forEach(town => {
        if (nameCount[town.name] > 1) {
          if (!duplicateGroups[town.name]) {
            duplicateGroups[town.name] = [];
          }
          duplicateGroups[town.name].push(town);
        }
      });

      // Display duplicate groups
      Object.entries(duplicateGroups).forEach(([name, duplicateTowns]) => {
        console.log(`\n   "${name}" appears ${duplicateTowns.length} times:`);
        duplicateTowns.forEach(town => {
          console.log(`      - ID: ${town.id}, State: ${town.state || 'N/A'}, Country: ${town.country || 'N/A'}`);
        });
      });
    } else {
      console.log('✅ No duplicate town names found!');
    }

    // Additional statistics
    console.log('\n📊 Additional Statistics:');
    
    // Count by country
    const countryCount = {};
    towns.forEach(town => {
      const country = town.country || 'Unknown';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });
    
    console.log('\nTowns by country:');
    Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([country, count]) => {
        console.log(`   ${country}: ${count} towns`);
      });

    // Count by state (for US towns)
    const usTowns = towns.filter(town => town.country === 'USA' || town.country === 'US');
    if (usTowns.length > 0) {
      const stateCount = {};
      usTowns.forEach(town => {
        const state = town.state || 'Unknown';
        stateCount[state] = (stateCount[state] || 0) + 1;
      });
      
      console.log('\nUS towns by state:');
      Object.entries(stateCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) // Show top 10 states
        .forEach(([state, count]) => {
          console.log(`   ${state}: ${count} towns`);
        });
      
      if (Object.keys(stateCount).length > 10) {
        console.log(`   ... and ${Object.keys(stateCount).length - 10} more states`);
      }
    }

    console.log('\n✅ Town analysis complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
console.log('🚀 Scout2Retire Town Checker\n');
console.log(`📍 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

checkTowns()
  .then(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });