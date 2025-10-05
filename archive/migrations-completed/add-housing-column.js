#!/usr/bin/env node

// Direct PostgreSQL approach to add housing_preference column
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addHousingColumn() {
  console.log('🚀 Starting housing_preference column addition...\n');
  
  try {
    // Step 1: Check if the column already exists
    console.log('1. Checking if housing_preference column exists...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('user_preferences')
        .select('housing_preference')
        .limit(1);
      
      if (!testError) {
        console.log('✅ housing_preference column already exists!');
        return;
      }
      
      if (testError.message && testError.message.includes('column "housing_preference" does not exist')) {
        console.log('❌ housing_preference column does not exist. Attempting to add it...');
      } else {
        console.log(`❌ Column check failed: ${testError.message}`);
        console.log('Proceeding to attempt column addition anyway...');
      }
    } catch (error) {
      console.log(`❌ Exception during column check: ${error.message}`);
      console.log('Proceeding to attempt column addition anyway...');
    }
    
    // Step 2: Try to add the column using a stored procedure approach
    console.log('\n2. Attempting to add the column...');
    
    // Try different approaches to execute the ALTER TABLE
    const approaches = [
      // Approach 1: Direct RPC call
      async () => {
        const { data, error } = await supabase.rpc('sql', {
          query: `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';`
        });
        return { data, error, method: 'RPC sql' };
      },
      
      // Approach 2: Raw REST API call
      async () => {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          },
          body: JSON.stringify({
            query: `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';`
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return { data, error: null, method: 'REST API sql' };
        } else {
          const error = await response.text();
          return { data: null, error: { message: error }, method: 'REST API sql' };
        }
      },
      
      // Approach 3: Using execute function
      async () => {
        const { data, error } = await supabase.rpc('execute', {
          sql: `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';`
        });
        return { data, error, method: 'RPC execute' };
      }
    ];
    
    let success = false;
    
    for (const approach of approaches) {
      try {
        console.log(`   Trying method: ${approach.name || 'unknown'}...`);
        const result = await approach();
        
        if (!result.error) {
          console.log(`   ✅ Success with ${result.method}!`);
          success = true;
          break;
        } else {
          console.log(`   ❌ Failed with ${result.method}: ${result.error.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Exception with approach: ${error.message}`);
      }
    }
    
    if (!success) {
      console.log('\n⚠️ Automatic column addition failed. Manual intervention required.');
      console.log('\n📝 Please add the column manually:');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
      console.log('2. Navigate to your project');
      console.log('3. Go to Table Editor > user_preferences');
      console.log('4. Click "Add Column" and configure:');
      console.log('   - Name: housing_preference');
      console.log('   - Type: text');
      console.log('   - Default value: both');
      console.log('5. Or run this SQL in the SQL Editor:');
      console.log('   ALTER TABLE user_preferences ADD COLUMN housing_preference text DEFAULT \'both\';');
      return;
    }
    
    // Step 3: Verify the column was added
    console.log('\n3. Verifying column addition...');
    
    // Wait a moment for the schema change to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_preferences')
        .select('housing_preference')
        .limit(1);
      
      if (!verifyError) {
        console.log('✅ Column verification successful! housing_preference column is now available.');
        
        // Show a sample of the data structure
        const { data: sampleData, error: sampleError } = await supabase
          .from('user_preferences')
          .select('*')
          .limit(1);
        
        if (!sampleError && sampleData && sampleData.length > 0) {
          console.log('\n📋 Updated table structure includes these columns:');
          console.log(`   ${Object.keys(sampleData[0]).join(', ')}`);
          
          if (sampleData[0].hasOwnProperty('housing_preference')) {
            console.log('\n✅ CONFIRMED: housing_preference column is present and functional!');
          }
        }
      } else {
        console.error('❌ Verification failed:', verifyError.message);
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('\n🎉 Housing column addition process completed!');
}

// Run the function
addHousingColumn().catch(console.error);