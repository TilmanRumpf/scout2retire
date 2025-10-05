import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function populateTownHobbies() {
  console.log('🎯 Starting town hobby population...\n');

  // First, get all hobbies from database
  const { data: allHobbies, error: hobbyError } = await supabase
    .from('hobbies')
    .select('id, name, group_name, is_universal');

  if (hobbyError) {
    console.error('Error fetching hobbies:', hobbyError);
    return;
  }

  // Create hobby lookup maps
  const hobbyMap = {};
  allHobbies.forEach(h => {
    hobbyMap[h.name.toLowerCase()] = h.id;
  });

  // Get all towns that need hobbies
  const { data: towns, error: townError } = await supabase
    .from('towns')
    .select('id, name, country, geographic_features_actual, vegetation_type_actual, population, climate');

  if (townError) {
    console.error('Error fetching towns:', townError);
    return;
  }

  // Get existing town-hobby assignments to avoid duplicates
  const { data: existingAssignments, error: assignError } = await supabase
    .from('towns_hobbies')
    .select('town_id, hobby_id');

  const existingMap = new Set();
  const townHobbyCount = {};
  existingAssignments?.forEach(a => {
    existingMap.add(`${a.town_id}-${a.hobby_id}`);
    townHobbyCount[a.town_id] = (townHobbyCount[a.town_id] || 0) + 1;
  });

  // Get list of towns that need hobbies (less than 10 hobbies assigned)
  const townsNeedingHobbies = towns.filter(t => !townHobbyCount[t.id] || townHobbyCount[t.id] < 10);

  console.log(`Found ${towns.length} towns total`);
  console.log(`Found ${townsNeedingHobbies.length} towns needing hobbies`);
  console.log(`Found ${allHobbies.length} hobbies available`);
  console.log(`${existingAssignments?.length || 0} existing assignments\n`);

  // Define hobby assignment rules based on town characteristics
  const assignmentRules = {
    coastal: ['swimming', 'surfing', 'sailing', 'beach volleyball', 'fishing', 'kayaking', 'snorkeling', 'boating'],
    mountain: ['hiking', 'mountain biking', 'rock climbing', 'skiing', 'snowboarding', 'camping'],
    desert: ['hiking', 'rock climbing', 'stargazing', 'photography', 'camping'],
    forest: ['hiking', 'camping', 'bird watching', 'photography', 'mountain biking', 'hunting'],
    lake: ['fishing', 'boating', 'kayaking', 'swimming', 'sailing', 'water skiing'],
    urban: ['museums', 'theater', 'concerts', 'restaurants', 'shopping', 'art galleries'],
    rural: ['gardening', 'horseback riding', 'farming', 'hunting', 'fishing'],
    // Climate based
    warm: ['golf', 'tennis', 'swimming', 'water sports'],
    cold: ['ice skating', 'ice hockey', 'snowmobiling', 'ice fishing', 'cross-country skiing'],
    // Universal (all towns)
    universal: ['walking', 'reading', 'cooking', 'photography', 'volunteering', 'yoga', 'cycling']
  };

  let totalAssigned = 0;
  let townsProcessed = 0;

  for (const town of townsNeedingHobbies) {

    const hobbiesForTown = new Set();
    
    // Add universal hobbies
    assignmentRules.universal.forEach(h => hobbiesForTown.add(h));

    // Add based on geographic features
    const geoFeatures = String(town.geographic_features_actual || '').toLowerCase();
    if (geoFeatures.includes('coastal') || geoFeatures.includes('beach')) {
      assignmentRules.coastal.forEach(h => hobbiesForTown.add(h));
    }
    if (geoFeatures.includes('mountain')) {
      assignmentRules.mountain.forEach(h => hobbiesForTown.add(h));
    }
    if (geoFeatures.includes('desert')) {
      assignmentRules.desert.forEach(h => hobbiesForTown.add(h));
    }
    if (geoFeatures.includes('forest') || String(town.vegetation_type_actual || '').includes('forest')) {
      assignmentRules.forest.forEach(h => hobbiesForTown.add(h));
    }
    if (geoFeatures.includes('lake') || geoFeatures.includes('river')) {
      assignmentRules.lake.forEach(h => hobbiesForTown.add(h));
    }

    // Add based on population (urban vs rural)
    if (town.population > 50000) {
      assignmentRules.urban.forEach(h => hobbiesForTown.add(h));
    } else if (town.population < 10000) {
      assignmentRules.rural.forEach(h => hobbiesForTown.add(h));
    }

    // Add climate-based hobbies
    const climate = String(town.climate || '').toLowerCase();
    if (climate.includes('tropical') || climate.includes('warm') || climate.includes('hot')) {
      assignmentRules.warm.forEach(h => hobbiesForTown.add(h));
    }
    if (climate.includes('cold') || climate.includes('snow') || climate.includes('winter')) {
      assignmentRules.cold.forEach(h => hobbiesForTown.add(h));
    }

    // Insert hobbies for this town
    const insertData = [];
    for (const hobbyName of hobbiesForTown) {
      const hobbyId = hobbyMap[hobbyName];
      if (hobbyId && !existingMap.has(`${town.id}-${hobbyId}`)) {
        insertData.push({
          town_id: town.id,
          hobby_id: hobbyId
        });
      }
    }

    if (insertData.length > 0) {
      const { error: insertError } = await supabase
        .from('towns_hobbies')
        .insert(insertData);

      if (insertError) {
        console.error(`Error inserting hobbies for ${town.name}, ${town.country}:`, insertError);
      } else {
        totalAssigned += insertData.length;
        townsProcessed++;
        if (townsProcessed % 10 === 0) {
          console.log(`✓ Processed ${townsProcessed} towns, assigned ${totalAssigned} hobbies`);
        }
      }
    }
  }

  console.log('\n✅ Population complete!');
  console.log(`   Towns processed: ${townsProcessed}`);
  console.log(`   Total hobbies assigned: ${totalAssigned}`);
  console.log(`   Average per town: ${(totalAssigned / townsProcessed).toFixed(1)}`);
}

populateTownHobbies().catch(console.error);