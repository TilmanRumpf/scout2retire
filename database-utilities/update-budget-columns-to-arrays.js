#!/usr/bin/env node

// Update budget columns to support array storage for multi-select
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function updateBudgetColumns() {
  console.log('🚀 Starting budget columns update to support multi-select arrays...\n');
  
  try {
    // Step 1: Get all existing data to preserve it
    console.log('1. Fetching existing user preferences...');
    const { data: existingData, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching data:', fetchError);
      return;
    }
    
    console.log(`✅ Found ${existingData?.length || 0} user preferences records\n`);
    
    // Step 2: Update each record to convert single values to arrays
    console.log('2. Converting single values to arrays...');
    
    for (const record of existingData || []) {
      const updates = {};
      
      // Convert total_monthly_budget to array if it's a single value
      if (record.total_monthly_budget !== null && !Array.isArray(record.total_monthly_budget)) {
        updates.total_monthly_budget = [record.total_monthly_budget];
      } else if (record.total_monthly_budget === null) {
        updates.total_monthly_budget = [];
      }
      
      // Convert max_monthly_rent to array if it's a single value
      if (record.max_monthly_rent !== null && !Array.isArray(record.max_monthly_rent)) {
        updates.max_monthly_rent = [record.max_monthly_rent];
      } else if (record.max_monthly_rent === null) {
        updates.max_monthly_rent = [];
      }
      
      // Convert max_home_price to array if it's a single value
      if (record.max_home_price !== null && !Array.isArray(record.max_home_price)) {
        updates.max_home_price = [record.max_home_price];
      } else if (record.max_home_price === null) {
        updates.max_home_price = [];
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        console.log(`   Updating user ${record.user_id}:`, updates);
        
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', record.user_id);
        
        if (updateError) {
          console.error(`   ❌ Error updating user ${record.user_id}:`, updateError);
        } else {
          console.log(`   ✅ Updated user ${record.user_id}`);
        }
      } else {
        console.log(`   ⏭️ User ${record.user_id} already has arrays, skipping`);
      }
    }
    
    // Step 3: Verify the updates
    console.log('\n3. Verifying updates...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_preferences')
      .select('user_id, total_monthly_budget, max_monthly_rent, max_home_price')
      .limit(3);
    
    if (!verifyError && verifyData) {
      console.log('\n📋 Sample of updated data:');
      verifyData.forEach(record => {
        console.log(`\nUser ${record.user_id}:`);
        console.log(`  Total Budget: ${JSON.stringify(record.total_monthly_budget)}`);
        console.log(`  Max Rent: ${JSON.stringify(record.max_monthly_rent)}`);
        console.log(`  Max Home Price: ${JSON.stringify(record.max_home_price)}`);
      });
    }
    
    console.log('\n✅ Budget columns updated to support multi-select arrays!');
    console.log('\n📝 Note: The database columns are now storing arrays as JSONB.');
    console.log('   Users can now select multiple budget ranges on the costs page.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the update
updateBudgetColumns().catch(console.error);