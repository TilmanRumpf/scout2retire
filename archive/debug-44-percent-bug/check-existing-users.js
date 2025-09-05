#!/usr/bin/env node

// Check existing users and their budget data
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkExistingUsers() {
  console.log('🔍 Checking existing users and their budget data...\n');

  try {
    // Get all users with budget data
    console.log('1. Finding users with budget data...');
    const { data: users, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id, total_monthly_budget, max_monthly_rent, max_home_price, housing_preference, mobility, created_at')
      .not('total_monthly_budget', 'is', null)
      .limit(10);

    if (usersError) {
      console.log(`   ❌ Error: ${usersError.message}`);
    } else {
      console.log(`   ✅ Found ${users.length} users with budget data`);
      
      if (users.length > 0) {
        console.log('\n📋 Existing budget data analysis:');
        users.forEach((user, i) => {
          console.log(`\n   ${i + 1}. User: ${user.user_id}`);
          console.log(`      Created: ${user.created_at}`);
          console.log(`      Total Budget: ${JSON.stringify(user.total_monthly_budget)}`);
          console.log(`      Budget Type: ${Array.isArray(user.total_monthly_budget) ? 'Multi-select Array' : 'Single Value'}`);
          console.log(`      Housing Pref: ${user.housing_preference}`);
          console.log(`      Max Rent: ${JSON.stringify(user.max_monthly_rent)}`);
          console.log(`      Rent Type: ${Array.isArray(user.max_monthly_rent) ? 'Multi-select Array' : 'Single Value'}`);
          console.log(`      Max Home Price: ${JSON.stringify(user.max_home_price)}`);
          console.log(`      Home Price Type: ${Array.isArray(user.max_home_price) ? 'Multi-select Array' : 'Single Value'}`);
          if (user.mobility) {
            console.log(`      Mobility: ${JSON.stringify(user.mobility)}`);
          }
        });
        
        // Analyze data types
        console.log('\n📊 Data Type Analysis:');
        const budgetArrays = users.filter(u => Array.isArray(u.total_monthly_budget)).length;
        const budgetSingles = users.filter(u => !Array.isArray(u.total_monthly_budget) && u.total_monthly_budget !== null).length;
        const rentArrays = users.filter(u => Array.isArray(u.max_monthly_rent)).length;
        const rentSingles = users.filter(u => !Array.isArray(u.max_monthly_rent) && u.max_monthly_rent !== null).length;
        
        console.log(`   Total Budget - Arrays: ${budgetArrays}, Singles: ${budgetSingles}`);
        console.log(`   Max Rent - Arrays: ${rentArrays}, Singles: ${rentSingles}`);
        
        // Check if we have multi-select data
        const hasMultiSelect = budgetArrays > 0 || rentArrays > 0;
        console.log(`   ${hasMultiSelect ? '✅' : '❌'} Multi-select budget data found in database`);
        
        if (hasMultiSelect) {
          console.log('\n🎯 Multi-select examples found:');
          users.forEach((user, i) => {
            if (Array.isArray(user.total_monthly_budget) && user.total_monthly_budget.length > 1) {
              console.log(`   User ${user.user_id}: Total Budget = ${JSON.stringify(user.total_monthly_budget)} (${user.total_monthly_budget.length} selections)`);
            }
            if (Array.isArray(user.max_monthly_rent) && user.max_monthly_rent.length > 1) {
              console.log(`   User ${user.user_id}: Max Rent = ${JSON.stringify(user.max_monthly_rent)} (${user.max_monthly_rent.length} selections)`);
            }
          });
        }
      }
    }

    // Get a test user ID for manual testing
    console.log('\n2. Getting a sample user for testing...');
    const { data: sampleUser, error: sampleError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .limit(1)
      .single();

    if (sampleError) {
      console.log(`   ❌ Error: ${sampleError.message}`);
    } else if (sampleUser) {
      console.log(`   ✅ Sample user ID for testing: ${sampleUser.user_id}`);
      console.log(`   💡 You can use this user ID to test the costs page manually`);
    }

    // Create a test multi-select budget entry
    console.log('\n3. Creating a test multi-select budget entry...');
    const testUserId = 'test-multiselect-user-' + Date.now();
    
    const testData = {
      user_id: testUserId,
      total_monthly_budget: [2000, 3000, 4000], // Multi-select: $2k-3k, $3k-4k, $4k-5k
      max_monthly_rent: [750, 1000], // Multi-select: $750-1k, $1k-1.5k
      max_home_price: [200000, 300000], // Multi-select: $200k-300k, $300k-400k
      housing_preference: 'both',
      mobility: {
        local: ['walk_bike', 'public_transit'],
        regional: ['train_access'],
        international: ['major_airport']
      },
      property_tax_sensitive: true,
      sales_tax_sensitive: false,
      income_tax_sensitive: true,
      monthly_healthcare_budget: 750
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('user_preferences')
      .insert(testData)
      .select();

    if (insertError) {
      console.log(`   ❌ Error creating test user: ${insertError.message}`);
    } else {
      console.log(`   ✅ Created test user: ${testUserId}`);
      console.log(`   📋 Test data created with multi-select values:`);
      console.log(`      Total Budget: ${JSON.stringify(testData.total_monthly_budget)} (3 selections)`);
      console.log(`      Max Rent: ${JSON.stringify(testData.max_monthly_rent)} (2 selections)`);
      console.log(`      Max Home Price: ${JSON.stringify(testData.max_home_price)} (2 selections)`);
      console.log(`      Mobility Local: ${JSON.stringify(testData.mobility.local)} (2 selections)`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ User data check completed!');
}

checkExistingUsers().catch(console.error);