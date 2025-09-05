#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER - GOVERNMENT RATINGS INVESTIGATION
// Check if government_efficiency_rating and political_stability_rating columns exist and are accessible

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkGovernmentRatings() {
  console.log('🔍 GOVERNMENT RATINGS INVESTIGATION');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // 1. Check if columns exist by trying to select them
    console.log('🗂️  STEP 1: CHECKING COLUMN ACCESS');
    console.log('-'.repeat(40));
    
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('towns')
        .select('id, name, government_efficiency_rating, political_stability_rating')
        .limit(5);

      if (schemaError) {
        console.log('❌ Error accessing columns:', schemaError.message);
        console.log('   This indicates the columns are not accessible via REST API');
      } else {
        console.log('✅ Columns are accessible via API');
        console.log('Sample data:');
        schemaData.forEach((town, index) => {
          console.log(`  ${index + 1}. ${town.name}`);
          console.log(`     Government Efficiency: ${town.government_efficiency_rating}`);
          console.log(`     Political Stability: ${town.political_stability_rating}`);
        });
      }
    } catch (error) {
      console.log('❌ Exception when accessing columns:', error.message);
    }

    // 2. Check raw column data statistics
    console.log('\n📊 STEP 2: DATA STATISTICS');
    console.log('-'.repeat(40));
    
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('towns')
        .select('government_efficiency_rating, political_stability_rating')
        .not('government_efficiency_rating', 'is', null)
        .limit(10);

      if (statsError) {
        console.log('❌ Error getting statistics:', statsError.message);
      } else {
        console.log(`✅ Found ${statsData.length} towns with government efficiency ratings`);
        if (statsData.length > 0) {
          const efficiencyRatings = statsData.map(d => d.government_efficiency_rating).filter(r => r !== null);
          const stabilityRatings = statsData.map(d => d.political_stability_rating).filter(r => r !== null);
          
          console.log(`Government Efficiency Ratings:`);
          console.log(`  Count: ${efficiencyRatings.length}`);
          console.log(`  Sample values: ${efficiencyRatings.slice(0, 5).join(', ')}`);
          
          console.log(`Political Stability Ratings:`);
          console.log(`  Count: ${stabilityRatings.length}`);
          console.log(`  Sample values: ${stabilityRatings.slice(0, 5).join(', ')}`);
        }
      }
    } catch (directError) {
      console.log('❌ Direct column access failed:', directError.message);
      console.log('   This confirms the columns are not accessible via the REST API');
    }

    // 3. Check total count of towns with ratings
    console.log('\n📈 STEP 3: TOTAL COUNTS');
    console.log('-'.repeat(40));
    
    try {
      const { count: totalTowns, error: countError } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.log('❌ Error getting total town count:', countError.message);
      } else {
        console.log(`✅ Total towns in database: ${totalTowns}`);
      }

      // Try to count towns with government ratings
      const { count: govCount, error: govCountError } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true })
        .not('government_efficiency_rating', 'is', null);

      if (govCountError) {
        console.log('❌ Cannot count towns with government ratings:', govCountError.message);
        console.log('   This indicates the column is not exposed in the REST API');
      } else {
        console.log(`✅ Towns with government efficiency ratings: ${govCount}`);
      }
    } catch (error) {
      console.log('❌ Count queries failed:', error.message);
    }

    // 4. Test with specific known towns
    console.log('\n🎯 STEP 4: TESTING SPECIFIC TOWNS');
    console.log('-'.repeat(40));
    
    const testTowns = ['Alicante', 'Barcelona', 'Madrid', 'Lisbon'];
    
    for (const townName of testTowns) {
      try {
        const { data: townData, error: townError } = await supabase
          .from('towns')
          .select('id, name, country, government_efficiency_rating, political_stability_rating')
          .ilike('name', townName)
          .limit(1);

        if (townError) {
          console.log(`❌ ${townName}: ${townError.message}`);
        } else if (townData.length > 0) {
          const town = townData[0];
          console.log(`✅ ${town.name}, ${town.country}:`);
          console.log(`   Government Efficiency: ${town.government_efficiency_rating || 'NULL'}`);
          console.log(`   Political Stability: ${town.political_stability_rating || 'NULL'}`);
        } else {
          console.log(`⚠️  ${townName}: Not found in database`);
        }
      } catch (error) {
        console.log(`❌ ${townName}: Exception - ${error.message}`);
      }
    }

    // 5. Check if RLS policies are blocking access
    console.log('\n🔒 STEP 5: CHECKING ACCESS POLICIES');
    console.log('-'.repeat(40));
    
    try {
      // Try to select all columns to see what's accessible
      const { data: allColumnsData, error: allColumnsError } = await supabase
        .from('towns')
        .select('*')
        .limit(1);

      if (allColumnsError) {
        console.log('❌ Cannot access towns table at all:', allColumnsError.message);
      } else if (allColumnsData.length > 0) {
        const availableColumns = Object.keys(allColumnsData[0]);
        console.log('✅ Available columns in towns table:');
        
        const hasGovEfficiency = availableColumns.includes('government_efficiency_rating');
        const hasPoliticalStability = availableColumns.includes('political_stability_rating');
        
        availableColumns.forEach(col => {
          const isTargetColumn = col === 'government_efficiency_rating' || col === 'political_stability_rating';
          const icon = isTargetColumn ? '🎯' : '  ';
          console.log(`${icon} ${col}`);
        });
        
        console.log(`\n📋 RESULTS:`);
        console.log(`   government_efficiency_rating: ${hasGovEfficiency ? '✅ PRESENT' : '❌ MISSING'}`);
        console.log(`   political_stability_rating: ${hasPoliticalStability ? '✅ PRESENT' : '❌ MISSING'}`);
        
        if (!hasGovEfficiency || !hasPoliticalStability) {
          console.log(`\n🔧 ACTION NEEDED:`);
          console.log(`   - The columns may not exist in the database schema`);
          console.log(`   - Or they may be blocked by Row Level Security policies`);
          console.log(`   - Or they may not be exposed in the auto-generated REST API`);
        }
      }
    } catch (error) {
      console.log('❌ Full table access failed:', error.message);
    }

    console.log('\n🎯 INVESTIGATION COMPLETE');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the investigation
checkGovernmentRatings().catch(console.error);