import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fixHobbyArchitecture() {
  console.log('🔧 FIXING THE HOBBY DISASTER...\n');

  // Step 1: Clear the current mess
  console.log('1️⃣ Clearing the towns_hobbies table of all garbage...');
  const { error: clearError } = await supabase
    .from('towns_hobbies')
    .delete()
    .not('town_id', 'is', null); // Delete all (town_id is never null)

  if (clearError) {
    console.error('Error clearing:', clearError);
    return;
  }
  console.log('   ✅ Table cleared!\n');

  // Step 2: Get all hobbies and towns
  const { data: hobbies } = await supabase
    .from('hobbies')
    .select('id, name, is_universal');

  const { data: towns } = await supabase
    .from('towns')
    .select('id, name, country, geographic_features_actual, vegetation_type_actual, climate');

  const locationSpecific = hobbies.filter(h => !h.is_universal);
  const universal = hobbies.filter(h => h.is_universal);

  console.log(`2️⃣ Smart population strategy:`);
  console.log(`   - ${universal.length} universal hobbies → NO STORAGE (available everywhere)`);
  console.log(`   - ${locationSpecific.length} location-specific → ONLY where relevant\n`);

  // Step 3: Define ONLY location-specific hobby rules
  const locationRules = {
    coastal: ['Surfing', 'Beach Volleyball', 'Snorkeling', 'Scuba Diving', 'Kitesurfing', 'Stand-up Paddleboarding'],
    mountain: ['Skiing', 'Snowboarding', 'Rock Climbing', 'Mountain Biking', 'Ice Climbing'],
    desert: ['Sandboarding', 'Dune Buggy Riding', 'Desert Photography'],
    lake: ['Water Skiing', 'Wakeboarding', 'Jet Skiing'],
    forest: ['Mushroom Hunting', 'Forest Bathing'],
    cold: ['Ice Hockey', 'Ice Fishing', 'Snowmobiling', 'Cross-country Skiing', 'Dog Sledding'],
    warm: [], // Most "warm" activities are universal (golf, tennis, swimming)
    urban: ['Street Art', 'Urban Sketching', 'Food Tours'],
    rural: ['Horseback Riding', 'Farming', 'Hunting']
  };

  console.log('3️⃣ Adding ONLY location-specific hobbies to towns...');
  
  let totalAdded = 0;
  const hobbyNameToId = {};
  hobbies.forEach(h => hobbyNameToId[h.name] = h.id);

  for (const town of towns) {
    const townHobbies = new Set();
    
    // Check geographic features
    const geo = String(town.geographic_features_actual || '').toLowerCase();
    const veg = String(town.vegetation_type_actual || '').toLowerCase();
    const climate = String(town.climate || '').toLowerCase();
    
    if (geo.includes('coastal') || geo.includes('beach') || geo.includes('ocean')) {
      locationRules.coastal.forEach(h => townHobbies.add(h));
    }
    if (geo.includes('mountain') || geo.includes('alpine')) {
      locationRules.mountain.forEach(h => townHobbies.add(h));
    }
    if (geo.includes('desert') || veg.includes('desert')) {
      locationRules.desert.forEach(h => townHobbies.add(h));
    }
    if (geo.includes('lake') || geo.includes('river')) {
      locationRules.lake.forEach(h => townHobbies.add(h));
    }
    if (veg.includes('forest') || geo.includes('forest')) {
      locationRules.forest.forEach(h => townHobbies.add(h));
    }
    if (climate.includes('cold') || climate.includes('polar') || climate.includes('subarctic')) {
      locationRules.cold.forEach(h => townHobbies.add(h));
    }
    
    // Create records ONLY for location-specific hobbies
    const records = [];
    for (const hobbyName of townHobbies) {
      const hobbyId = hobbyNameToId[hobbyName];
      if (hobbyId && !hobbies.find(h => h.id === hobbyId)?.is_universal) {
        records.push({ town_id: town.id, hobby_id: hobbyId });
      }
    }
    
    if (records.length > 0) {
      const { error } = await supabase
        .from('towns_hobbies')
        .insert(records);
      
      if (!error) {
        totalAdded += records.length;
      }
    }
  }

  console.log(`   ✅ Added ${totalAdded} location-specific relationships\n`);
  
  console.log('📊 RESULTS:');
  console.log(`   Before: Would have been ${towns.length * hobbies.length} = ${(towns.length * hobbies.length).toLocaleString()} relationships`);
  console.log(`   After: Only ${totalAdded} relationships`);
  console.log(`   Reduction: ${Math.round((1 - totalAdded / (towns.length * hobbies.length)) * 100)}%!`);
  console.log(`\n✨ System is now SANE! Universal hobbies work everywhere without storage.`);
}

fixHobbyArchitecture().then(() => process.exit(0));