#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER - COMPREHENSIVE USER DATA INVESTIGATION
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance
// Modified to investigate ALL user data for tobiasrumpf@gmx.de

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

const TOBIAS_EMAIL = 'tobiasrumpf@gmx.de';
const TOBIAS_USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function runQueries() {
  console.log('🔍 HOBBIES JUNCTION TABLE CHECK');
  console.log('=' .repeat(80));
  console.log('Checking which hobbies junction table exists');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Step 1: Check which table exists by trying to query them
    console.log('Step 1: Checking which hobbies junction table exists...');
    
    let hasTownHobbies = false;
    let hasTownsHobbies = false;

    // Check town_hobbies
    try {
      const { data, error } = await supabase.from('town_hobbies').select('*').limit(1);
      if (!error) {
        hasTownHobbies = true;
        console.log('✅ town_hobbies exists');
      }
    } catch (err) {
      console.log('❌ town_hobbies does not exist or is not accessible');
    }

    // Check towns_hobbies
    try {
      const { data, error } = await supabase.from('towns_hobbies').select('*').limit(1);
      if (!error) {
        hasTownsHobbies = true;
        console.log('✅ towns_hobbies exists');
      }
    } catch (err) {
      console.log('❌ towns_hobbies does not exist or is not accessible');
    }

    console.log(`\nTable status:`);
    console.log(`- town_hobbies exists: ${hasTownHobbies ? '✅' : '❌'}`);
    console.log(`- towns_hobbies exists: ${hasTownsHobbies ? '✅' : '❌'}`);

    // Since we cannot execute DDL commands via the SDK, we need to report what needs to be done
    if (hasTownHobbies && !hasTownsHobbies) {
      console.log('\n⚠️  MANUAL ACTION REQUIRED:');
      console.log('The town_hobbies table exists but towns_hobbies does not.');
      console.log('Please execute the following SQL commands manually in your Supabase dashboard:');
      console.log('');
      console.log('-- Rename table');
      console.log('ALTER TABLE IF EXISTS town_hobbies RENAME TO towns_hobbies;');
      console.log('');
      console.log('-- Rename indexes');
      console.log('ALTER INDEX IF EXISTS idx_town_hobbies_town_id RENAME TO idx_towns_hobbies_town_id;');
      console.log('ALTER INDEX IF EXISTS idx_town_hobbies_hobby_id RENAME TO idx_towns_hobbies_hobby_id;');
      console.log('');

    } else if (hasTownsHobbies && !hasTownHobbies) {
      console.log('\n✅ PERFECT: towns_hobbies already exists and town_hobbies does not exist');
      console.log('No rename needed - the table naming is correct!');

    } else if (hasTownHobbies && hasTownsHobbies) {
      console.log('\n⚠️  WARNING: Both tables exist - manual intervention required');
      console.log('Please check the data in both tables and decide which one to keep.');

    } else {
      console.log('\n❌ ERROR: Neither table exists');
      console.log('This might indicate a more serious database issue.');
      
      // Let's also check if there are any hobbies or towns tables at all
      try {
        const { data: hobbiesData } = await supabase.from('hobbies').select('id').limit(1);
        const { data: townsData } = await supabase.from('towns').select('id').limit(1);
        
        console.log(`Hobbies table accessible: ${hobbiesData ? '✅' : '❌'}`);
        console.log(`Towns table accessible: ${townsData ? '✅' : '❌'}`);
      } catch (err) {
        console.log('Error checking base tables:', err.message);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ Hobbies junction table check completed!');
}

// Run the queries
runQueries().catch(console.error);