import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Seasonal variation based on actual climate patterns
// minimal = <10°C variation, moderate = 10-20°C, high = 20-30°C, extreme = >30°C
const SEASONAL_VARIATIONS = {
  // MINIMAL - Tropical/equatorial with stable temps year-round
  'minimal': [
    // Southeast Asia equatorial
    'Singapore', 'Kuala Lumpur', 'Penang', 'George Town',
    'Phuket', 'Koh Samui', 'Krabi',
    'Bali', 'Jakarta', 'Cebu City', 'Davao', 'Manila',
    
    // Caribbean - very stable temps
    'Bridgetown', 'Oranjestad', 'Willemstad', 'Basseterre',
    'Castries', 'Marigot', 'Philipsburg', 'Charlotte Amalie',
    'Christiansted', 'Saint John\'s', 'San Juan', 'Rincón',
    'Santo Domingo', 'Las Terrenas', 'Puerto Plata', 'Punta Cana', 'Sosúa',
    
    // Central America tropical
    'San José', 'Panama City', 'Bocas Town (Bocas del Toro)',
    'San Pedro', 'Corozal', 'Placencia', 'San Ignacio',
    
    // Pacific Islands
    'Honolulu', 'Pago Pago', 'Apia', 'Suva', 'Nadi', 'Savusavu',
    'Nuku\'alofa', 'Neiafu', 'Port Vila', 'Nouméa', 'Papeete',
    'Majuro', 'Koror', 'Pohnpei (Kolonia)', 'Honiara',
    'Rarotonga (Avarua)',
    
    // Tropical South America
    'Cartagena', 'Barranquilla', 'Santa Marta',
    'Guayaquil', 'Manta', 'Salinas',
    
    // Africa equatorial
    'Kampala', 'Kigali', 'Nairobi',
    'Victoria (Mahé)', 'Grand Baie', 'Port Louis',
    
    // South Asia coastal tropical
    'Colombo', 'Goa', 'Chennai', 'Kochi',
    'Male', 'Dhaka'
  ],
  
  // MODERATE - Subtropical/Mediterranean with noticeable but mild variation
  'moderate': [
    // Mediterranean climate
    'Barcelona', 'Valencia', 'Málaga', 'Alicante', 'Palma de Mallorca',
    'Nice', 'Cannes', 'Saint-Tropez', 'Marseille', 'Montpellier',
    'Rome', 'Naples', 'Venice', 'Florence', 'Pisa',
    'Athens', 'Santorini', 'Crete', 'Rhodes', 'Mykonos',
    'Lisbon', 'Porto', 'Faro', 'Lagos', 'Cascais',
    'Valletta', 'Sliema', 'Limassol', 'Paphos', 'Kyrenia',
    'Tel Aviv', 'Haifa', 'Beirut',
    'Casablanca', 'Rabat', 'Tangier', 'Essaouira',
    'Tunis', 'Sousse', 'Hammamet',
    'Antalya', 'Bodrum', 'Fethiye', 'Izmir',
    
    // California/West Coast USA
    'San Diego', 'Los Angeles', 'Santa Barbara', 'San Francisco',
    'Monterey', 'Carmel-by-the-Sea',
    
    // Australia Mediterranean
    'Perth', 'Adelaide', 'Melbourne', 'Sydney', 'Brisbane',
    
    // South America mild
    'Lima', 'Santiago', 'Valparaíso', 'Viña del Mar', 'La Serena',
    'Montevideo', 'Buenos Aires', 'Punta del Este',
    
    // Canary Islands
    'Las Palmas', 'Santa Cruz de Tenerife', 'Puerto de la Cruz',
    
    // New Zealand
    'Auckland', 'Wellington', 'Christchurch', 'Queenstown',
    'Napier', 'Nelson', 'Tauranga', 'Wanaka',
    
    // South Africa
    'Cape Town', 'Durban', 'Port Elizabeth', 'Hermanus',
    'Knysna', 'Plettenberg Bay',
    
    // Hawaii (some variation but mild)
    'Maui', 'Kauai', 'Big Island'
  ],
  
  // HIGH - Continental/desert with significant seasonal changes
  'high': [
    // USA Continental
    'New York', 'Boston', 'Philadelphia', 'Washington DC',
    'Chicago', 'Detroit', 'Minneapolis', 'Milwaukee',
    'Denver', 'Boulder', 'Salt Lake City', 'Boise',
    'Portland', 'Seattle', 'Spokane',
    'Atlanta', 'Charlotte', 'Raleigh', 'Chapel Hill',
    'Nashville', 'Memphis', 'Louisville', 'Cincinnati',
    'Dallas', 'Austin', 'San Antonio', 'Houston',
    'Kansas City', 'St. Louis', 'Indianapolis',
    
    // European Continental
    'Paris', 'Lyon', 'Bordeaux', 'Toulouse', 'Strasbourg',
    'Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne',
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht',
    'Brussels', 'Antwerp', 'Bruges', 'Ghent',
    'London', 'Edinburgh', 'Glasgow', 'Manchester', 'Birmingham',
    'Dublin', 'Cork', 'Galway',
    'Madrid', 'Seville', 'Granada', 'Bilbao', 'Zaragoza',
    'Milan', 'Turin', 'Bologna', 'Verona',
    'Vienna', 'Salzburg', 'Innsbruck', 'Graz',
    'Zurich', 'Geneva', 'Bern', 'Basel', 'Lugano',
    'Prague', 'Budapest', 'Warsaw', 'Krakow',
    'Ljubljana', 'Zagreb', 'Belgrade', 'Sarajevo',
    
    // Asia Continental
    'Beijing', 'Shanghai', 'Seoul', 'Tokyo', 'Osaka',
    'Taipei', 'Hong Kong',
    
    // Desert climates with hot summers, cool winters
    'Phoenix', 'Scottsdale', 'Tucson', 'Las Vegas',
    'Albuquerque', 'Santa Fe', 'El Paso',
    'Dubai', 'Abu Dhabi', 'Doha', 'Kuwait City', 'Riyadh',
    'Cairo', 'Amman', 'Jerusalem',
    'Marrakech', 'Fez',
    
    // High altitude with big variations
    'Mexico City', 'Guadalajara', 'Puebla', 'Oaxaca City',
    'Cuenca', 'Quito', 'La Paz', 'Cusco',
    'Mendoza', 'Bariloche',
    'Kathmandu', 'Pokhara'
  ],
  
  // EXTREME - Northern/extreme continental with huge seasonal swings
  'extreme': [
    // Canada
    'Toronto', 'Montreal', 'Ottawa', 'Quebec City',
    'Calgary', 'Edmonton', 'Winnipeg', 'Regina',
    'Halifax', 'Moncton', 'Charlottetown',
    
    // Northern USA
    'Minneapolis', 'Fargo', 'Duluth', 'Green Bay',
    'Buffalo', 'Rochester', 'Syracuse', 'Albany',
    'Burlington', 'Portland (ME)', 'Bangor',
    'Anchorage', 'Fairbanks',
    
    // Scandinavia
    'Stockholm', 'Gothenburg', 'Malmö',
    'Oslo', 'Bergen', 'Trondheim',
    'Copenhagen', 'Aarhus', 'Odense',
    'Helsinki', 'Turku', 'Tampere',
    'Reykjavik',
    
    // Baltic States
    'Tallinn', 'Riga', 'Jurmala', 'Vilnius',
    
    // Russia/Eastern Europe
    'Moscow', 'St. Petersburg', 'Kiev', 'Minsk'
  ]
};

// Get variation level for a town
function getSeasonalVariation(townName, country, climate) {
  // Check each category
  for (const [level, towns] of Object.entries(SEASONAL_VARIATIONS)) {
    if (towns.includes(townName)) {
      return level;
    }
  }
  
  // Fallback based on climate type
  if (!climate) return 'moderate'; // Default
  
  const climateLower = climate.toLowerCase();
  
  if (climateLower.includes('tropical') || climateLower.includes('equatorial')) {
    return 'minimal';
  } else if (climateLower.includes('mediterranean') || climateLower.includes('subtropical')) {
    return 'moderate';
  } else if (climateLower.includes('continental') || climateLower.includes('desert')) {
    return 'high';
  } else if (climateLower.includes('subarctic') || climateLower.includes('polar')) {
    return 'extreme';
  } else if (climateLower.includes('temperate')) {
    // Temperate can vary - check country
    if (['Canada', 'Norway', 'Sweden', 'Finland', 'Iceland'].includes(country)) {
      return 'extreme';
    } else if (['United Kingdom', 'Ireland', 'Netherlands', 'Belgium'].includes(country)) {
      return 'high';
    } else {
      return 'moderate';
    }
  }
  
  return 'moderate'; // Default
}

async function fixSeasonalVariation() {
  console.log('🌡️ FIXING SEASONAL_VARIATION_ACTUAL FOR ALL TOWNS\n');
  console.log('=================================================\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, climate, seasonal_variation_actual')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const town of towns) {
    // Skip if already has data
    if (town.seasonal_variation_actual) {
      skipCount++;
      continue;
    }
    
    // Determine seasonal variation
    const variation = getSeasonalVariation(town.name, town.country, town.climate);
    
    // Update the town
    const { error: updateError } = await supabase
      .from('towns')
      .update({ seasonal_variation_actual: variation })
      .eq('id', town.id);
      
    if (updateError) {
      console.error(`Failed to update ${town.name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('SEASONAL VARIATION UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`⏭️ Skipped (already had data): ${skipCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show final distribution
  console.log('\n📊 FINAL SEASONAL VARIATION DISTRIBUTION:\n');
  
  const { data: all } = await supabase
    .from('towns')
    .select('seasonal_variation_actual');
  
  const counts = {};
  all.forEach(t => {
    const level = t.seasonal_variation_actual || 'null';
    counts[level] = (counts[level] || 0) + 1;
  });
  
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([level, count]) => {
      const pct = ((count / all.length) * 100).toFixed(1);
      console.log(`${level}: ${count} towns (${pct}%)`);
    });
  
  // Show samples
  console.log('\n📋 SAMPLE DATA:\n');
  
  const samples = [
    'Singapore', 'Dubai', 'Stockholm', 'Miami', 'Sydney', 
    'London', 'Bangkok', 'Phoenix', 'Montreal'
  ];
  
  for (const name of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, seasonal_variation_actual, climate')
      .eq('name', name)
      .single();
    
    if (town) {
      console.log(`${town.name}, ${town.country}: ${town.seasonal_variation_actual} (${town.climate})`);
    }
  }
}

// Run fix
fixSeasonalVariation().catch(console.error);