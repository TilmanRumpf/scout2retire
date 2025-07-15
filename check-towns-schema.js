import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkSchema() {
  // Get a sample town to see all columns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (towns && towns.length > 0) {
    const town = towns[0];
    console.log('Current towns table columns:');
    console.log('----------------------------');
    Object.keys(town).sort().forEach(key => {
      const value = town[key];
      const type = value === null ? 'null' : typeof value;
      console.log(`${key}: ${type} (example: ${JSON.stringify(value)?.substring(0, 50)})`);
    });
  }
  
  // Check specifically for climate columns
  console.log('\n\nClimate-related columns:');
  console.log('------------------------');
  const climateColumns = [
    'avg_temp_summer',
    'avg_temp_winter', 
    'annual_rainfall_mm',
    'annual_sunshine_hours',
    'summer_climate',
    'summer_climate_actual',
    'winter_climate',
    'winter_climate_actual',
    'sunshine_level',
    'sunshine_level_actual',
    'precipitation_level',
    'precipitation_level_actual',
    'climate_data_source',
    'climate_estimated'
  ];
  
  if (towns && towns.length > 0) {
    const town = towns[0];
    climateColumns.forEach(col => {
      if (col in town) {
        console.log(`✓ ${col}: exists`);
      } else {
        console.log(`✗ ${col}: MISSING`);
      }
    });
  }
}

checkSchema().catch(console.error);