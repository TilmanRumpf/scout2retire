/**
 * Add visa_free_days numeric column for easy filtering
 * Critical for retirees planning their travel
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addVisaFreeDays() {
  console.log('🛂 Adding visa-free days data for easy filtering...\n');

  try {
    // First check if column exists
    const { data: testColumn } = await supabase
      .from('towns')
      .select('id, visa_free_days')
      .limit(1);

    if (testColumn && testColumn[0] && testColumn[0].visa_free_days !== undefined) {
      console.log('✅ visa_free_days column already exists');
    } else {
      console.log('⚠️ visa_free_days column does not exist - create it first');
      console.log('Run this SQL: ALTER TABLE towns ADD COLUMN IF NOT EXISTS visa_free_days INTEGER;');
    }

    // Get all towns with visa requirements
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, name, country, visa_requirements');

    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }

    console.log(`Processing ${towns.length} towns...\n`);

    let updatedCount = 0;
    const daysCounts = {};

    for (const town of towns) {
      let days = null;
      const req = town.visa_requirements || '';

      // Parse visa requirements to extract days
      if (req.includes('No visa needed')) {
        days = 999; // Domestic or US territory
      } else if (req.includes('365-day')) {
        days = 365;
      } else if (req.includes('240-day')) {
        days = 240;
      } else if (req.includes('183-day')) {
        days = 183;
      } else if (req.includes('180-day')) {
        days = 180;
      } else if (req.includes('120-day')) {
        days = 120;
      } else if (req.includes('90-day')) {
        days = 90;
      } else if (req.includes('60-day')) {
        days = 60;
      } else if (req.includes('6-week')) {
        days = 42; // 6 weeks = 42 days
      } else if (req.includes('31-day')) {
        days = 31;
      } else if (req.includes('30-day')) {
        days = 30;
      } else if (
        req.includes('Visa required') ||
        req.includes('Visa on arrival') ||
        req.includes('e-Visa') ||
        req.includes('eTA') ||
        req.includes('ETA')
      ) {
        days = 0; // Visa needed
      }

      // Track counts
      if (!daysCounts[days]) daysCounts[days] = 0;
      daysCounts[days]++;

      // Update the town
      if (days !== null) {
        const { error: updateError } = await supabase
          .from('towns')
          .update({ visa_free_days: days })
          .eq('id', town.id);

        if (updateError) {
          console.error(`❌ Failed to update ${town.name}:`, updateError.message);
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`✅ Updated: ${updatedCount} towns`);

    console.log('\n📈 Distribution of visa-free days:');
    const sortedDays = Object.entries(daysCounts)
      .sort((a, b) => (b[0] === '999' ? -1 : a[0] === '999' ? 1 : Number(b[0]) - Number(a[0])));

    for (const [days, count] of sortedDays) {
      const label = days === '999' ? 'No visa (US/territory)' :
                    days === '0' ? 'Visa required' :
                    `${days} days visa-free`;
      console.log(`  ${label}: ${count} towns`);
    }

    // Show some examples
    console.log('\n📋 Sample data:');
    const samples = [
      'United States', 'Mexico', 'Portugal', 'Thailand',
      'Albania', 'Vietnam', 'Australia'
    ];

    for (const country of samples) {
      const { data: sample } = await supabase
        .from('towns')
        .select('visa_free_days, visa_requirements')
        .eq('country', country)
        .limit(1);

      if (sample && sample[0]) {
        console.log(`  ${country}: ${sample[0].visa_free_days} days`);
      }
    }

    console.log('\n🎉 VISA-FREE DAYS DATA COMPLETE!');
    console.log('Retirees can now filter by how long they can stay visa-free!');

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

addVisaFreeDays();