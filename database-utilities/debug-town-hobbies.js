import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
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