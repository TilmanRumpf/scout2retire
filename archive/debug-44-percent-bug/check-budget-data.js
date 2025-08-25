#!/usr/bin/env node

// Check budget/costs data in the database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkBudgetData() {
  console.log('🔍 Checking Scout2Retire database for budget/costs data...\n');

  try {
    // Check user_preferences table
    console.log('1. Checking user_preferences table...');
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('section', 'costs')
      .limit(10);

    if (prefsError) {
      console.log(`   ❌ Error: ${prefsError.message}`);
    } else {
      console.log(`   ✅ Found ${userPrefs.length} cost preference records`);
      
      if (userPrefs.length > 0) {
        console.log('   📋 Sample cost preferences:');
        userPrefs.forEach((pref, i) => {
          const data = typeof pref.data === 'string' ? JSON.parse(pref.data) : pref.data;
          console.log(`     ${i + 1}. User ${pref.user_id}:`);
          console.log(`        Total Budget: ${JSON.stringify(data.total_monthly_budget)}`);
          console.log(`        Housing: ${data.housing_preference}`);
          console.log(`        Max Rent: ${JSON.stringify(data.max_monthly_rent)}`);
          console.log(`        Max Home Price: ${JSON.stringify(data.max_home_price)}`);
        });
      }
    }

    // Check onboarding_progress table
    console.log('\n2. Checking onboarding_progress table...');
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_progress')
      .select('*')
      .not('costs', 'is', null)
      .limit(10);

    if (onboardingError) {
      console.log(`   ❌ Error: ${onboardingError.message}`);
    } else {
      console.log(`   ✅ Found ${onboardingData.length} records with costs data`);
      
      if (onboardingData.length > 0) {
        console.log('   📋 Sample costs data from onboarding:');
        onboardingData.forEach((record, i) => {
          const costs = record.costs;
          console.log(`     ${i + 1}. User ${record.user_id}:`);
          console.log(`        Total Budget: ${JSON.stringify(costs.total_monthly_budget)}`);
          console.log(`        Housing: ${costs.housing_preference}`);
          if (costs.mobility) {
            console.log(`        Mobility: ${JSON.stringify(costs.mobility)}`);
          }
        });
      }
    }

    // Check for any users we can use for testing
    console.log('\n3. Checking for test users...');
    const { data: users, error: usersError } = await supabase
      .from('onboarding_progress')
      .select('user_id, email, costs')
      .not('costs', 'is', null)
      .limit(5);

    if (usersError) {
      console.log(`   ❌ Error: ${usersError.message}`);
    } else {
      console.log(`   ✅ Found ${users.length} users with costs data`);
      if (users.length > 0) {
        console.log('   📋 Available test users:');
        users.forEach((user, i) => {
          console.log(`     ${i + 1}. ${user.user_id} (${user.email || 'no email'})`);
          if (user.costs && user.costs.total_monthly_budget) {
            const isArray = Array.isArray(user.costs.total_monthly_budget);
            console.log(`        Budget type: ${isArray ? 'Array' : 'Single'} - ${JSON.stringify(user.costs.total_monthly_budget)}`);
          }
        });
      }
    }

    // Check the table structure
    console.log('\n4. Checking table structure...');
    try {
      const { data: tableInfo, error: structureError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1);

      if (!structureError && tableInfo && tableInfo.length > 0) {
        console.log('   ✅ user_preferences columns:', Object.keys(tableInfo[0]).join(', '));
      }
    } catch (e) {
      console.log('   ❌ Could not check table structure');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ Database check completed!');
}

checkBudgetData().catch(console.error);