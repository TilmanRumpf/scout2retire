#!/usr/bin/env node

// Check geographic_features column data type and values

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkGeographicFeaturesColumn() {
  console.log('🔍 Checking geographic_features column...\n');

  try {
    // Method 1: Check column information from information_schema
    console.log('1. Checking column data type from information_schema...');
    
    const { data: columnInfo, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'towns')
      .eq('column_name', 'geographic_features');

    if (columnError) {
      console.log('⚠️ Could not access information_schema:', columnError.message);
      console.log('Trying alternative approach...\n');
    } else if (columnInfo && columnInfo.length > 0) {
      console.log('✅ Column information found:');
      console.log('   Column name:', columnInfo[0].column_name);
      console.log('   Data type:', columnInfo[0].data_type);
      console.log('   Is nullable:', columnInfo[0].is_nullable);
      console.log();
    } else {
      console.log('❌ geographic_features column not found in information_schema\n');
    }

    // Method 2: Check current values in the column
    console.log('2. Checking current values in geographic_features column...');
    
    const { data: distinctValues, error: valuesError } = await supabase
      .from('towns')
      .select('geographic_features')
      .not('geographic_features', 'is', null)
      .limit(10);

    if (valuesError) {
      console.error('❌ Error accessing geographic_features column:', valuesError.message);
      
      if (valuesError.message.includes('column "geographic_features" does not exist')) {
        console.log('📝 The geographic_features column does not exist in the towns table.');
        return;
      }
    } else {
      console.log('✅ Sample geographic_features values found:');
      if (distinctValues && distinctValues.length > 0) {
        distinctValues.forEach((row, index) => {
          console.log(`   ${index + 1}. "${row.geographic_features}" (Type: ${typeof row.geographic_features})`);
        });
        
        // Analyze the data types
        const dataTypes = distinctValues.map(row => typeof row.geographic_features);
        const uniqueTypes = [...new Set(dataTypes)];
        console.log('\n📊 Data type analysis:');
        console.log('   Unique JavaScript types found:', uniqueTypes.join(', '));
        
        // Check if any values are JSON strings or arrays
        let hasArrays = false;
        let hasJsonStrings = false;
        let hasSimpleStrings = false;
        
        distinctValues.forEach(row => {
          const value = row.geographic_features;
          if (Array.isArray(value)) {
            hasArrays = true;
          } else if (typeof value === 'string') {
            try {
              JSON.parse(value);
              hasJsonStrings = true;
            } catch {
              hasSimpleStrings = true;
            }
          }
        });
        
        console.log('   Contains arrays:', hasArrays ? 'Yes' : 'No');
        console.log('   Contains JSON strings:', hasJsonStrings ? 'Yes' : 'No');
        console.log('   Contains simple strings:', hasSimpleStrings ? 'Yes' : 'No');
        
      } else {
        console.log('   No non-null values found in geographic_features column');
      }
    }

    // Method 3: Get total count statistics
    console.log('\n3. Getting geographic_features statistics...');
    
    const { count: totalCount, error: totalError } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true });

    const { count: nonNullCount, error: nonNullError } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('geographic_features', 'is', null);

    const { count: nullCount, error: nullError } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .is('geographic_features', null);

    if (!totalError && !nonNullError && !nullError) {
      console.log('📊 Geographic features statistics:');
      console.log(`   Total towns: ${totalCount}`);
      console.log(`   Towns with geographic_features: ${nonNullCount || 0}`);
      console.log(`   Towns without geographic_features: ${nullCount || 0}`);
      console.log(`   Coverage: ${totalCount > 0 ? ((nonNullCount || 0) / totalCount * 100).toFixed(1) : 0}%`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ Geographic features column check completed!');
}

// Run the check
checkGeographicFeaturesColumn().catch(console.error);