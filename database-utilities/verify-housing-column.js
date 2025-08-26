#!/usr/bin/env node

// Verify if housing_preference column exists in user_preferences table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyHousingColumn() {
  console.log('🔍 Verifying housing_preference column in user_preferences table...\n');
  
  try {
    // Test if we can select the housing_preference column
    const { data: testData, error: testError } = await supabase
      .from('user_preferences')
      .select('housing_preference')
      .limit(1);
    
    if (!testError) {
      console.log('✅ SUCCESS: housing_preference column exists and is accessible!');
      
      // Get full table structure to show the column
      const { data: sampleData, error: sampleError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1);
      
      if (!sampleError && sampleData && sampleData.length > 0) {
        console.log('\n📋 Current table structure includes:');
        const columns = Object.keys(sampleData[0]);
        columns.forEach(col => {
          if (col === 'housing_preference') {
            console.log(`   ✅ ${col} (NEW COLUMN)`);
          } else {
            console.log(`   ${col}`);
          }
        });
        
        console.log(`\n📊 Total columns: ${columns.length}`);
        
        // Show the default value if any data exists
        if (sampleData[0].housing_preference !== undefined) {
          console.log(`🎯 Default value for housing_preference: "${sampleData[0].housing_preference}"`);
        }
      }
      
      // Test inserting a record with the new column
      console.log('\n🧪 Testing column functionality...');
      const testRecord = {
        user_id: 'test-user-id-' + Date.now(),
        housing_preference: 'apartment',
        retirement_status: 'planning'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_preferences')
        .insert(testRecord)
        .select();
      
      if (!insertError) {
        console.log('✅ Column is functional - test insert successful!');
        
        // Clean up test record
        await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', testRecord.user_id);
        
        console.log('🧹 Test record cleaned up.');
      } else {
        console.log(`⚠️ Column exists but insert test failed: ${insertError.message}`);
      }
      
    } else {
      if (testError.message && testError.message.includes('column "housing_preference" does not exist')) {
        console.log('❌ FAILED: housing_preference column does not exist yet.');
        console.log('\n📝 The column still needs to be added manually:');
        console.log('1. Go to Supabase dashboard > Table Editor > user_preferences');
        console.log('2. Add column: housing_preference (text, default: "both")');
        console.log('3. Or run in SQL Editor: ALTER TABLE user_preferences ADD COLUMN housing_preference text DEFAULT \'both\';');
      } else {
        console.log(`❌ FAILED: ${testError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  }
  
  console.log('\n🏁 Verification completed.');
}

// Run verification
verifyHousingColumn().catch(console.error);