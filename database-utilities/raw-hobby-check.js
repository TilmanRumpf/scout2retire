import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function rawCheck() {
  console.log('RAW HOBBY DATA CHECK');
  console.log('===================\n');

  try {
    // Direct SQL approach
    const { data, error } = await supabase.rpc('get_hobby_counts', {});
    
    if (error) {
      console.log('RPC not available, using manual approach...\n');
      
      // Manual count
      const { data: rawData, error: rawError } = await supabase
        .from('towns_hobbies')
        .select('hobby_id');
      
      const { data: hobbies, error: hobbiesError } = await supabase
        .from('hobbies')
        .select('id, town_name');
      
      if (rawError || hobbiesError) {
        console.error('Errors:', rawError, hobbiesError);
        return;
      }
      
      console.log(`Raw town_hobbies rows: ${rawData.length}`);
      console.log(`Total hobbies: ${hobbies.length}\n`);
      
      // Count each hobby
      const counts = {};
      rawData.forEach(row => {
        counts[row.hobby_id] = (counts[row.hobby_id] || 0) + 1;
      });
      
      const hobbyMap = {};
      hobbies.forEach(hobby => {
        hobbyMap[hobby.id] = hobby.name;
      });
      
      const countArray = Object.entries(counts).map(([hobbyId, count]) => ({
        name: hobbyMap[hobbyId],
        count
      }));
      
      countArray.sort((a, b) => b.count - a.count);
      
      console.log('TOP 20 HOBBY ASSIGNMENTS:');
      console.log('-------------------------');
      countArray.slice(0, 20).forEach((hobby, index) => {
        console.log(`${index + 1}. ${hobby.name}: ${hobby.count}`);
      });
      
      console.log('\nBOTTOM 20 HOBBY ASSIGNMENTS:');
      console.log('----------------------------');
      countArray.slice(-20).reverse().forEach((hobby, index) => {
        console.log(`${index + 1}. ${hobby.name}: ${hobby.count}`);
      });
      
      // Check for universal assignments (>300)
      const universal = countArray.filter(h => h.count > 300);
      console.log(`\n🚨 UNIVERSAL ASSIGNMENTS (>300): ${universal.length}`);
      universal.forEach(hobby => {
        console.log(`  ${hobby.name}: ${hobby.count}`);
      });
      
      // Check town without hobbies
      const { data: townsWithoutHobbies, error: townError } = await supabase
        .from('towns')
        .select('id, town_name, country')
        .not('id', 'in', rawData.map(r => r.town_id));
      
      console.log(`\nTowns without any hobbies: ${townsWithoutHobbies?.length || 'Error'}`);
      if (townsWithoutHobbies) {
        townsWithoutHobbies.slice(0, 10).forEach(town => {
          console.log(`  ${town.town_name}, ${town.country}`);
        });
      }
      
    } else {
      console.log('RPC result:', data);
    }

  } catch (error) {
    console.error('Check failed:', error);
  }
}

rawCheck();