import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkCultureColumns() {
  console.log('Checking culture-related columns in towns table:\n');
  
  // Get a sample town to see all columns
  const { data: sampleTown, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Check for existence of proposed columns
  const cultureColumns = [
    'urban_rural_character',
    'pace_of_life',
    'pace_of_life_actual',
    'expat_community_size',
    'languages_spoken',
    'dining_nightlife_level',
    'cultural_events_level',
    'museums_level',
    'primary_language',
    'english_proficiency_level'
  ];
  
  console.log('Column existence check:');
  cultureColumns.forEach(col => {
    const exists = sampleTown[0] && col in sampleTown[0];
    console.log(`  ${col}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  });
  
  // Get distinct values for key columns
  console.log('\n\nDistinct values per column:');
  
  for (const col of cultureColumns) {
    if (sampleTown[0] && col in sampleTown[0]) {
      const { data, error } = await supabase
        .from('towns')
        .select(col)
        .not(col, 'is', null);
      
      if (data) {
        const uniqueValues = [...new Set(data.map(row => row[col]))];
        const nullCount = 341 - data.length;
        console.log(`\n${col}:`);
        console.log(`  Non-null: ${data.length}, NULL: ${nullCount}`);
        if (Array.isArray(uniqueValues[0])) {
          console.log(`  Values: [Array field - various combinations]`);
        } else {
          console.log(`  Values: ${uniqueValues.slice(0, 5).join(', ')}${uniqueValues.length > 5 ? '...' : ''}`);
        }
      }
    }
  }
}

checkCultureColumns();