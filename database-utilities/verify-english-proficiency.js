/**
 * Verify and fix English proficiency data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations
);

async function verifyEnglishProficiency() {
  console.log('🔍 Checking English proficiency data...\n');

  try {
    // Check if column exists
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'towns' });

    if (schemaError) {
      console.log('Using direct query to check columns...');
    } else if (columns) {
      const hasColumn = columns.some(col => col.column_name === 'english_proficiency');
      console.log(`english_proficiency column exists: ${hasColumn}`);
    }

    // Check current data state
    const { data: sampleData, error: sampleError } = await supabase
      .from('towns')
      .select('id, name, country, english_proficiency')
      .limit(20);

    if (sampleError) {
      console.error('Error fetching sample data:', sampleError);
      return;
    }

    console.log('Sample of current data:');
    sampleData.forEach(town => {
      console.log(`  ${town.name}, ${town.country}: ${town.english_proficiency || 'NULL'}`);
    });

    // Count NULL values
    const { data: nullCount, error: countError } = await supabase
      .from('towns')
      .select('id', { count: 'exact', head: true })
      .is('english_proficiency', null);

    if (!countError) {
      console.log(`\n📊 Towns with NULL English proficiency: ${nullCount}`);
    }

    // Check some specific countries
    const countries = ['United States', 'Portugal', 'Mexico', 'Thailand'];
    for (const country of countries) {
      const { data: countryData } = await supabase
        .from('towns')
        .select('english_proficiency')
        .eq('country', country)
        .limit(1);

      if (countryData && countryData[0]) {
        console.log(`${country}: ${countryData[0].english_proficiency || 'NULL'}`);
      }
    }

    // If all NULL, we need to run the population script
    const { count } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('english_proficiency', 'is', null);

    console.log(`\n✅ Towns with English proficiency data: ${count || 0} / 352`);

    if (count === 0) {
      console.log('\n⚠️ No English proficiency data found! Need to run population script.');
      console.log('Run: node database-utilities/populate-english-proficiency.js');
    }

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

verifyEnglishProficiency();