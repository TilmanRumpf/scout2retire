import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function debugTownHobbies() {
  console.log('🔍 Debugging town hobbies...\n');

  // Get a sample town without hobbies
  const { data: sampleTowns } = await supabase
    .from('towns')
    .select('id, name, country, geographic_features_actual, population, climate')
    .eq('name', 'Prague')
    .limit(1);

  if (sampleTowns && sampleTowns.length > 0) {
    const town = sampleTowns[0];
    console.log('Sample town (Prague):');
    console.log(`  ID: ${town.id}`);
    console.log(`  Name: ${town.name}, ${town.country}`);
    console.log(`  Geographic features: ${town.geographic_features_actual}`);
    console.log(`  Population: ${town.population}`);
    console.log(`  Climate: ${town.climate}`);

    // Check if it has any hobbies
    const { data: hobbies, error } = await supabase
      .from('towns_hobbies')
      .select('hobby_id')
      .eq('town_id', town.id);

    console.log(`\n  Existing hobbies: ${hobbies ? hobbies.length : 0}`);
    if (error) console.log(`  Error: ${error.message}`);

    // Try inserting one hobby
    const { data: walkingHobby } = await supabase
      .from('hobbies')
      .select('id')
      .eq('name', 'Walking')
      .single();

    if (walkingHobby) {
      console.log(`\n  Attempting to insert Walking (${walkingHobby.id}) for Prague...`);
      
      const { error: insertError } = await supabase
        .from('towns_hobbies')
        .insert({
          town_id: town.id,
          hobby_id: walkingHobby.id
        });

      if (insertError) {
        console.log(`  ❌ Insert failed: ${insertError.message}`);
      } else {
        console.log(`  ✅ Insert successful!`);
      }
    }
  }
}

debugTownHobbies().catch(console.error);