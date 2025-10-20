/**
 * Verify duplicate cost values across towns
 * Specifically checking the suspicious $2,793 value that appears in 30 towns
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyDuplicateCosts() {
  console.log('🔍 Verifying duplicate cost values...\n');

  try {
    // Get all towns with cost data
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, name, country, region, cost_of_living_usd, typical_monthly_living_cost')
      .order('cost_of_living_usd', { ascending: false });

    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }

    console.log(`Analyzing ${towns.length} towns...\n`);

    // Group by cost_of_living_usd
    const costGroups = {};
    towns.forEach(town => {
      if (town.cost_of_living_usd) {
        const cost = town.cost_of_living_usd;
        if (!costGroups[cost]) {
          costGroups[cost] = [];
        }
        costGroups[cost].push(town);
      }
    });

    // Find duplicate values (same cost in multiple towns)
    const duplicates = Object.entries(costGroups)
      .filter(([cost, townsList]) => townsList.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    console.log('📊 DUPLICATE COST VALUES FOUND:\n');
    console.log(`Found ${duplicates.length} duplicate cost values\n`);

    // Show top duplicates
    duplicates.slice(0, 10).forEach(([cost, townsList]) => {
      console.log(`💵 $${cost} - Used by ${townsList.length} towns:`);

      // Group by country
      const byCountry = {};
      townsList.forEach(town => {
        if (!byCountry[town.country]) {
          byCountry[town.country] = [];
        }
        byCountry[town.country].push(town);
      });

      Object.entries(byCountry).forEach(([country, countryTowns]) => {
        console.log(`    ${country} (${countryTowns.length} towns):`);
        countryTowns.slice(0, 5).forEach(town => {
          console.log(`      - ${town.name}${town.region ? ', ' + town.region : ''}`);
        });
        if (countryTowns.length > 5) {
          console.log(`      ... and ${countryTowns.length - 5} more`);
        }
      });
      console.log('');
    });

    // Specific check for $2,793
    console.log('🎯 SPECIFIC CHECK FOR $2,793:\n');
    const towns2793 = costGroups[2793];
    if (towns2793) {
      console.log(`Found ${towns2793.length} towns with exactly $2,793 cost:\n`);

      // Group by region to see if there's a pattern
      const byRegion = {};
      towns2793.forEach(town => {
        const key = `${town.country} - ${town.region || 'No region'}`;
        if (!byRegion[key]) {
          byRegion[key] = [];
        }
        byRegion[key].push(town);
      });

      Object.entries(byRegion).forEach(([region, regionTowns]) => {
        console.log(`  ${region}: ${regionTowns.map(t => t.name).join(', ')}`);
      });
    } else {
      console.log('No towns found with exactly $2,793');
    }

    // Check if typical_monthly_living_cost has similar patterns
    console.log('\n🔍 CHECKING typical_monthly_living_cost:\n');

    const typicalCostGroups = {};
    towns.forEach(town => {
      if (town.typical_monthly_living_cost) {
        const cost = town.typical_monthly_living_cost;
        if (!typicalCostGroups[cost]) {
          typicalCostGroups[cost] = [];
        }
        typicalCostGroups[cost].push(town);
      }
    });

    const typicalDuplicates = Object.entries(typicalCostGroups)
      .filter(([cost, townsList]) => townsList.length > 5)
      .sort((a, b) => b[1].length - a[1].length);

    if (typicalDuplicates.length > 0) {
      console.log('Found duplicate typical_monthly_living_cost values:');
      typicalDuplicates.slice(0, 5).forEach(([cost, townsList]) => {
        console.log(`  $${cost} - Used by ${townsList.length} towns`);
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:\n');

    if (duplicates.length > 20) {
      console.log('⚠️ HIGH NUMBER OF DUPLICATES DETECTED');
      console.log('This suggests template or placeholder data was used.');
      console.log('Recommended actions:');
      console.log('1. Review data source for these cost values');
      console.log('2. Consider adding variance based on local factors');
      console.log('3. Verify with external cost-of-living indices\n');
    }

    // Check for suspiciously round numbers
    const roundNumbers = Object.entries(costGroups)
      .filter(([cost, townsList]) => {
        const num = parseInt(cost);
        return num % 100 === 0 && townsList.length > 3;
      });

    if (roundNumbers.length > 0) {
      console.log('⚠️ SUSPICIOUSLY ROUND NUMBERS:');
      roundNumbers.forEach(([cost, townsList]) => {
        console.log(`  $${cost} - Used by ${townsList.length} towns`);
      });
      console.log('\nRound numbers suggest estimated rather than calculated values.\n');
    }

    console.log('✅ Verification complete!');

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

verifyDuplicateCosts();