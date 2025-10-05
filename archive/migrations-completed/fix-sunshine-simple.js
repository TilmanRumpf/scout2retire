import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

console.log('🔧 FIXING SUNSHINE LEVEL VALUES');
console.log('=' .repeat(50));

async function fix() {
  // mostly_sunny → often_sunny (124 towns)
  const { data: d1 } = await supabase
    .from('towns')
    .update({ sunshine_level_actual: 'often_sunny' })
    .eq('sunshine_level_actual', 'mostly_sunny')
    .select();
  console.log(`mostly_sunny → often_sunny: ${d1?.length || 0} towns`);
  
  // abundant → often_sunny (43 towns)
  const { data: d2 } = await supabase
    .from('towns')
    .update({ sunshine_level_actual: 'often_sunny' })
    .eq('sunshine_level_actual', 'abundant')
    .select();
  console.log(`abundant → often_sunny: ${d2?.length || 0} towns`);
  
  // sunny → often_sunny (33 towns)
  const { data: d3 } = await supabase
    .from('towns')
    .update({ sunshine_level_actual: 'often_sunny' })
    .eq('sunshine_level_actual', 'sunny')
    .select();
  console.log(`sunny → often_sunny: ${d3?.length || 0} towns`);
  
  // partly_sunny → balanced (2 towns)
  const { data: d4 } = await supabase
    .from('towns')
    .update({ sunshine_level_actual: 'balanced' })
    .eq('sunshine_level_actual', 'partly_sunny')
    .select();
  console.log(`partly_sunny → balanced: ${d4?.length || 0} towns`);
  
  // often_cloudy → less_sunny (3 towns)
  const { data: d5 } = await supabase
    .from('towns')
    .update({ sunshine_level_actual: 'less_sunny' })
    .eq('sunshine_level_actual', 'often_cloudy')
    .select();
  console.log(`often_cloudy → less_sunny: ${d5?.length || 0} towns`);
  
  // Final check
  const { data: final } = await supabase.from('towns').select('sunshine_level_actual');
  const counts = {};
  final?.forEach(t => {
    const val = t.sunshine_level_actual || 'null';
    counts[val] = (counts[val] || 0) + 1;
  });
  
  console.log('\n✅ Final sunshine values:');
  Object.entries(counts).sort().forEach(([k,v]) => console.log(`  ${k}: ${v} towns`));
  
  const invalid = Object.keys(counts).filter(k => 
    k !== 'null' && !['often_sunny', 'balanced', 'less_sunny'].includes(k)
  );
  
  if (invalid.length > 0) {
    console.error('❌ STILL INVALID:', invalid);
  } else {
    console.log('\n✅ ALL SUNSHINE VALUES FIXED!');
  }
}

fix();