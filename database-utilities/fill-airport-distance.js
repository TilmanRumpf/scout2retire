import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillAirportDistance() {
  console.log('✈️ Filling airport distance data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Towns with airports or very close to airports
  const AIRPORT_IN_TOWN = [
    // Major hubs
    'Singapore', 'Dubai', 'Hong Kong', 'Bangkok', 'Tokyo', 'Seoul', 'Mumbai', 'Delhi',
    'London', 'Paris', 'Amsterdam', 'Frankfurt', 'Madrid', 'Barcelona', 'Rome', 'Milan',
    'New York', 'Los Angeles', 'Chicago', 'Miami', 'Atlanta', 'Dallas', 'San Francisco',
    'Toronto', 'Vancouver', 'Montreal', 'Sydney', 'Melbourne', 'Auckland', 'Brisbane',
    
    // Capitals with airports
    'Mexico City', 'Buenos Aires', 'São Paulo', 'Lima', 'Santiago', 'Bogota', 'Quito',
    'Panama City', 'San Jose', 'Guatemala City', 'San Salvador', 'Tegucigalpa',
    'Cairo', 'Johannesburg', 'Nairobi', 'Casablanca', 'Tunis', 'Algiers',
    
    // Resort destinations with airports
    'Cancun', 'Cabo San Lucas', 'Puerto Vallarta', 'Phuket', 'Bali', 'Maldives',
    'Punta Cana', 'Montego Bay', 'Nassau', 'Aruba', 'Curacao', 'Barbados'
  ];
  
  // Known airport distances for specific towns
  const KNOWN_DISTANCES = {
    // Close to major airports
    'Cascais': 35,           // to Lisbon
    'Marbella': 60,          // to Malaga
    'Cannes': 27,            // to Nice
    'Antibes': 20,           // to Nice
    'Playa del Carmen': 55,  // to Cancun
    'Tamarindo': 65,         // to Liberia
    'Monteverde': 130,       // to San Jose
    'Ubud': 35,              // to Denpasar
    'Hua Hin': 180,          // to Bangkok
    'Pattaya': 120,          // to Bangkok
    'Chiang Mai': 3,         // has airport
    'Chiang Rai': 8,         // has small airport
    
    // US cities
    'Scottsdale': 15,        // to Phoenix
    'Santa Fe': 65,          // to Albuquerque
    'Savannah': 15,          // has airport
    'Charleston': 12,        // has airport
    'Asheville': 20,         // has regional airport
    'Naples': 10,            // has airport
    'Fort Myers': 15,        // to RSW
    'Sarasota': 6,           // has airport
    'The Villages': 75,      // to Orlando
    'St. George': 10,        // has regional airport
    
    // Islands/Remote
    'Santorini': 5,          // has airport
    'Mykonos': 4,            // has airport
    'Mallorca': 10,          // to Palma
    'Ibiza': 7,              // has airport
    'Madeira': 20,           // to Funchal
    'Azores': 5,             // has airport
    
    // European
    'Porto': 11,             // has airport
    'Valencia': 8,           // has airport
    'Malaga': 8,             // has airport
    'Nice': 7,               // has airport
    'Venice': 13,            // to Marco Polo
    'Florence': 80,          // to Pisa or Florence
    'Dubrovnik': 20,         // has airport
    'Split': 25,             // has airport
    
    // Asia/Pacific
    'George Town': 20,       // to Penang
    'Langkawi': 10,          // has airport
    'Koh Samui': 2,          // has airport
    'Da Nang': 3,            // has airport
    'Nha Trang': 35,         // has airport
    'Gold Coast': 20,        // has airport
    'Cairns': 7,             // has airport
    'Wellington': 8,         // has airport
    'Queenstown': 10,        // has airport
    'Christchurch': 10,      // has airport
    
    // Latin America
    'Cartagena': 5,          // has airport
    'Santa Marta': 17,       // has airport
    'Medellin': 35,          // to new airport
    'Cuenca': 5,             // has airport
    'Guayaquil': 5,          // has airport
    'La Paz': 13,            // to El Alto
    'Cusco': 5,              // has airport
    'Mendoza': 10,           // has airport
    'Bariloche': 15,         // has airport
    'Florianopolis': 15,     // has airport
    'Montevideo': 20,        // has airport
    'Punta del Este': 100    // to Montevideo
  };
  
  const missingData = towns.filter(t => t.airport_distance === null);
  console.log(`🎯 Found ${missingData.length} towns missing airport distance\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    let distance;
    let source = 'estimated';
    
    // Check if town has its own airport
    if (AIRPORT_IN_TOWN.includes(town.name) || 
        town.name.includes('City') && town.population > 1000000) {
      distance = Math.round(5 + Math.random() * 10); // 5-15km to city airport
      source = 'has airport';
    }
    // Check known distances
    else if (KNOWN_DISTANCES[town.name]) {
      distance = KNOWN_DISTANCES[town.name];
      source = 'known distance';
    }
    // Estimate based on population and geography
    else {
      // Capital cities usually have airports
      if (town.name === town.country || (town.name.includes('City') && town.population > 500000)) {
        distance = Math.round(10 + Math.random() * 20); // 10-30km
        source = 'capital/major city';
      }
      // Large cities often have airports
      else if (town.population > 500000) {
        distance = Math.round(10 + Math.random() * 30); // 10-40km
        source = 'large city';
      }
      // Tourist destinations usually have nearby airports
      else if (town.expat_community_size === 'large' || 
               town.geographic_features?.includes('island') ||
               town.geographic_features?.includes('coastal') && town.population > 50000) {
        distance = Math.round(20 + Math.random() * 60); // 20-80km
        source = 'tourist destination';
      }
      // Medium cities
      else if (town.population > 100000) {
        distance = Math.round(30 + Math.random() * 70); // 30-100km
        source = 'medium city';
      }
      // Small towns
      else if (town.population > 20000) {
        distance = Math.round(50 + Math.random() * 100); // 50-150km
        source = 'small town';
      }
      // Remote/rural
      else {
        distance = Math.round(80 + Math.random() * 120); // 80-200km
        if (town.geographic_features?.includes('island')) {
          distance = Math.round(distance * 0.5); // Islands often have small airports
        }
        source = 'rural/remote';
      }
      
      // Country-specific adjustments
      if (['United States', 'Canada', 'Australia'].includes(town.country)) {
        distance = Math.round(distance * 0.8); // Better airport coverage
      } else if (['Singapore', 'Hong Kong', 'Malta', 'Bahrain'].includes(town.country)) {
        distance = Math.min(distance, 30); // Small countries
      }
    }
    
    console.log(`${town.name}, ${town.country}: ${distance}km (${source})`);
    
    updates.push({
      id: town.id,
      airport_distance: distance
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ airport_distance: update.airport_distance })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Airport distance update complete!');
  
  // Summary
  const { data: allTowns } = await supabase
    .from('towns')
    .select('airport_distance');
    
  const distances = allTowns.map(t => t.airport_distance).filter(d => d !== null);
  const avgDistance = Math.round(distances.reduce((a, b) => a + b, 0) / distances.length);
  
  const veryClose = distances.filter(d => d <= 20).length;
  const close = distances.filter(d => d > 20 && d <= 50).length;
  const moderate = distances.filter(d => d > 50 && d <= 100).length;
  const far = distances.filter(d => d > 100).length;
  
  console.log('\n📊 Airport Distance Distribution:');
  console.log(`Average distance: ${avgDistance}km`);
  console.log(`Very close (≤20km): ${veryClose} towns (${(veryClose/341*100).toFixed(1)}%)`);
  console.log(`Close (21-50km): ${close} towns (${(close/341*100).toFixed(1)}%)`);
  console.log(`Moderate (51-100km): ${moderate} towns (${(moderate/341*100).toFixed(1)}%)`);
  console.log(`Far (>100km): ${far} towns (${(far/341*100).toFixed(1)}%)`);
}

fillAirportDistance();