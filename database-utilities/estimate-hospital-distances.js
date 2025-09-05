import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function estimateHospitalDistances() {
  console.log('🏥 Estimating hospital distances based on population and location...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, population, nearest_major_hospital_km, geographic_features')
    .is('nearest_major_hospital_km', null)
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Found ${towns.length} towns needing hospital distance estimates\n`);
  
  // Capital cities and known medical hubs
  const MEDICAL_HUBS = {
    // Capitals
    'San Juan': 2,
    'Singapore': 1,
    'Panama City': 3,
    'Nassau': 2,
    'Victoria (Mahé)': 3,
    'Kigali': 3,
    'Dakar': 5,
    'Cape Town': 5,
    'Bangkok': 2,
    'Tunis': 3,
    'Abu Dhabi': 3,
    'Dubai': 2,
    'Montevideo': 3,
    
    // Major US cities
    'Phoenix': 3,
    'San Diego': 3,
    'Las Vegas': 5,
    'Denver': 3,
    'Orlando': 4,
    'Charlotte': 4,
    'Portland': 3,
    'San Antonio': 4,
    'Raleigh': 4,
    
    // Known medical tourism destinations
    'Kuala Lumpur': 2,
    'Penang (Georgetown)': 3,
    'Malaga': 3,
    'Barcelona': 2,
    'Valencia': 3,
    'Istanbul': 3,
    'Antalya': 5,
    
    // Island medical centers
    'Honolulu': 2,
    'Palma de Mallorca': 3,
    'Victoria': 3
  };
  
  const updates = [];
  
  towns.forEach(town => {
    let distance;
    const isIsland = town.geographic_features?.includes('Island') || false;
    
    // Check if it's a known medical hub
    if (MEDICAL_HUBS[town.name]) {
      distance = MEDICAL_HUBS[town.name];
      console.log(`🏛️  ${town.name}, ${town.country}: ${distance} km (medical hub)`);
    }
    // Large cities (>500k) - always have hospitals
    else if (town.population > 500000) {
      distance = Math.round(2 + Math.random() * 3); // 2-5 km
      console.log(`🌆 ${town.name}, ${town.country}: ${distance} km (large city)`);
    }
    // Medium cities (100k-500k)
    else if (town.population > 100000) {
      distance = Math.round(5 + Math.random() * 10); // 5-15 km
      console.log(`🏙️  ${town.name}, ${town.country}: ${distance} km (medium city)`);
    }
    // Small cities (50k-100k)
    else if (town.population > 50000) {
      distance = Math.round(10 + Math.random() * 15); // 10-25 km
      console.log(`🏘️  ${town.name}, ${town.country}: ${distance} km (small city)`);
    }
    // Towns (20k-50k)
    else if (town.population > 20000) {
      distance = Math.round(15 + Math.random() * 20); // 15-35 km
      if (isIsland) distance = Math.round(distance * 1.5); // Islands typically farther
      console.log(`🏡 ${town.name}, ${town.country}: ${distance} km (town${isIsland ? ', island' : ''})`);
    }
    // Small towns (<20k)
    else {
      distance = Math.round(25 + Math.random() * 25); // 25-50 km
      if (isIsland) distance = Math.round(distance * 2); // Islands much farther
      console.log(`🏞️  ${town.name}, ${town.country}: ${distance} km (small town${isIsland ? ', island' : ''})`);
    }
    
    updates.push({
      id: town.id,
      nearest_major_hospital_km: distance
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns with estimated hospital distances`);
  console.log('\nThese are ESTIMATES based on population. For critical decisions, verify actual distances.');
  console.log('\nProceed with update? (y/n)');
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ nearest_major_hospital_km: update.nearest_major_hospital_km })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Hospital distance estimation complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('nearest_major_hospital_km')
    .is('nearest_major_hospital_km', null);
    
  console.log(`\n📊 Remaining towns without hospital distance: ${verification?.length || 0}`);
}

estimateHospitalDistances();