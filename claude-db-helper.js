#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Example queries that replace the non-existent "npx supabase db execute"

async function runQueries() {
  console.log('🔍 Adding housing_preference column to user_preferences table...\n');

  try {
    // First, let's check if user_preferences table exists and what columns it has
    console.log('1. Checking current user_preferences table structure...');
    
    // Check if the table exists by trying to describe it
    try {
      const { data: existingColumns, error: tableError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(0);

      if (tableError) {
        console.error('❌ Error accessing user_preferences table:', tableError.message);
        if (tableError.code === '42P01') {
          console.log('⚠️ user_preferences table does not exist yet. It will need to be created first.');
          return;
        }
      } else {
        console.log('✅ user_preferences table exists and is accessible');
      }
    } catch (error) {
      console.error('❌ Error checking table:', error);
      return;
    }

    // Now try to execute the ALTER TABLE using REST API approach
    console.log('\n2. Attempting to add housing_preference column...');
    
    // Try using raw SQL via POST request to the database URL
    const response = await fetch('https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
      },
      body: JSON.stringify({
        sql: `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';`
      })
    });
    
    // Also try a direct approach using Supabase
    const { data: alterResult, error: alterError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';`
    });

    if (!response.ok) {
      console.log('⚠️ Direct SQL execution not available. Trying alternative approach...');
      
      // Alternative: Check if the column already exists by trying to select it
      console.log('\n3. Checking if housing_preference column already exists...');
      
      try {
        const { data: testData, error: selectError } = await supabase
          .from('user_preferences')
          .select('housing_preference')
          .limit(1);

        if (selectError) {
          if (selectError.message.includes('column "housing_preference" does not exist')) {
            console.log('❌ housing_preference column does not exist and cannot be added automatically');
            console.log('📝 Manual action required:');
            console.log('   1. Go to your Supabase dashboard');
            console.log('   2. Navigate to Table Editor > user_preferences');
            console.log('   3. Add a new column:');
            console.log('      - Name: housing_preference');
            console.log('      - Type: text');
            console.log('      - Default value: both');
            console.log('   4. Or run this SQL in the SQL Editor:');
            console.log('      ALTER TABLE user_preferences ADD COLUMN housing_preference text DEFAULT \'both\';');
          } else {
            console.error('❌ Error checking column:', selectError.message);
          }
        } else {
          console.log('✅ housing_preference column already exists!');
          console.log('📋 Sample data:', testData);
        }
      } catch (error) {
        console.error('❌ Error during column check:', error);
      }
    } else {
      console.log('✅ ALTER TABLE command executed successfully');
    }

    // Verify the final state
    console.log('\n4. Final verification - checking all columns...');
    try {
      const { data: sampleRow, error: finalError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1);

      if (finalError) {
        console.error('❌ Error in final verification:', finalError.message);
      } else {
        console.log('✅ user_preferences table structure:');
        if (sampleRow && sampleRow.length > 0) {
          console.log('   Columns found:', Object.keys(sampleRow[0]).join(', '));
          if (sampleRow[0].hasOwnProperty('housing_preference')) {
            console.log('   ✅ housing_preference column is present!');
          } else {
            console.log('   ❌ housing_preference column is missing');
          }
        } else {
          console.log('   Table exists but has no data to inspect structure');
        }
      }
    } catch (error) {
      console.error('❌ Error in final verification:', error);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ Database operations completed!');
}

// Run the queries
runQueries().catch(console.error);