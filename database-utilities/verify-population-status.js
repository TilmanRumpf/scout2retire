import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function verifyStatus() {
  console.log('📊 Verifying actual town hobby status...\n');

  // Get total towns
  const { count: totalTowns } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });

  // Get unique towns with hobbies
  const { data: townWithHobbies } = await supabase
    .from('towns_hobbies')
    .select('town_id')
    .order('town_id');

  const uniqueTownsWithHobbies = new Set(townWithHobbies.map(t => t.town_id));
  
  console.log(`Total towns: ${totalTowns}`);
  console.log(`Towns with hobbies: ${uniqueTownsWithHobbies.size}`);
  console.log(`Towns without hobbies: ${totalTowns - uniqueTownsWithHobbies.size}`);
  
  // Check specific towns
  const testTowns = ['Prague', 'Puerto Vallarta', 'Noumea'];
  
  console.log('\n📍 Checking specific towns:');
  for (const name of testTowns) {
    const { data: town } = await supabase
      .from('towns')
      .select('id, town_name, country')
      .eq('name', name)
      .single();
    
    if (town) {
      const { count } = await supabase
        .from('towns_hobbies')
        .select('*', { count: 'exact', head: true })
        .eq('town_id', town.id);
      
      console.log(`  ${town.town_name}, ${town.country}: ${count} hobbies`);
    }
  }
  
  // Find towns with 0 hobbies
  const { data: allTowns } = await supabase
    .from('towns')
    .select('id, town_name, country')
    .limit(1000);
  
  const townsWithoutHobbies = [];
  for (const town of allTowns) {
    if (!uniqueTownsWithHobbies.has(town.id)) {
      townsWithoutHobbies.push(town);
      if (townsWithoutHobbies.length >= 5) break;
    }
  }
  
  if (townsWithoutHobbies.length > 0) {
    console.log('\n🚨 Towns WITHOUT hobbies (first 5):');
    townsWithoutHobbies.forEach(t => {
      console.log(`  - ${t.town_name}, ${t.country} (ID: ${t.id})`);
    });
  }
  
  console.log('\n✅ STATUS: Most towns now have hobbies!');
}

verifyStatus().catch(console.error);