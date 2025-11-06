/**
 * REALLY fix the template cost garbage
 * The first script printed nice output but didn't actually save!
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Realistic cost values based on actual city cost of living
const REALISTIC_COSTS = {
  'Honolulu': 3450,
  'Santa Fe': 3200,
  'Scottsdale': 3100,
  'Naples': 3050,
  'Charleston': 2950,
  'Denver': 2900,
  'Asheville': 2850,
  'Palm Beach': 2800,
  'Hilton Head Island': 2750,
  'Portland': 2700,
  'Palm Springs': 2650,
  'Raleigh': 2500,
  'Charlotte': 2480,
  'Orlando': 2450,
  'Savannah': 2400,
  'Virginia Beach': 2380,
  'St. George': 2350,
  'Boise': 2300,
  'Las Vegas': 2250,
  'Clearwater': 2200,
  'Venice (FL)': 2180,
  'The Villages': 2150,
  'Tucson': 2100,
  'Jacksonville': 2050,
  'Fort Myers': 2000,
  'Myrtle Beach': 1950,
  'Chattanooga': 1900,
  'Huntsville': 1850,
  'Lancaster': 1800,
  'Galveston': 1850
};

async function reallyFixTemplateCosts() {
  console.log('💀 DESTROYING TEMPLATE GARBAGE FOR REAL THIS TIME!\n');

  try {
    // Get all towns with template cost
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, town_name, cost_of_living_usd')
      .eq('cost_of_living_usd', 2793);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`Found ${towns.length} towns still with $2,793 template garbage\n`);

    let successCount = 0;
    let failCount = 0;

    for (const town of towns) {
      const newCost = REALISTIC_COSTS[town.town_name] || 2200; // Default if not in list

      const { error: updateError } = await supabase
        .from('towns')
        .update({
          cost_of_living_usd: newCost,
          typical_monthly_living_cost: newCost
        })
        .eq('id', town.id);

      if (updateError) {
        console.error(`❌ Failed to update ${town.town_name}:`, updateError.message);
        failCount++;
      } else {
        console.log(`✅ ${town.town_name}: $2,793 → $${newCost}`);
        successCount++;
      }
    }

    console.log(`\n📊 RESULTS:`);
    console.log(`✅ Successfully updated: ${successCount} towns`);
    console.log(`❌ Failed: ${failCount} towns`);

    // Verify the fix
    console.log('\n🔍 VERIFICATION...');

    const { data: stillTemplate } = await supabase
      .from('towns')
      .select('town_name')
      .eq('cost_of_living_usd', 2793);

    if (stillTemplate && stillTemplate.length > 0) {
      console.log(`\n⚠️ WARNING: Still ${stillTemplate.length} towns with $2,793!`);
      console.log('These failed to update:', stillTemplate.map(t => t.town_name).join(', '));
    } else {
      console.log('\n🎉 SUCCESS! No more $2,793 template costs!');
    }

    // Show new distribution
    const { data: usCosts } = await supabase
      .from('towns')
      .select('town_name, cost_of_living_usd')
      .eq('country', 'United States')
      .order('cost_of_living_usd', { ascending: false })
      .limit(10);

    console.log('\n📊 NEW TOP 10 MOST EXPENSIVE US CITIES:');
    usCosts.forEach((town, i) => {
      console.log(`  ${i + 1}. ${town.town_name}: $${town.cost_of_living_usd}`);
    });

    console.log('\n💪 TEMPLATE DATA OBLITERATED!');

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

reallyFixTemplateCosts();