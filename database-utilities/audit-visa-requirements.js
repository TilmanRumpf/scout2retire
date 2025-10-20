/**
 * Audit and fix visa requirements data
 * Critical for US retirees to know where they can travel
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function auditVisaRequirements() {
  console.log('🛂 Auditing visa requirements data...\n');

  try {
    // Check if column exists
    const { data: checkColumn } = await supabase
      .from('towns')
      .select('visa_requirements')
      .limit(1);

    if (!checkColumn) {
      console.log('⚠️ visa_requirements column might not exist');
    }

    // Get all unique visa requirement values
    const { data: visaData, error } = await supabase
      .from('towns')
      .select('visa_requirements, country');

    if (error) {
      console.error('Error fetching visa data:', error);
      return;
    }

    // Count NULL values
    const nullCount = visaData.filter(t => !t.visa_requirements).length;
    console.log(`📊 Towns with NULL visa requirements: ${nullCount} / ${visaData.length}`);

    // Get unique values
    const uniqueValues = [...new Set(visaData.filter(t => t.visa_requirements).map(t => t.visa_requirements))];
    console.log(`\n📋 Unique visa requirement values found: ${uniqueValues.length}`);

    if (uniqueValues.length > 0) {
      console.log('\nSample values:');
      uniqueValues.slice(0, 10).forEach(v => console.log(`  - "${v}"`));
    }

    // Group by country to check consistency
    const countryGroups = {};
    visaData.forEach(town => {
      if (!countryGroups[town.country]) {
        countryGroups[town.country] = new Set();
      }
      countryGroups[town.country].add(town.visa_requirements || 'NULL');
    });

    // Find countries with inconsistent visa requirements
    console.log('\n🔍 Countries with inconsistent visa requirements:');
    let inconsistentCount = 0;
    Object.entries(countryGroups).forEach(([country, values]) => {
      if (values.size > 1) {
        console.log(`  ${country}: ${values.size} different values`);
        inconsistentCount++;
      }
    });

    if (inconsistentCount === 0) {
      console.log('  ✅ All countries have consistent visa requirements');
    }

    // Check specific countries that should have known values
    console.log('\n🌍 Spot check known countries:');
    const spotCheck = ['United States', 'Canada', 'Mexico', 'Portugal', 'Thailand'];
    for (const country of spotCheck) {
      const { data: sample } = await supabase
        .from('towns')
        .select('visa_requirements')
        .eq('country', country)
        .limit(1);

      if (sample && sample[0]) {
        console.log(`  ${country}: "${sample[0].visa_requirements || 'NULL'}"`);
      }
    }

    // Check if we have visa-free days data
    const { data: checkDays } = await supabase
      .from('towns')
      .select('visa_free_days')
      .limit(1);

    if (checkDays && checkDays[0].visa_free_days !== undefined) {
      console.log('\n✅ visa_free_days column exists');

      // Count populated values
      const { count: daysCount } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true })
        .not('visa_free_days', 'is', null);

      console.log(`   Populated: ${daysCount || 0} / ${visaData.length}`);
    } else {
      console.log('\n⚠️ visa_free_days column does not exist or is empty');
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`Total towns: ${visaData.length}`);
    console.log(`With visa requirements: ${visaData.length - nullCount}`);
    console.log(`Missing visa requirements: ${nullCount}`);
    console.log(`Percentage complete: ${Math.round((visaData.length - nullCount) / visaData.length * 100)}%`);

    if (nullCount > 0) {
      // Get list of countries missing data
      const missingCountries = new Set();
      visaData.filter(t => !t.visa_requirements).forEach(t => missingCountries.add(t.country));
      console.log('\n⚠️ Countries with missing visa data:');
      [...missingCountries].slice(0, 10).forEach(c => console.log(`  - ${c}`));
      if (missingCountries.size > 10) {
        console.log(`  ... and ${missingCountries.size - 10} more`);
      }
    }

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

auditVisaRequirements();