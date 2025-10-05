#!/usr/bin/env node

// Add housing_preference column to user_preferences table
// Using service role key for schema modifications

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function addHousingPreferenceColumn() {
  console.log('🔧 Adding housing_preference column to user_preferences table...\n');

  try {
    // Add the housing_preference column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE user_preferences
            ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';`
    });

    if (error) {
      // If rpc doesn't work, try direct SQL execution
      console.log('RPC method failed, trying alternative approach...');
      
      // Alternative: Use the REST API directly for DDL
      const response = await fetch('https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'process.env.SUPABASE_SERVICE_ROLE_KEY',
          'Authorization': 'Bearer process.env.SUPABASE_SERVICE_ROLE_KEY'
        },
        body: JSON.stringify({
          sql: `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('✅ Column added successfully via REST API');
    } else {
      console.log('✅ Column added successfully via RPC');
    }

    // Verify the column was added by checking the table structure
    console.log('\n🔍 Verifying column was added...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default')
      .eq('table_name', 'user_preferences')
      .eq('table_schema', 'public');

    if (columnError) {
      console.log('Could not verify columns directly, checking with sample query...');
      
      // Try to select from the table including the new column
      const { data: sampleData, error: sampleError } = await supabase
        .from('user_preferences')
        .select('id, housing_preference')
        .limit(1);
      
      if (sampleError) {
        console.log('❌ Column may not have been added. Error:', sampleError.message);
      } else {
        console.log('✅ Column verified - housing_preference is accessible');
        if (sampleData.length > 0) {
          console.log(`Sample data: housing_preference = ${sampleData[0].housing_preference || 'NULL'}`);
        }
      }
    } else {
      console.log('\nTable structure for user_preferences:');
      columns.forEach(col => {
        if (col.column_name === 'housing_preference') {
          console.log(`✅ ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
        } else {
          console.log(`  ${col.column_name}: ${col.data_type}`);
        }
      });
    }

  } catch (err) {
    console.error('❌ Error adding column:', err.message);
    console.log('\nTrying manual SQL execution as fallback...');
    
    // Create a SQL file as fallback
    const sqlContent = `-- Add housing_preference column to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND table_schema = 'public'
ORDER BY ordinal_position;`;

    console.log('SQL to execute manually:');
    console.log(sqlContent);
  }
}

// Run the operation
addHousingPreferenceColumn().catch(console.error);