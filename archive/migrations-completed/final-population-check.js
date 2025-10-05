import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function finalCheck() {
  console.log('🎯 FINAL POPULATION CHECK\n');
  console.log('='.repeat(50));

  // Get total counts
  const { count: totalTowns } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });

  const { count: totalAssignments } = await supabase
    .from('towns_hobbies')
    .select('*', { count: 'exact', head: true });

  // Get distribution
  const { data: allTowns } = await supabase
    .from('towns')
    .select('id, name, country');

  let townsWithHobbies = 0;
  let townsWithoutHobbies = 0;
  const distribution = {};
  
  for (const town of allTowns) {
    const { count } = await supabase
      .from('towns_hobbies')
      .select('*', { count: 'exact', head: true })
      .eq('town_id', town.id);
    
    if (count > 0) {
      townsWithHobbies++;
      const bucket = Math.floor(count / 10) * 10;
      const key = `${bucket}-${bucket+9}`;
      distribution[key] = (distribution[key] || 0) + 1;
    } else {
      townsWithoutHobbies++;
    }
  }

  console.log(`📊 RESULTS:`);
  console.log(`  Total towns: ${totalTowns}`);
  console.log(`  Towns with hobbies: ${townsWithHobbies}`);
  console.log(`  Towns without hobbies: ${townsWithoutHobbies}`);
  console.log(`  Total hobby assignments: ${totalAssignments}`);
  
  if (townsWithHobbies > 0) {
    console.log(`  Average hobbies per town: ${(totalAssignments / townsWithHobbies).toFixed(1)}`);
  }

  console.log('\n📈 DISTRIBUTION:');
  Object.entries(distribution)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([range, count]) => {
      const bar = '█'.repeat(Math.min(count / 5, 40));
      console.log(`  ${range.padEnd(10)} ${count.toString().padStart(3)} towns ${bar}`);
    });

  if (townsWithoutHobbies === 0) {
    console.log('\n🎉 SUCCESS: ALL TOWNS NOW HAVE HOBBIES!');
  } else {
    console.log(`\n⚠️  ${townsWithoutHobbies} towns still need hobbies`);
  }
}

finalCheck().catch(console.error);