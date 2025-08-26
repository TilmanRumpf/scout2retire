import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function populateSpecificHobbies() {
  console.log('🎯 Smart hobby population - only location-specific hobbies\n');

  // Get all non-universal hobbies with their conditions
  const { data: specificHobbies, error: hobbyError } = await supabase
    .from('hobbies')
    .select('*')
    .eq('is_universal', false);

  if (hobbyError) {
    console.error('Error fetching hobbies:', hobbyError);
    return;
  }

  console.log(`📋 Found ${specificHobbies.length} location-specific hobbies\n`);

  // Get all towns
  const { data: towns, error: townError } = await supabase
    .from('towns')
    .select('*');

  if (townError) {
    console.error('Error fetching towns:', townError);
    return;
  }

  console.log(`🏘️ Processing ${towns.length} towns...\n`);

  // Clear existing town_hobbies (start fresh)
  await supabase.from('town_hobbies').delete().gte('id', '00000000-0000-0000-0000-000000000000');

  let totalAssociations = 0;

  for (const town of towns) {
    const townHobbies = [];
    
    for (const hobby of specificHobbies) {
      const conditions = hobby.required_conditions?.needs || [];
      let shouldAdd = false;

      // Check each condition
      for (const condition of conditions) {
        switch(condition) {
          case 'ocean':
            shouldAdd = town.near_ocean === true || 
                       town.distance_to_ocean < 30 ||
                       town.geographic_features?.includes('coastal');
            break;
            
          case 'mountains':
            shouldAdd = town.near_mountains === true ||
                       town.geographic_features?.includes('mountains') ||
                       town.geographic_features?.includes('mountainous');
            break;
            
          case 'cold_climate':
            shouldAdd = town.winter_temp_avg < 40 || 
                       town.state_code?.match(/AK|ME|VT|NH|MN|WI|MI|ND|SD|MT|WY|ID/);
            break;
            
          case 'warm_climate':
            shouldAdd = town.summer_temp_avg > 75 || 
                       town.state_code?.match(/FL|TX|AZ|CA|HI|LA|GA|SC|NC/);
            break;
            
          case 'golf_course':
            shouldAdd = town.activity_infrastructure?.golf_courses > 0;
            break;
            
          case 'tennis_courts':
            shouldAdd = town.activity_infrastructure?.tennis_courts > 0 ||
                       town.population > 10000; // Larger towns likely have courts
            break;
            
          case 'water_body':
            shouldAdd = town.near_ocean || 
                       town.geographic_features?.includes('lake') ||
                       town.geographic_features?.includes('river') ||
                       town.geographic_features?.includes('coastal');
            break;
            
          case 'wine_region':
            shouldAdd = town.state_code?.match(/CA|OR|WA|NY/) ||
                       town.country?.match(/France|Italy|Spain|Portugal/);
            break;
            
          case 'rural':
          case 'space':
            shouldAdd = town.population < 50000 ||
                       town.geographic_features?.includes('rural');
            break;
            
          case 'basic_facilities':
            shouldAdd = town.population > 5000; // Most towns over 5k have basic facilities
            break;
            
          default:
            shouldAdd = true; // Default to including if condition unknown
        }
        
        if (!shouldAdd) break; // If any condition fails, don't add
      }

      if (shouldAdd) {
        townHobbies.push({
          town_id: town.id,
          hobby_id: hobby.id
        });
      }
    }

    // Insert hobbies for this town
    if (townHobbies.length > 0) {
      const { error: insertError } = await supabase
        .from('town_hobbies')
        .insert(townHobbies);

      if (!insertError) {
        console.log(`✅ ${town.name}: ${townHobbies.length} specific hobbies`);
        totalAssociations += townHobbies.length;
      } else {
        console.log(`❌ Error with ${town.name}:`, insertError.message);
      }
    } else {
      console.log(`🔹 ${town.name}: Only universal hobbies (no specific ones)`);
    }
  }

  console.log('\n📊 RESULTS:');
  console.log(`   Total specific associations: ${totalAssociations}`);
  console.log(`   Average per town: ${(totalAssociations / towns.length).toFixed(1)}`);
  console.log(`   Data efficiency: Avoided storing ~${towns.length * 65} universal hobby rows`);
  
  // Show sample
  const { data: sample } = await supabase
    .from('town_hobbies')
    .select(`
      town:towns(name, state_code),
      hobby:hobbies(name, required_conditions)
    `)
    .limit(20);

  if (sample) {
    console.log('\n📝 Sample specific hobby assignments:');
    sample.forEach(s => {
      const conditions = s.hobby.required_conditions?.needs?.join(', ') || 'none';
      console.log(`   ${s.town.name}, ${s.town.state_code} → ${s.hobby.name} (needs: ${conditions})`);
    });
  }

  // Stats
  const { count: universalCount } = await supabase
    .from('hobbies')
    .select('*', { count: 'exact', head: true })
    .eq('is_universal', true);

  console.log('\n💡 SMART DATA DESIGN:');
  console.log(`   Universal hobbies: ${universalCount} (available everywhere, no storage needed)`);
  console.log(`   Location-specific: ${specificHobbies.length} (stored only where applicable)`);
  console.log(`   Storage saved: ${(towns.length * universalCount).toLocaleString()} unnecessary rows!`);
}

populateSpecificHobbies().catch(console.error);