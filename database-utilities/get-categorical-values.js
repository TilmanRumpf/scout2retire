#!/usr/bin/env node

// GET ACTUAL CATEGORICAL VALUES FROM TOWNS TABLE
// This will show REAL values (not validation schema) for creating search templates

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Fields we want to analyze for categorical values
const CATEGORICAL_FIELDS = [
  'summer_climate_actual',
  'winter_climate_actual',
  'sunshine_level_actual',
  'precipitation_level_actual',
  'seasonal_variation_actual',
  'humidity_level_actual',
  'pace_of_life_actual',
  'social_atmosphere',
  'retirement_community_presence',
  'expat_community_size',
  'cultural_events_frequency',
  'traditional_progressive_lean',
  'english_proficiency_level',
  'urban_rural_character'
];

async function getCategoricalValues() {
  console.log('🔍 ANALYZING CATEGORICAL FIELD VALUES');
  console.log('='.repeat(100));
  console.log('');

  const results = {};

  for (const field of CATEGORICAL_FIELDS) {
    console.log(`📊 ${field}...`);

    // Get all unique values for this field
    const { data, error } = await supabase
      .from('towns')
      .select(field)
      .not(field, 'is', null);

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      continue;
    }

    // Count occurrences
    const valueCounts = {};
    data.forEach(row => {
      const value = row[field];
      if (value) {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      }
    });

    // Sort by frequency
    const sorted = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        value,
        count,
        percentage: ((count / data.length) * 100).toFixed(1)
      }));

    results[field] = {
      total_records: data.length,
      unique_values: sorted.length,
      values: sorted
    };

    console.log(`   ✅ ${sorted.length} unique values from ${data.length} records`);
    sorted.forEach(({ value, count, percentage }) => {
      console.log(`      "${value}": ${count} (${percentage}%)`);
    });
    console.log('');
  }

  // Save to file
  const fs = await import('fs');
  const outputPath = '/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/categorical-values-actual.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`💾 Saved to: ${outputPath}\n`);

  // Print summary for search templates
  console.log('='.repeat(100));
  console.log('📋 SEARCH TEMPLATE RECOMMENDATIONS');
  console.log('='.repeat(100));
  console.log('');

  Object.entries(results).forEach(([field, data]) => {
    console.log(`${field}:`);
    console.log(`  Total unique values: ${data.unique_values}`);
    console.log(`  Top 3 most common:`);
    data.values.slice(0, 3).forEach(v => {
      console.log(`    - "${v.value}" (${v.percentage}% of towns)`);
    });
    console.log('');
  });
}

getCategoricalValues().catch(console.error);
