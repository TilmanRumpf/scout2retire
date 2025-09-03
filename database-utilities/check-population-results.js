import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkResults() {
  console.log('📊 Checking town hobby population results...\n');

  // Count towns with hobbies
  const { data: townCounts, error: countError } = await supabase
    .from('towns_hobbies')
    .select('town_id')
    .order('town_id');

  if (countError) {
    console.error('Error:', countError);
    return;
  }

  // Get unique town IDs
  const uniqueTownIds = new Set(townCounts.map(t => t.town_id));
  
  // Get total towns
  const { count: totalTowns } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });

  // Get towns with photos
  const { data: townsWithPhotos } = await supabase
    .from('towns')
    .select('id, name, country')
    .not('photos', 'is', null)
    .limit(5);

  // Get hobby count distribution
  const hobbyCountsByTown = {};
  townCounts.forEach(t => {
    hobbyCountsByTown[t.town_id] = (hobbyCountsByTown[t.town_id] || 0) + 1;
  });

  const distribution = {};
  Object.values(hobbyCountsByTown).forEach(count => {
    const bucket = Math.floor(count / 5) * 5;
    distribution[`${bucket}-${bucket+4} hobbies`] = (distribution[`${bucket}-${bucket+4} hobbies`] || 0) + 1;
  });

  console.log('✅ POPULATION RESULTS:');
  console.log('====================');
  console.log(`Towns with hobbies: ${uniqueTownIds.size} / ${totalTowns}`);
  console.log(`Towns without hobbies: ${totalTowns - uniqueTownIds.size}`);
  console.log(`Total hobby assignments: ${townCounts.length}`);
  console.log(`Average hobbies per town: ${(townCounts.length / uniqueTownIds.size).toFixed(1)}`);
  
  console.log('\n📊 Distribution:');
  Object.entries(distribution)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([range, count]) => {
      console.log(`  ${range}: ${count} towns`);
    });

  console.log('\n📷 Sample towns with photos:');
  if (townsWithPhotos) {
    for (const town of townsWithPhotos) {
      const hobbyCount = hobbyCountsByTown[town.id] || 0;
      console.log(`  - ${town.name}, ${town.country}: ${hobbyCount} hobbies`);
    }
  }

  // Check if we need to run again
  const townsWithoutHobbies = totalTowns - uniqueTownIds.size;
  if (townsWithoutHobbies > 0) {
    console.log(`\n⚠️  ${townsWithoutHobbies} towns still need hobbies!`);
    
    // Get a few examples
    const { data: needHobbies } = await supabase
      .from('towns')
      .select('id, name, country')
      .not('id', 'in', `(${Array.from(uniqueTownIds).join(',')})`)
      .limit(5);
    
    if (needHobbies && needHobbies.length > 0) {
      console.log('\nExamples of towns without hobbies:');
      needHobbies.forEach(t => {
        console.log(`  - ${t.name}, ${t.country}`);
      });
    }
  } else {
    console.log('\n🎉 ALL TOWNS HAVE HOBBIES!');
  }
}

checkResults().catch(console.error);