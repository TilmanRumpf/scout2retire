import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfc2VydmljZV9yb2xlIiwiaWF0IjoxNzQ4NzA2MzQ1LCJleHAiOjIwNjQyODIzNDV9.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔧 FIXING SUNSHINE LEVEL VALUES');
console.log('=' .repeat(50));
console.log('NOTE: sunshine_hours field is NOT being touched - different field!');
console.log('Only fixing sunshine_level_actual\n');

// THE ONLY 3 ALLOWED VALUES
const ALLOWED_SUNSHINE = ['often_sunny', 'balanced', 'less_sunny'];

// Mapping for bad values
const SUNSHINE_MAP = {
  'mostly_sunny': 'often_sunny',  // 124 towns
  'abundant': 'often_sunny',      // 43 towns
  'sunny': 'often_sunny',         // 33 towns
  'partly_sunny': 'balanced',     // 2 towns
  'often_cloudy': 'less_sunny'    // 3 towns
};

async function fixSunshine() {
  // 1. Check current state
  const { data: before } = await supabase.from('towns').select('sunshine_level_actual');
  const beforeCounts = {};
  before?.forEach(t => {
    const val = t.sunshine_level_actual || 'null';
    beforeCounts[val] = (beforeCounts[val] || 0) + 1;
  });
  
  console.log('BEFORE:');
  Object.entries(beforeCounts).sort().forEach(([k,v]) => console.log(`  ${k}: ${v} towns`));
  
  // 2. Perform migration
  console.log('\n🔄 Migrating values...');
  
  for (const [oldValue, newValue] of Object.entries(SUNSHINE_MAP)) {
    const { data, error } = await supabase
      .from('towns')
      .update({ sunshine_level_actual: newValue })
      .eq('sunshine_level_actual', oldValue)
      .select();
    
    if (error) {
      console.error(`❌ Failed to update ${oldValue}:`, error);
    } else {
      console.log(`✅ ${oldValue} → ${newValue}: ${data?.length || 0} towns`);
    }
  }
  
  // 3. Verify final state
  const { data: after } = await supabase.from('towns').select('sunshine_level_actual');
  const afterCounts = {};
  after?.forEach(t => {
    const val = t.sunshine_level_actual || 'null';
    afterCounts[val] = (afterCounts[val] || 0) + 1;
  });
  
  console.log('\nAFTER:');
  Object.entries(afterCounts).sort().forEach(([k,v]) => console.log(`  ${k}: ${v} towns`));
  
  // 4. Validate
  const invalid = Object.keys(afterCounts).filter(k => 
    k !== 'null' && !ALLOWED_SUNSHINE.includes(k)
  );
  
  if (invalid.length > 0) {
    console.error('\n❌ STILL HAS INVALID VALUES:', invalid);
  } else {
    console.log('\n✅ SUCCESS! All sunshine_level_actual values are now valid.');
    console.log('Allowed values: often_sunny, balanced, less_sunny');
  }
}

fixSunshine();