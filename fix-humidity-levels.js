import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Humidity levels based on how residents experience it year-round
// If humid for 7+ months = high, regardless of nice winters
const HUMIDITY_LEVELS = {
  // VERY HIGH - Oppressive humidity most of the year
  'very high': [
    // Southeast Asia - humid year-round
    'Bangkok', 'Phuket', 'Koh Samui', 'Chiang Mai', 'Hua Hin',
    'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hoi An',
    'Kuala Lumpur', 'Penang', 'George Town',
    'Singapore',
    'Manila', 'Cebu City', 'Davao',
    'Phnom Penh', 'Siem Reap',
    'Vientiane',
    'Yangon',
    
    // Caribbean - humid most of the year
    'Saint John\'s', 'San Juan', 'Bridgetown', 'Kingston', 'Santo Domingo',
    'Havana', 'Nassau', 'Port of Spain', 'Castries', 'Willemstad',
    'Oranjestad', 'Basseterre', 'Charlotte Amalie', 'Cockburn Town',
    'George Town', 'Road Town', 'San Pedro',
    
    // Gulf States - extreme humidity most months
    'Dubai', 'Abu Dhabi', 'Doha', 'Kuwait City', 'Manama', 'Muscat',
    
    // Florida - humid 8+ months
    'Miami', 'Fort Lauderdale', 'West Palm Beach', 'Fort Myers', 'Naples',
    'Tampa', 'St. Petersburg', 'Clearwater', 'Sarasota', 'Orlando',
    'Jacksonville', 'Gainesville', 'New Port Richey', 'Venice (FL)',
    
    // Other US humid areas
    'Houston', 'Galveston', 'New Orleans',
    
    // Pacific Islands
    'Pago Pago', 'Honolulu', 'Apia', 'Suva', 'Nuku\'alofa', 'Port Vila',
    'Nouméa', 'Papeete',
    
    // South Asia monsoon regions
    'Mumbai', 'Goa', 'Chennai', 'Kolkata', 'Dhaka', 'Colombo',
    
    // Central/South America tropics
    'Cartagena', 'Barranquilla', 'Panama City', 'San José',
    'Guayaquil', 'Belém', 'Manaus', 'Salvador', 'Recife', 'Fortaleza'
  ],
  
  // HIGH - Humid most of the year but not oppressive
  'high': [
    'Sydney', 'Brisbane', 'Gold Coast', 'Sunshine Coast', 'Cairns',
    'Darwin', 'Hervey Bay', 'Coffs Harbour', 'Port Macquarie',
    'Charleston', 'Savannah', 'Virginia Beach',
    'Nice', 'Cannes', 'Saint-Tropez',
    'Barcelona', 'Valencia', 'Málaga',
    'Rome', 'Venice', 'Naples',
    'Athens', 'Thessaloniki',
    'Tel Aviv', 'Beirut',
    'Casablanca', 'Tunis',
    'Rio de Janeiro', 'São Paulo', 'Montevideo', 'Buenos Aires',
    'Tokyo', 'Osaka', 'Kyoto',
    'Shanghai', 'Hong Kong', 'Taipei', 'Kaohsiung',
    'Seoul', 'Busan'
  ],
  
  // MODERATE - Balanced humidity, comfortable most of the year
  'moderate': [
    'Lisbon', 'Porto', 'Cascais', 'Faro', 'Lagos', 'Albufeira',
    'Madrid', 'Seville', 'Granada', 'Bilbao', 'San Sebastián',
    'Paris', 'Bordeaux', 'Toulouse', 'Marseille', 'Lyon',
    'London', 'Edinburgh', 'Dublin', 'Cork',
    'Amsterdam', 'Brussels', 'Copenhagen', 'Stockholm', 'Oslo',
    'Berlin', 'Munich', 'Hamburg', 'Frankfurt',
    'Vienna', 'Zurich', 'Geneva',
    'Milan', 'Florence', 'Bologna',
    'Vancouver', 'Toronto', 'Montreal',
    'San Francisco', 'Seattle', 'Portland',
    'Melbourne', 'Adelaide', 'Perth', 'Hobart',
    'Wellington', 'Auckland', 'Christchurch',
    'Cape Town', 'Durban', 'Port Elizabeth'
  ],
  
  // LOW - Dry most of the year
  'low': [
    'Phoenix', 'Scottsdale', 'Tucson', 'Las Vegas', 'Albuquerque',
    'Denver', 'Boulder', 'Salt Lake City', 'Boise',
    'San Diego', 'Los Angeles', 'Palm Springs',
    'Santiago', 'Lima', 'La Paz', 'Quito',
    'Mexico City', 'Guadalajara', 'San Miguel de Allende',
    'Cairo', 'Amman', 'Jerusalem',
    'Marrakech', 'Fez',
    'Alice Springs', 'Bendigo',
    'Mendoza', 'Bariloche', 'Cusco',
    'Nairobi', 'Addis Ababa'
  ]
};

async function fixHumidityLevels() {
  console.log('💧 FIXING HUMIDITY_LEVEL_ACTUAL FOR ALL TOWNS\n');
  console.log('=============================================\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let notFoundCount = 0;
  const notFound = [];
  
  for (const town of towns) {
    let humidityLevel = null;
    
    // Find the humidity level for this town
    for (const [level, townsList] of Object.entries(HUMIDITY_LEVELS)) {
      if (townsList.includes(town.name)) {
        humidityLevel = level;
        break;
      }
    }
    
    if (!humidityLevel) {
      // Try with country context for common names
      const townWithCountry = `${town.name}, ${town.country}`;
      
      // Default by country/region patterns
      if (town.country === 'Thailand' || town.country === 'Vietnam' || 
          town.country === 'Malaysia' || town.country === 'Philippines' ||
          town.country === 'Cambodia' || town.country === 'Laos' ||
          town.country === 'Indonesia' || town.country === 'Myanmar') {
        humidityLevel = 'very high';
      } else if (town.country === 'United Arab Emirates' || town.country === 'Qatar' ||
                 town.country === 'Kuwait' || town.country === 'Bahrain' ||
                 town.country === 'Saudi Arabia' || town.country === 'Oman') {
        humidityLevel = 'very high';
      } else if (town.country === 'India' || town.country === 'Bangladesh' ||
                 town.country === 'Sri Lanka') {
        humidityLevel = 'high';
      } else if (town.country === 'Egypt' || town.country === 'Jordan' ||
                 town.country === 'Morocco' || town.country === 'Tunisia') {
        humidityLevel = 'low';
      } else if (town.country === 'Norway' || town.country === 'Sweden' ||
                 town.country === 'Finland' || town.country === 'Denmark' ||
                 town.country === 'Iceland') {
        humidityLevel = 'moderate';
      } else if (town.country === 'Spain' || town.country === 'Portugal' ||
                 town.country === 'Italy' || town.country === 'Greece') {
        humidityLevel = 'moderate';
      } else if (town.country === 'France' || town.country === 'Germany' ||
                 town.country === 'Netherlands' || town.country === 'Belgium' ||
                 town.country === 'Switzerland' || town.country === 'Austria') {
        humidityLevel = 'moderate';
      } else {
        notFound.push(`${town.name}, ${town.country}`);
        notFoundCount++;
        continue;
      }
    }
    
    // Update the town
    const { error: updateError } = await supabase
      .from('towns')
      .update({ humidity_level_actual: humidityLevel })
      .eq('id', town.id);
      
    if (updateError) {
      console.error(`Failed to update ${town.name}: ${updateError.message}`);
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('HUMIDITY LEVEL UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`⚠️ Not categorized: ${notFoundCount} towns\n`);
  
  if (notFound.length > 0) {
    console.log('Towns needing manual review:');
    notFound.forEach(t => console.log(`  - ${t}`));
  }
  
  // Show summary
  console.log('\n📊 FINAL SUMMARY BY LEVEL:\n');
  
  const { data: summary } = await supabase
    .from('towns')
    .select('humidity_level_actual');
    
  const counts = {};
  summary.forEach(t => {
    const level = t.humidity_level_actual || 'null';
    counts[level] = (counts[level] || 0) + 1;
  });
  
  Object.entries(counts).sort().forEach(([level, count]) => {
    console.log(`${level}: ${count} towns`);
  });
}

// Run fix
fixHumidityLevels().catch(console.error);