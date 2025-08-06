import { createClient } from '@supabase/supabase-js';
import { TOWN_DATA_OPTIONS, getFieldOptions } from './src/utils/townDataOptions.js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function testNormalization() {
  console.log('=== Testing Data Normalization Options ===\n');
  
  // Get all unique values from database
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*');
  
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  // Test key fields
  const testFields = [
    'country',
    'geo_region',
    'regions',
    'climate',
    'pace_of_life',
    'urban_rural_character',
    'summer_climate_actual',
    'winter_climate_actual',
    'humidity_level_actual'
  ];
  
  console.log('📊 Field Coverage Report:\n');
  
  for (const field of testFields) {
    const uniqueValues = new Set();
    let nullCount = 0;
    
    for (const town of towns) {
      if (town[field] === null || town[field] === '') {
        nullCount++;
      } else if (Array.isArray(town[field])) {
        town[field].forEach(v => uniqueValues.add(v));
      } else {
        uniqueValues.add(town[field]);
      }
    }
    
    const options = getFieldOptions(field);
    const dbValues = Array.from(uniqueValues).sort();
    
    console.log(`\n📌 ${field}:`);
    console.log(`  - Null/Empty: ${nullCount}/${towns.length} (${Math.round(nullCount/towns.length*100)}%)`);
    console.log(`  - Unique values in DB: ${dbValues.length}`);
    console.log(`  - Options defined: ${options ? options.length : 0}`);
    
    if (options && dbValues.length > 0) {
      // Check for values not in options
      const missingFromOptions = dbValues.filter(v => 
        !options.includes(v) && 
        !(Array.isArray(options) && options.some(opt => 
          typeof opt === 'object' && opt.value === v
        ))
      );
      
      if (missingFromOptions.length > 0) {
        console.log(`  ⚠️  Values in DB but not in options:`);
        missingFromOptions.slice(0, 5).forEach(v => 
          console.log(`     - "${v}"`)
        );
        if (missingFromOptions.length > 5) {
          console.log(`     ... and ${missingFromOptions.length - 5} more`);
        }
      } else {
        console.log(`  ✅ All DB values covered by options`);
      }
    }
  }
  
  // Summary statistics
  console.log('\n\n=== Summary Statistics ===\n');
  console.log(`Total towns: ${towns.length}`);
  console.log(`Total defined options: ${Object.keys(TOWN_DATA_OPTIONS).length} categories`);
  
  // Count towns with high completion
  const highCompletion = towns.filter(t => {
    const filledFields = Object.values(t).filter(v => 
      v !== null && v !== '' && v !== 'NULL'
    ).length;
    return filledFields > 30;
  });
  
  console.log(`Towns with >30 filled fields: ${highCompletion.length} (${Math.round(highCompletion.length/towns.length*100)}%)`);
}

testNormalization().catch(console.error);