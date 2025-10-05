import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateMissingData() {
  console.log('🔧 FILLING MISSING ELEVATION AND OCEAN DISTANCE DATA\n');
  console.log('=' + '='.repeat(60) + '\n');
  
  // Missing elevation and distance data
  const MISSING_DATA = {
    // American Samoa
    'Pago Pago': { elevation: 5, distance: 0 },
    
    // Argentina
    'Bariloche': { elevation: 893, distance: 600 },
    'Mendoza': { elevation: 746, distance: 300 },
    
    // Australia
    'Adelaide': { elevation: 50, distance: 0 },
    'Canberra': { elevation: 577, distance: 100 },
    'Coffs Harbour': { elevation: 5, distance: 0 },
    'Hervey Bay': { elevation: 10, distance: 0 },
    'Hobart': { elevation: 10, distance: 0 },
    'Newcastle': { elevation: 8, distance: 0 },
    'Port Macquarie': { elevation: 5, distance: 0 },
    'Sunshine Coast': { elevation: 10, distance: 0 },
    'Victor Harbor': { elevation: 10, distance: 0 },
    
    // Belgium
    'Bruges': { elevation: 2, distance: 15 },
    'Dinant': { elevation: 95, distance: 150 },
    'Ghent': { elevation: 5, distance: 50 },
    'Leuven': { elevation: 40, distance: 120 },
    'Tervuren': { elevation: 80, distance: 130 },
    
    // Belize
    'Corozal': { elevation: 1, distance: 0 },
    'San Ignacio': { elevation: 76, distance: 80 },
    
    // Brazil
    'Florianópolis': { elevation: 3, distance: 0 },
    
    // Cambodia
    'Kampot': { elevation: 5, distance: 5 },
    'Phnom Penh': { elevation: 12, distance: 50 },
    
    // Canada
    'Charlottetown': { elevation: 49, distance: 0 },
    'Halifax': { elevation: 74, distance: 0 },
    'Kelowna': { elevation: 344, distance: 400 },
    'Kingston': { elevation: 93, distance: 200 },
    'London (ON)': { elevation: 251, distance: 150 },
    'Moncton': { elevation: 71, distance: 20 },
    'Niagara-on-the-Lake': { elevation: 79, distance: 100 },
    
    // Chile
    'La Serena': { elevation: 29, distance: 0 },
    'Valparaíso': { elevation: 41, distance: 0 },
    
    // Colombia
    'Medellin': { elevation: 1495, distance: 400 },
    'Villa de Leyva': { elevation: 2144, distance: 500 },
    
    // Cook Islands
    'Rarotonga (Avarua)': { elevation: 4, distance: 0 },
    
    // Costa Rica
    'Escazú': { elevation: 1101, distance: 100 },
    'Grecia': { elevation: 999, distance: 90 },
    
    // Cyprus
    'Limassol': { elevation: 0, distance: 0 },
    'Paphos': { elevation: 10, distance: 0 },
    
    // Ecuador
    'Cuenca': { elevation: 2560, distance: 200 },
    'Manta': { elevation: 6, distance: 0 },
    
    // Egypt
    'El Gouna': { elevation: 0, distance: 0 },
    
    // Fiji
    'Savusavu': { elevation: 3, distance: 0 },
    'Suva': { elevation: 6, distance: 0 },
    
    // France
    'Aix-en-Provence': { elevation: 173, distance: 30 },
    'Annecy': { elevation: 447, distance: 500 },
    'Antibes': { elevation: 9, distance: 0 },
    'Avignon': { elevation: 23, distance: 80 },
    'Bordeaux': { elevation: 5, distance: 60 },
    'Cannes': { elevation: 0, distance: 0 },
    'Cassis': { elevation: 0, distance: 0 },
    'Cavalaire-sur-Mer': { elevation: 1, distance: 0 },
    'Le Lavandou': { elevation: 1, distance: 0 },
    'Menton': { elevation: 0, distance: 0 },
    'Montpellier': { elevation: 27, distance: 10 },
    'Pau': { elevation: 200, distance: 150 },
    'Perpignan': { elevation: 42, distance: 15 },
    'Sainte-Maxime': { elevation: 10, distance: 0 },
    'Saint-Tropez': { elevation: 15, distance: 0 },
    'Sarlat-la-Canéda': { elevation: 145, distance: 200 },
    
    // Germany
    'Eckernförde': { elevation: 3, distance: 0 },
    'Freiburg im Breisgau': { elevation: 278, distance: 400 },
    'Heidelberg': { elevation: 114, distance: 450 },
    'Lindau': { elevation: 401, distance: 600 },
    'Trier': { elevation: 137, distance: 350 },
    'Wiesbaden': { elevation: 115, distance: 400 },
    'Wismar': { elevation: 14, distance: 0 },
    
    // Greece
    'Chania': { elevation: 0, distance: 0 },
    'Corfu (Kerkyra)': { elevation: 2, distance: 0 },
    'Ioannina': { elevation: 480, distance: 80 },
    'Kalamata': { elevation: 21, distance: 0 },
    'Nafplio': { elevation: 0, distance: 0 },
    'Patras': { elevation: 0, distance: 0 },
    
    // Guatemala
    'Antigua': { elevation: 1530, distance: 120 },
    'Lake Atitlán (Panajachel)': { elevation: 1560, distance: 150 },
    
    // India
    'Pondicherry': { elevation: 3, distance: 0 },
    
    // Ireland
    'Cork': { elevation: 14, distance: 0 },
    'Dublin': { elevation: 20, distance: 0 },
    
    // Israel (Haifa already in main data)
    
    // Italy
    'Lecce': { elevation: 49, distance: 10 },
    'Lucca': { elevation: 19, distance: 20 },
    'Orvieto': { elevation: 325, distance: 100 },
    'Ostuni': { elevation: 218, distance: 8 },
    'Salerno': { elevation: 4, distance: 0 },
    'Spoleto': { elevation: 396, distance: 150 },
    'Taormina': { elevation: 204, distance: 0 },
    'Trieste': { elevation: 2, distance: 0 },
    
    // Laos
    'Luang Prabang': { elevation: 305, distance: 1000 },
    'Vientiane': { elevation: 174, distance: 900 },
    
    // Latvia
    'Jurmala': { elevation: 3, distance: 0 },
    
    // Malaysia
    'George Town': { elevation: 5, distance: 0 },
    'Johor Bahru': { elevation: 32, distance: 0 },
    'Langkawi': { elevation: 5, distance: 0 },
    'Malacca': { elevation: 8, distance: 0 },
    
    // Malta
    'Sliema': { elevation: 0, distance: 0 },
    
    // Marshall Islands
    'Majuro': { elevation: 3, distance: 0 },
    
    // Martinique
    'Fort-de-France': { elevation: 5, distance: 0 },
    
    // Mauritius
    'Grand Baie': { elevation: 0, distance: 0 },
    'Port Louis': { elevation: 5, distance: 0 },
    
    // Mexico
    'Ensenada': { elevation: 20, distance: 0 },
    'Huatulco': { elevation: 45, distance: 0 },
    'Lake Chapala': { elevation: 1524, distance: 350 },
    'Lake Chapala (Ajijic)': { elevation: 1524, distance: 350 },
    'Loreto': { elevation: 3, distance: 0 },
    'Los Cabos (Cabo San Lucas)': { elevation: 12, distance: 0 },
    'Mazatlán': { elevation: 3, distance: 0 },
    'Merida': { elevation: 9, distance: 35 },
    'Mérida': { elevation: 9, distance: 35 },
    'Oaxaca City': { elevation: 1555, distance: 250 },
    'Playa del Carmen': { elevation: 10, distance: 0 },
    'Puebla': { elevation: 2135, distance: 300 },
    'Puerto Vallarta': { elevation: 2, distance: 0 },
    'San Miguel de Allende': { elevation: 1910, distance: 500 },
    
    // Micronesia
    'Pohnpei (Kolonia)': { elevation: 2, distance: 0 },
    
    // Montenegro
    'Budva': { elevation: 3, distance: 0 },
    'Herceg Novi': { elevation: 5, distance: 0 },
    'Kotor': { elevation: 0, distance: 0 },
    
    // Morocco
    'Agadir': { elevation: 74, distance: 0 },
    'Essaouira': { elevation: 7, distance: 0 },
    'Marrakesh': { elevation: 466, distance: 250 },
    'Tangier': { elevation: 20, distance: 0 },
    
    // Namibia
    'Swakopmund': { elevation: 12, distance: 0 },
    'Windhoek': { elevation: 1650, distance: 350 },
    
    // Nepal
    'Pokhara': { elevation: 827, distance: 1500 },
    
    // Netherlands
    'Amersfoort': { elevation: 2, distance: 40 },
    'Bergen (NH)': { elevation: 1, distance: 5 },
    'Haarlem': { elevation: 2, distance: 7 },
    'Hoorn': { elevation: 0, distance: 30 },
    'Leiden': { elevation: 0, distance: 10 },
    'Lemmer': { elevation: 0, distance: 80 },
    'Maastricht': { elevation: 49, distance: 200 },
    'Zutphen': { elevation: 10, distance: 100 },
    
    // New Caledonia
    'Noumea': { elevation: 19, distance: 0 },
    
    // New Zealand
    'Napier': { elevation: 1, distance: 0 },
    'Nelson': { elevation: 2, distance: 0 },
    'Tauranga': { elevation: 0, distance: 0 },
    
    // Northern Cyprus
    'Kyrenia': { elevation: 0, distance: 0 },
    
    // Palau
    'Koror': { elevation: 2, distance: 0 },
    
    // Panama
    'Bocas Town (Bocas del Toro)': { elevation: 3, distance: 0 },
    'Boquete': { elevation: 1200, distance: 50 },
    'Coronado': { elevation: 2, distance: 0 },
    'Pedasí': { elevation: 1, distance: 0 },
    
    // Paraguay
    'Asunción': { elevation: 43, distance: 1000 },
    
    // Philippines
    'Baguio': { elevation: 1540, distance: 200 },
    'Cebu City': { elevation: 17, distance: 0 },
    'Dumaguete': { elevation: 5, distance: 0 },
    'Subic Bay (Olongapo)': { elevation: 13, distance: 0 },
    'Tagaytay': { elevation: 640, distance: 60 },
    
    // Portugal
    'Albufeira': { elevation: 40, distance: 0 },
    'Algarve (Lagos)': { elevation: 3, distance: 0 },
    'Braga': { elevation: 200, distance: 40 },
    'Carvoeiro': { elevation: 36, distance: 0 },
    'Cascais': { elevation: 5, distance: 0 },
    'Evora': { elevation: 300, distance: 100 },
    'Funchal (Madeira)': { elevation: 0, distance: 0 },
    'Nazaré': { elevation: 0, distance: 0 },
    'Olhão': { elevation: 0, distance: 0 },
    'Portimão': { elevation: 5, distance: 0 },
    'Tavira': { elevation: 5, distance: 0 },
    'Vila Real de Santo António': { elevation: 4, distance: 0 },
    'Viseu': { elevation: 443, distance: 80 },
    
    // Puerto Rico
    'Rincón': { elevation: 5, distance: 0 },
    
    // Rwanda
    'Kigali': { elevation: 1567, distance: 1200 },
    
    // Saint Kitts and Nevis
    'Basseterre': { elevation: 15, distance: 0 },
    
    // Saint Lucia
    'Castries': { elevation: 5, distance: 0 },
    
    // Saint Martin
    'Marigot': { elevation: 0, distance: 0 },
    
    // Saint Vincent and Grenadines
    'Kingstown': { elevation: 0, distance: 0 },
    
    // Samoa
    'Apia': { elevation: 2, distance: 0 },
    
    // Seychelles
    'Victoria (Mahé)': { elevation: 0, distance: 0 },
    
    // Sint Maarten
    'Philipsburg': { elevation: 0, distance: 0 },
    
    // Solomon Islands
    'Honiara': { elevation: 29, distance: 0 },
    
    // South Africa
    'Hermanus': { elevation: 4, distance: 0 },
    'Knysna': { elevation: 8, distance: 0 },
    'Plettenberg Bay': { elevation: 4, distance: 0 },
    
    // Spain
    'Alicante': { elevation: 3, distance: 0 },
    'Castro Urdiales': { elevation: 6, distance: 0 },
    'Comillas': { elevation: 23, distance: 0 },
    'Marbella': { elevation: 57, distance: 0 },
    'Palma de Mallorca': { elevation: 13, distance: 0 },
    'Puerto de la Cruz': { elevation: 9, distance: 0 },
    'Sanlúcar de Barrameda': { elevation: 30, distance: 0 },
    
    // Switzerland
    'Lugano': { elevation: 273, distance: 150 },
    
    // Taiwan
    'Kaohsiung': { elevation: 9, distance: 0 },
    
    // Thailand
    'Chiang Rai': { elevation: 416, distance: 750 },
    'Hua Hin': { elevation: 4, distance: 0 },
    'Koh Samui': { elevation: 5, distance: 0 },
    'Udon Thani': { elevation: 178, distance: 600 },
    
    // Tonga
    'Neiafu': { elevation: 5, distance: 0 },
    
    // Tunisia
    'Hammamet': { elevation: 4, distance: 0 },
    'Sousse': { elevation: 2, distance: 0 },
    
    // Turkey
    'Bodrum': { elevation: 0, distance: 0 },
    'Fethiye': { elevation: 3, distance: 0 },
    
    // Turks and Caicos
    'Providenciales': { elevation: 15, distance: 0 },
    
    // United Kingdom
    'Bath': { elevation: 59, distance: 100 },
    'Truro (Cornwall)': { elevation: 21, distance: 10 },
    
    // United States
    'Bend': { elevation: 1115, distance: 600 },
    'Boise': { elevation: 824, distance: 700 },
    'Chapel Hill': { elevation: 148, distance: 300 },
    'Chattanooga': { elevation: 205, distance: 500 },
    'Gainesville': { elevation: 54, distance: 100 },
    'Hilton Head Island': { elevation: 4, distance: 0 },
    'Huntsville': { elevation: 193, distance: 400 },
    'Lancaster': { elevation: 110, distance: 120 },
    'Las Vegas': { elevation: 610, distance: 430 },
    'Palm Beach': { elevation: 5, distance: 0 },
    'Palm Springs': { elevation: 145, distance: 150 },
    'Scottsdale': { elevation: 380, distance: 600 },
    'St. George': { elevation: 847, distance: 800 },
    'St. Petersburg': { elevation: 13, distance: 0 },
    'The Villages': { elevation: 20, distance: 70 },
    'Venice (FL)': { elevation: 2, distance: 0 },
    
    // Uruguay
    'Colonia del Sacramento': { elevation: 27, distance: 0 },
    'Punta del Este': { elevation: 13, distance: 0 },
    
    // U.S. Virgin Islands
    'Charlotte Amalie': { elevation: 0, distance: 0 },
    'Christiansted': { elevation: 0, distance: 0 },
    
    // Vanuatu
    'Port Vila': { elevation: 0, distance: 0 },
    
    // Vietnam
    'Da Nang': { elevation: 9, distance: 0 },
    'Hoi An': { elevation: 3, distance: 0 },
    'Nha Trang': { elevation: 10, distance: 0 },
    'Vung Tau': { elevation: 3, distance: 0 }
  };
  
  let updateCount = 0;
  let errorCount = 0;
  
  for (const [townName, data] of Object.entries(MISSING_DATA)) {
    const { error } = await supabase
      .from('towns')
      .update({
        elevation_meters: data.elevation,
        distance_to_ocean_km: data.distance
      })
      .eq('name', townName);
    
    if (error) {
      console.error(`❌ Failed to update ${townName}: ${error.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 20 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log(`\n✅ Successfully updated ${updateCount} towns`);
  if (errorCount > 0) {
    console.log(`❌ Failed to update ${errorCount} towns`);
  }
  
  // Verify completeness
  const { data: stillMissing } = await supabase
    .from('towns')
    .select('name, country')
    .or('elevation_meters.is.null,distance_to_ocean_km.is.null');
  
  console.log('\n' + '='.repeat(60));
  console.log('MISSING DATA POPULATION COMPLETE');
  console.log('='.repeat(60));
  
  if (stillMissing && stillMissing.length > 0) {
    console.log(`\n⚠️ Still missing data for ${stillMissing.length} towns:`);
    stillMissing.forEach(t => console.log(`  - ${t.name}, ${t.country}`));
  } else {
    console.log('\n🎉 ALL TOWNS NOW HAVE ELEVATION AND OCEAN DISTANCE DATA!');
  }
  
  // Show statistics
  const { data: stats } = await supabase
    .from('towns')
    .select('elevation_meters, distance_to_ocean_km');
  
  if (stats) {
    const elevations = stats.map(t => t.elevation_meters).filter(e => e !== null);
    const distances = stats.map(t => t.distance_to_ocean_km).filter(d => d !== null);
    
    const avgElevation = Math.round(elevations.reduce((a, b) => a + b, 0) / elevations.length);
    const maxElevation = Math.max(...elevations);
    const avgDistance = Math.round(distances.reduce((a, b) => a + b, 0) / distances.length);
    const maxDistance = Math.max(...distances);
    const coastalCount = distances.filter(d => d === 0).length;
    
    console.log('\n📊 FINAL STATISTICS:');
    console.log(`Average elevation: ${avgElevation}m`);
    console.log(`Highest town: ${maxElevation}m`);
    console.log(`Average ocean distance: ${avgDistance}km`);
    console.log(`Furthest from ocean: ${maxDistance}km`);
    console.log(`Coastal towns (0km): ${coastalCount}`);
  }
}

// Run population
populateMissingData().catch(console.error);