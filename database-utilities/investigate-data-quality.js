/**
 * Data Quality Investigation Script
 *
 * Investigates:
 * 1. english_proficiency_level values (especially "native")
 * 2. Existence of overall_culture_score and local_festivals fields
 * 3. Null percentages in social_atmosphere, traditional_progressive_lean, cultural_events_frequency
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateDataQuality() {
  console.log('🔍 INVESTIGATING DATA QUALITY ISSUES\n');
  console.log('=' .repeat(80));

  // 1. Check english_proficiency_level values
  console.log('\n📊 1. ENGLISH PROFICIENCY LEVEL DISTRIBUTION');
  console.log('-'.repeat(80));

  const { data: englishData, error: englishError } = await supabase
    .from('towns')
    .select('english_proficiency_level');

  if (englishError) {
    console.error('❌ Error fetching english_proficiency_level:', englishError);
  } else {
    const distribution = {};
    let nullCount = 0;

    englishData.forEach(row => {
      const value = row.english_proficiency_level;
      if (value === null || value === undefined) {
        nullCount++;
      } else {
        distribution[value] = (distribution[value] || 0) + 1;
      }
    });

    console.log(`Total towns: ${englishData.length}`);
    console.log(`NULL values: ${nullCount} (${(nullCount/englishData.length*100).toFixed(1)}%)`);
    console.log('\nValue distribution:');
    Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([value, count]) => {
        console.log(`  ${value}: ${count} (${(count/englishData.length*100).toFixed(1)}%)`);
      });

    // Check for unexpected values
    const expectedValues = ['minimal', 'low', 'moderate', 'high', 'widespread', 'very high', 'native'];
    const unexpectedValues = Object.keys(distribution).filter(v => !expectedValues.includes(v));

    if (unexpectedValues.length > 0) {
      console.log('\n⚠️  UNEXPECTED VALUES FOUND:');
      unexpectedValues.forEach(v => {
        console.log(`  - "${v}" (${distribution[v]} occurrences)`);
      });
    } else {
      console.log('\n✅ All values are within expected range');
    }
  }

  // 2. Check if overall_culture_score and local_festivals fields exist
  console.log('\n\n📊 2. CHECKING FIELD EXISTENCE');
  console.log('-'.repeat(80));

  const { data: schemaData, error: schemaError } = await supabase
    .from('towns')
    .select('*')
    .limit(1);

  if (schemaError) {
    console.error('❌ Error fetching schema:', schemaError);
  } else {
    const fields = schemaData[0] ? Object.keys(schemaData[0]) : [];

    console.log('\nChecking for specific fields:');
    const fieldsToCheck = ['overall_culture_score', 'local_festivals', 'cultural_events_frequency', 'social_atmosphere', 'traditional_progressive_lean'];

    fieldsToCheck.forEach(field => {
      const exists = fields.includes(field);
      console.log(`  ${field}: ${exists ? '✅ EXISTS' : '❌ DOES NOT EXIST'}`);
    });
  }

  // 3. Check null percentages in key cultural fields
  console.log('\n\n📊 3. NULL VALUE ANALYSIS FOR CULTURAL FIELDS');
  console.log('-'.repeat(80));

  const culturalFields = [
    'social_atmosphere',
    'traditional_progressive_lean',
    'cultural_events_frequency',
    'retirement_community_presence',
    'english_proficiency_level',
    'expat_community_size'
  ];

  for (const field of culturalFields) {
    const { data: fieldData, error: fieldError } = await supabase
      .from('towns')
      .select(field);

    if (fieldError) {
      console.error(`❌ Error fetching ${field}:`, fieldError);
    } else {
      const nullCount = fieldData.filter(row => row[field] === null || row[field] === undefined).length;
      const total = fieldData.length;
      const nullPercent = (nullCount / total * 100).toFixed(1);

      const status = nullPercent > 50 ? '🔴' : nullPercent > 20 ? '🟡' : '🟢';
      console.log(`${status} ${field}: ${nullCount}/${total} NULL (${nullPercent}%)`);

      // Show value distribution for non-null values
      if (nullCount < total) {
        const distribution = {};
        fieldData.forEach(row => {
          const value = row[field];
          if (value !== null && value !== undefined) {
            distribution[value] = (distribution[value] || 0) + 1;
          }
        });

        const topValues = Object.entries(distribution)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        console.log(`   Top values:`);
        topValues.forEach(([value, count]) => {
          console.log(`     - ${value}: ${count} (${(count/total*100).toFixed(1)}%)`);
        });
      }
      console.log();
    }
  }

  // 4. Sample some towns to see actual data
  console.log('\n📊 4. SAMPLE DATA FROM 5 RANDOM TOWNS');
  console.log('-'.repeat(80));

  const { data: sampleData, error: sampleError } = await supabase
    .from('towns')
    .select('id, town_name, country, english_proficiency_level, social_atmosphere, traditional_progressive_lean, cultural_events_frequency')
    .limit(5);

  if (sampleError) {
    console.error('❌ Error fetching sample:', sampleError);
  } else {
    sampleData.forEach((town, idx) => {
      console.log(`\n${idx + 1}. ${town.town_name}, ${town.country} (ID: ${town.id})`);
      console.log(`   english_proficiency_level: ${town.english_proficiency_level || 'NULL'}`);
      console.log(`   social_atmosphere: ${town.social_atmosphere || 'NULL'}`);
      console.log(`   traditional_progressive_lean: ${town.traditional_progressive_lean || 'NULL'}`);
      console.log(`   cultural_events_frequency: ${town.cultural_events_frequency || 'NULL'}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Investigation complete!\n');
}

investigateDataQuality().catch(console.error);
