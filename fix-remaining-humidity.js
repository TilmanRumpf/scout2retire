import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Remaining towns that need humidity levels
const REMAINING_HUMIDITY = {
  // Albania - Mediterranean coast
  'Sarandë': 'moderate',
  
  // Australia
  'Canberra': 'low',  // Inland, dry
  'Newcastle': 'high',  // Coastal NSW
  'Victor Harbor': 'moderate',  // South coast
  
  // Bahamas
  'George Town (Exuma)': 'very high',  // Caribbean humid
  
  // Belize - All very humid tropical
  'Corozal': 'very high',
  'Placencia': 'very high', 
  'San Ignacio': 'very high',
  'San Pedro (Ambergris Caye)': 'very high',
  
  // Botswana - Desert
  'Gaborone': 'low',
  
  // Brazil
  'Florianópolis': 'high',  // Coastal subtropical
  
  // Canada - Most are moderate continental
  'Calgary': 'low',  // Prairie dry
  'Charlottetown': 'moderate',
  'Halifax': 'moderate',
  'Kelowna': 'low',  // Interior BC dry
  'London (ON)': 'moderate',
  'Moncton': 'moderate',
  'Niagara-on-the-Lake': 'moderate',
  'Ottawa': 'moderate',
  'Victoria': 'moderate',
  
  // Chile - Mostly dry
  'La Serena': 'low',  // Desert coast
  'Valparaíso': 'moderate',
  'Viña del Mar': 'moderate',
  
  // Colombia
  'Medellin': 'moderate',  // Mountain city
  'Santa Marta': 'very high',  // Caribbean coast
  'Villa de Leyva': 'low',  // Highland dry
  
  // Cook Islands
  'Rarotonga (Avarua)': 'very high',  // Pacific tropical
  
  // Costa Rica - All humid tropical
  'Atenas': 'high',
  'Escazú': 'high',
  'Grecia': 'high',
  'Tamarindo': 'very high',
  
  // Croatia - Mediterranean
  'Dubrovnik': 'moderate',
  'Pula': 'moderate',
  'Rovinj': 'moderate',
  'Sibenik': 'moderate',
  'Split': 'moderate',
  'Trogir': 'moderate',
  'Zadar': 'moderate',
  
  // Cyprus
  'Limassol': 'moderate',
  
  // Czech Republic
  'Prague': 'moderate',
  
  // Dominican Republic - Caribbean humid
  'Las Terrenas': 'very high',
  'Puerto Plata': 'very high',
  'Punta Cana': 'very high',
  'Sosúa': 'very high',
  
  // Ecuador
  'Cuenca': 'low',  // Highland dry
  'Manta': 'high',  // Coast
  'Salinas': 'high',  // Coast
  'Vilcabamba': 'low',  // Mountain valley
  
  // Estonia
  'Tallinn': 'moderate',
  
  // Fiji - Pacific humid
  'Nadi': 'very high',
  'Savusavu': 'very high',
  
  // Grenada
  'Saint George': 'very high',
  
  // Guatemala
  'Antigua': 'moderate',  // Highland
  'Lake Atitlán (Panajachel)': 'moderate',  // Highland lake
  
  // Honduras
  'Roatán': 'very high',  // Caribbean island
  
  // Hungary
  'Budapest': 'moderate',
  
  // Israel
  'Haifa': 'moderate',
  
  // Latvia
  'Jurmala': 'moderate',
  'Riga': 'moderate',
  
  // Malta
  'Sliema': 'moderate',
  'Valletta': 'moderate',
  
  // Marshall Islands
  'Majuro': 'very high',  // Pacific atoll
  
  // Martinique
  'Fort-de-France': 'very high',  // Caribbean
  
  // Mauritius
  'Grand Baie': 'high',
  'Port Louis': 'high',
  
  // Mexico
  'Ensenada': 'low',  // Baja California dry
  'Huatulco': 'high',  // Pacific coast
  'Lake Chapala': 'moderate',  // Highland lake
  'Lake Chapala (Ajijic)': 'moderate',
  'Loreto': 'low',  // Baja dry
  'Los Cabos (Cabo San Lucas)': 'low',  // Desert coast
  'Mazatlán': 'high',  // Pacific humid
  'Merida': 'very high',  // Yucatan humid
  'Mérida': 'very high',  // Duplicate entry
  'Oaxaca City': 'moderate',  // Highland
  'Playa del Carmen': 'very high',  // Caribbean coast
  'Puebla': 'moderate',  // Highland
  'Puerto Vallarta': 'high',  // Pacific humid
  
  // Micronesia
  'Pohnpei (Kolonia)': 'very high',  // Pacific tropical
  
  // Montenegro
  'Budva': 'moderate',
  'Herceg Novi': 'moderate',
  'Kotor': 'moderate',
  
  // Namibia - Desert
  'Swakopmund': 'low',
  'Windhoek': 'low',
  
  // Nepal
  'Kathmandu': 'moderate',
  'Pokhara': 'moderate',
  
  // New Caledonia
  'Noumea': 'high',  // Pacific subtropical
  
  // New Zealand
  'Napier': 'moderate',
  'Nelson': 'moderate',
  'Queenstown': 'low',  // Mountain dry
  'Tauranga': 'moderate',
  'Wanaka': 'low',  // Mountain dry
  
  // Northern Cyprus
  'Kyrenia': 'moderate',
  'Paphos': 'moderate',
  
  // Palau
  'Koror': 'very high',  // Pacific tropical
  
  // Panama
  'Bocas Town (Bocas del Toro)': 'very high',  // Caribbean
  'Boquete': 'high',  // Mountain but humid
  'Coronado': 'high',
  'Pedasí': 'high',
  
  // Paraguay
  'Asunción': 'high',  // Subtropical humid
  
  // Puerto Rico
  'Rincón': 'very high',  // Caribbean
  
  // Rwanda
  'Kigali': 'moderate',  // Highland
  
  // Saint Martin
  'Marigot': 'very high',  // Caribbean
  
  // Saint Vincent
  'Kingstown': 'very high',  // Caribbean
  
  // Senegal
  'Dakar': 'high',  // Atlantic coast humid
  
  // Seychelles
  'Victoria (Mahé)': 'very high',  // Indian Ocean tropical
  
  // Sint Maarten
  'Philipsburg': 'very high',  // Caribbean
  
  // Slovenia
  'Ljubljana': 'moderate',
  
  // Solomon Islands
  'Honiara': 'very high',  // Pacific tropical
  
  // South Africa
  'Hermanus': 'moderate',
  'Knysna': 'moderate',
  'Plettenberg Bay': 'moderate',
  
  // Tonga
  'Neiafu': 'very high',  // Pacific tropical
  
  // Turkey
  'Antalya': 'moderate',
  'Bodrum': 'moderate',
  'Fethiye': 'moderate',
  
  // Turks and Caicos
  'Providenciales': 'very high',  // Caribbean
  
  // UK
  'Bath': 'moderate',
  'Truro (Cornwall)': 'moderate',
  
  // USA
  'Asheville': 'moderate',  // Mountain
  'Austin': 'high',  // Texas humid
  'Bend': 'low',  // High desert
  'Chapel Hill': 'high',  // North Carolina humid
  'Charlotte': 'high',  // NC humid
  'Chattanooga': 'high',  // Tennessee valley humid
  'Hilton Head Island': 'very high',  // South Carolina coast
  'Huntsville': 'high',  // Alabama humid
  'Lancaster': 'moderate',  // Pennsylvania
  'Myrtle Beach': 'very high',  // SC coast
  'Palm Beach': 'very high',  // Florida
  'Raleigh': 'high',  // NC humid
  'San Antonio': 'high',  // Texas humid
  'Santa Fe': 'low',  // High desert
  'St. George': 'low',  // Utah desert
  'The Villages': 'very high',  // Florida
  
  // Uruguay
  'Colonia del Sacramento': 'high',
  'Punta del Este': 'high',
  
  // US Virgin Islands
  'Christiansted': 'very high'  // Caribbean
};

async function fixRemainingHumidity() {
  console.log('💧 FIXING REMAINING HUMIDITY LEVELS\n');
  console.log('====================================\n');
  
  let updateCount = 0;
  let errorCount = 0;
  
  for (const [townName, humidityLevel] of Object.entries(REMAINING_HUMIDITY)) {
    // Find and update the town
    const { data: town } = await supabase
      .from('towns')
      .select('id, name')
      .eq('name', townName)
      .single();
    
    if (town) {
      const { error } = await supabase
        .from('towns')
        .update({ humidity_level_actual: humidityLevel })
        .eq('id', town.id);
      
      if (!error) {
        console.log(`✅ ${townName}: → "${humidityLevel}"`);
        updateCount++;
      } else {
        console.log(`❌ Failed: ${townName} - ${error.message}`);
        errorCount++;
      }
    } else {
      console.log(`⚠️ Not found: ${townName}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('REMAINING HUMIDITY UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Final check
  console.log('\n📊 FINAL CHECK:\n');
  
  const { data: nullHumidity } = await supabase
    .from('towns')
    .select('name, country')
    .is('humidity_level_actual', null);
  
  if (nullHumidity && nullHumidity.length > 0) {
    console.log(`Still missing humidity data: ${nullHumidity.length} towns`);
    nullHumidity.forEach(t => console.log(`  - ${t.name}, ${t.country}`));
  } else {
    console.log('✅ All towns now have humidity data!');
  }
  
  // Show final distribution
  console.log('\n📈 FINAL HUMIDITY DISTRIBUTION:\n');
  
  const { data: all } = await supabase
    .from('towns')
    .select('humidity_level_actual');
  
  const counts = {};
  all.forEach(t => {
    const level = t.humidity_level_actual || 'null';
    counts[level] = (counts[level] || 0) + 1;
  });
  
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([level, count]) => {
      const pct = ((count / all.length) * 100).toFixed(1);
      console.log(`${level}: ${count} towns (${pct}%)`);
    });
}

// Run fix
fixRemainingHumidity().catch(console.error);