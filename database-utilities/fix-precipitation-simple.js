import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

console.log('🔧 FIXING PRECIPITATION VALUES');
console.log('=' .repeat(50));

async function migrate() {
  // Count before
  const { data: towns } = await supabase.from('towns').select('id, precipitation_level_actual');
  console.log(`\nTotal towns: ${towns?.length || 0}`);
  
  // Update often_rainy → less_dry
  const { data: d1, error: e1 } = await supabase
    .from('towns')
    .update({ precipitation_level_actual: 'less_dry' })
    .eq('precipitation_level_actual', 'often_rainy')
    .select();
  console.log(`Updated often_rainy → less_dry: ${d1?.length || 0} towns`);
  
  // Update moderate → balanced
  const { data: d2, error: e2 } = await supabase
    .from('towns')
    .update({ precipitation_level_actual: 'balanced' })
    .eq('precipitation_level_actual', 'moderate')
    .select();
  console.log(`Updated moderate → balanced: ${d2?.length || 0} towns`);
  
  // Update dry → mostly_dry
  const { data: d3, error: e3 } = await supabase
    .from('towns')
    .update({ precipitation_level_actual: 'mostly_dry' })
    .eq('precipitation_level_actual', 'dry')
    .select();
  console.log(`Updated dry → mostly_dry: ${d3?.length || 0} towns`);
  
  // Verify final state
  const { data: final } = await supabase.from('towns').select('precipitation_level_actual');
  const counts = {};
  final?.forEach(t => {
    const val = t.precipitation_level_actual || 'null';
    counts[val] = (counts[val] || 0) + 1;
  });
  
  console.log('\n✅ Final values:');
  Object.entries(counts).sort().forEach(([k,v]) => console.log(`  ${k}: ${v} towns`));
  
  // Check for invalid values
  const valid = ['mostly_dry', 'balanced', 'less_dry', 'null'];
  const invalid = Object.keys(counts).filter(k => !valid.includes(k));
  if (invalid.length > 0) {
    console.error('❌ INVALID VALUES REMAIN:', invalid);
  } else {
    console.log('\n✅ SUCCESS - All values normalized!');
  }
}

migrate();