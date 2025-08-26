import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Comprehensive water bodies database
const WATER_BODIES_DATABASE = {
  // United States
  'Charleston': ['Atlantic Ocean', 'Ashley River', 'Cooper River', 'Charleston Harbor'],
  'Palm Beach': ['Atlantic Ocean', 'Lake Worth Lagoon', 'Intracoastal Waterway'],
  'Sarasota': ['Gulf of Mexico', 'Sarasota Bay', 'Little Sarasota Bay'],
  'Naples': ['Gulf of Mexico', 'Naples Bay', 'Gordon River'],
  'Fort Myers': ['Gulf of Mexico', 'Caloosahatchee River', 'San Carlos Bay'],
  'St. Petersburg': ['Gulf of Mexico', 'Tampa Bay', 'Boca Ciega Bay'],
  'Clearwater': ['Gulf of Mexico', 'Clearwater Harbor', 'Old Tampa Bay'],
  'Venice (FL)': ['Gulf of Mexico', 'Roberts Bay', 'Venice Inlet'],
  'Jacksonville': ['Atlantic Ocean', 'St. Johns River', 'Intracoastal Waterway'],
  'Savannah': ['Atlantic Ocean', 'Savannah River', 'Wilmington River'],
  'Virginia Beach': ['Atlantic Ocean', 'Chesapeake Bay', 'Lynnhaven Bay'],
  'San Diego': ['Pacific Ocean', 'San Diego Bay', 'Mission Bay'],
  'Myrtle Beach': ['Atlantic Ocean', 'Intracoastal Waterway'],
  'Galveston': ['Gulf of Mexico', 'Galveston Bay', 'West Bay'],
  'Hilton Head Island': ['Atlantic Ocean', 'Calibogue Sound', 'Port Royal Sound'],
  'Denver': ['South Platte River', 'Cherry Creek Reservoir'],
  'Boulder': ['Boulder Creek', 'Boulder Reservoir'],
  'Austin': ['Colorado River', 'Lake Travis', 'Lake Austin'],
  'San Antonio': ['San Antonio River', 'Medina River'],
  'Portland': ['Willamette River', 'Columbia River'],
  'Las Vegas': ['Lake Mead', 'Colorado River'],
  'Phoenix': ['Salt River', 'Gila River'],
  'Tucson': ['Santa Cruz River', 'Rillito River'],
  
  // Mexico
  'Los Cabos (Cabo San Lucas)': ['Pacific Ocean', 'Sea of Cortez', 'Cabo San Lucas Bay'],
  'Playa del Carmen': ['Caribbean Sea', 'Cozumel Channel'],
  'Puerto Vallarta': ['Pacific Ocean', 'Banderas Bay'],
  'Cancun': ['Caribbean Sea', 'Nichupté Lagoon'],
  'Mazatlán': ['Pacific Ocean', 'Stone Island'],
  'Loreto': ['Sea of Cortez', 'Loreto Bay'],
  'Lake Chapala': ['Lake Chapala'],
  'San Miguel de Allende': ['Laja River', 'Allende Reservoir'],
  
  // Portugal
  'Lisbon': ['Atlantic Ocean', 'Tagus River', 'Mar da Palha'],
  'Porto': ['Atlantic Ocean', 'Douro River'],
  'Cascais': ['Atlantic Ocean', 'Cascais Bay'],
  'Albufeira': ['Atlantic Ocean'],
  'Portimão': ['Atlantic Ocean', 'Arade River'],
  'Tavira': ['Atlantic Ocean', 'Gilão River', 'Ria Formosa'],
  'Olhão': ['Atlantic Ocean', 'Ria Formosa'],
  'Funchal (Madeira)': ['Atlantic Ocean'],
  'Vila Real de Santo António': ['Atlantic Ocean', 'Guadiana River'],
  'Carvoeiro': ['Atlantic Ocean'],
  'Algarve (Lagos)': ['Atlantic Ocean', 'Lagos Bay'],
  
  // Spain  
  'Barcelona': ['Mediterranean Sea', 'Besòs River', 'Llobregat River'],
  'Valencia': ['Mediterranean Sea', 'Turia River', 'Albufera Lake'],
  'Málaga': ['Mediterranean Sea', 'Guadalmedina River'],
  'Alicante': ['Mediterranean Sea', 'Postiguet Beach'],
  'Palma de Mallorca': ['Mediterranean Sea', 'Bay of Palma'],
  'San Sebastián': ['Bay of Biscay', 'La Concha Bay', 'Urumea River'],
  'Santander': ['Bay of Biscay', 'Bay of Santander'],
  'Bilbao': ['Bay of Biscay', 'Nervión River'],
  'Seville': ['Guadalquivir River'],
  'Granada': ['Genil River', 'Darro River'],
  'Comillas': ['Bay of Biscay', 'Cantabrian Sea'],
  'Castro Urdiales': ['Bay of Biscay', 'Cantabrian Sea'],
  'Sanlúcar de Barrameda': ['Atlantic Ocean', 'Guadalquivir River'],
  
  // France
  'Paris': ['Seine River', 'Marne River'],
  'Nice': ['Mediterranean Sea', 'Baie des Anges', 'Var River'],
  'Bordeaux': ['Garonne River', 'Gironde Estuary'],
  'Lyon': ['Rhône River', 'Saône River'],
  'Marseille': ['Mediterranean Sea', 'Gulf of Lion'],
  'Montpellier': ['Mediterranean Sea', 'Lez River'],
  'Toulouse': ['Garonne River', 'Canal du Midi'],
  'Strasbourg': ['Rhine River', 'Ill River'],
  'Menton': ['Mediterranean Sea', 'Carei Bay'],
  'Saint-Tropez': ['Mediterranean Sea', 'Gulf of Saint-Tropez'],
  'Cavalaire-sur-Mer': ['Mediterranean Sea', 'Cavalaire Bay'],
  'Le Lavandou': ['Mediterranean Sea'],
  'Sainte-Maxime': ['Mediterranean Sea', 'Gulf of Saint-Tropez'],
  
  // Italy
  'Rome': ['Tiber River', 'Tyrrhenian Sea'],
  'Venice': ['Adriatic Sea', 'Venetian Lagoon', 'Grand Canal'],
  'Florence': ['Arno River'],
  'Naples': ['Bay of Naples', 'Tyrrhenian Sea'],
  'Milan': ['Naviglio Grande', 'Naviglio Pavese'],
  'Genoa': ['Ligurian Sea', 'Gulf of Genoa'],
  'Bologna': ['Reno River', 'Savena River'],
  'Salerno': ['Tyrrhenian Sea', 'Gulf of Salerno'],
  'Taormina': ['Ionian Sea', 'Alcantara River'],
  'Lecce': ['Adriatic Sea', 'Ionian Sea'],
  'Ostuni': ['Adriatic Sea'],
  'Trieste': ['Adriatic Sea', 'Gulf of Trieste'],
  'Lindau': ['Lake Constance', 'Leiblach River'],
  
  // Greece
  'Athens': ['Saronic Gulf', 'Aegean Sea'],
  'Thessaloniki': ['Thermaic Gulf', 'Aegean Sea'],
  'Corfu (Kerkyra)': ['Ionian Sea', 'Corfu Channel'],
  'Rhodes': ['Aegean Sea', 'Mediterranean Sea'],
  'Crete (Heraklion)': ['Sea of Crete', 'Mediterranean Sea'],
  'Patras': ['Gulf of Patras', 'Ionian Sea'],
  'Rethymno': ['Sea of Crete', 'Mediterranean Sea'],
  'Ioannina': ['Lake Pamvotis'],
  
  // Croatia
  'Split': ['Adriatic Sea', 'Jadro River'],
  'Dubrovnik': ['Adriatic Sea'],
  'Zagreb': ['Sava River'],
  'Rovinj': ['Adriatic Sea'],
  'Trogir': ['Adriatic Sea', 'Čiovo Channel'],
  'Pula': ['Adriatic Sea', 'Pula Bay'],
  'Zadar': ['Adriatic Sea', 'Zadar Channel'],
  'Sibenik': ['Adriatic Sea', 'Krka River'],
  
  // Australia
  'Sydney': ['Pacific Ocean', 'Sydney Harbour', 'Botany Bay', 'Parramatta River'],
  'Melbourne': ['Port Phillip Bay', 'Yarra River', 'Bass Strait'],
  'Brisbane': ['Brisbane River', 'Moreton Bay'],
  'Perth': ['Indian Ocean', 'Swan River'],
  'Adelaide': ['Gulf St Vincent', 'Torrens River'],
  'Gold Coast': ['Pacific Ocean', 'Nerang River', 'Broadwater'],
  'Newcastle': ['Pacific Ocean', 'Hunter River', 'Lake Macquarie'],
  'Sunshine Coast': ['Pacific Ocean', 'Maroochy River', 'Mooloolah River'],
  'Hervey Bay': ['Pacific Ocean', 'Great Sandy Strait'],
  'Cairns': ['Coral Sea', 'Trinity Inlet', 'Barron River'],
  'Darwin': ['Timor Sea', 'Darwin Harbour'],
  'Hobart': ['Derwent River', 'Storm Bay', 'Tasman Sea'],
  'Canberra': ['Lake Burley Griffin', 'Molonglo River'],
  'Port Macquarie': ['Pacific Ocean', 'Hastings River'],
  'Victor Harbor': ['Southern Ocean', 'Encounter Bay'],
  'Coffs Harbour': ['Pacific Ocean', 'Coffs Creek'],
  
  // New Zealand
  'Auckland': ['Pacific Ocean', 'Hauraki Gulf', 'Waitemata Harbour', 'Manukau Harbour'],
  'Wellington': ['Cook Strait', 'Wellington Harbour', 'Hutt River'],
  'Christchurch': ['Pacific Ocean', 'Avon River', 'Heathcote River'],
  'Queenstown': ['Lake Wakatipu', 'Shotover River', 'Kawarau River'],
  'Napier': ['Hawke\'s Bay', 'Pacific Ocean'],
  'Tauranga': ['Bay of Plenty', 'Pacific Ocean', 'Tauranga Harbour'],
  'Nelson': ['Tasman Bay', 'Maitai River'],
  'Wanaka': ['Lake Wanaka', 'Clutha River'],
  
  // Thailand
  'Bangkok': ['Chao Phraya River'],
  'Phuket': ['Andaman Sea', 'Phang Nga Bay'],
  'Chiang Mai': ['Ping River'],
  'Pattaya': ['Gulf of Thailand'],
  'Koh Samui': ['Gulf of Thailand'],
  'Hua Hin': ['Gulf of Thailand'],
  'Chiang Rai': ['Kok River', 'Mekong River'],
  'Udon Thani': ['Pao River'],
  
  // Vietnam
  'Ho Chi Minh City': ['Saigon River', 'Dong Nai River'],
  'Hanoi': ['Red River', 'West Lake'],
  'Da Nang': ['South China Sea', 'Han River'],
  'Hoi An': ['South China Sea', 'Thu Bon River'],
  'Nha Trang': ['South China Sea', 'Nha Trang Bay'],
  'Vung Tau': ['South China Sea'],
  
  // Malaysia
  'Kuala Lumpur': ['Klang River', 'Gombak River'],
  'George Town': ['Strait of Malacca', 'Penang Strait'],
  'Malacca': ['Strait of Malacca', 'Malacca River'],
  'Johor Bahru': ['Strait of Johor'],
  'Langkawi': ['Andaman Sea', 'Strait of Malacca'],
  
  // Singapore
  'Singapore': ['Singapore Strait', 'Johor Strait', 'Marina Bay'],
  
  // Philippines
  'Manila': ['Manila Bay', 'Pasig River'],
  'Cebu City': ['Mactan Channel', 'Visayan Sea'],
  'Davao': ['Davao Gulf', 'Davao River'],
  'Boracay': ['Sibuyan Sea', 'Sulu Sea'],
  'Palawan': ['South China Sea', 'Sulu Sea'],
  'Dumaguete': ['Bohol Sea', 'Tañon Strait'],
  'Subic Bay (Olongapo)': ['South China Sea', 'Subic Bay'],
  'Tagaytay': ['Taal Lake'],
  'Baguio': ['Agno River', 'Bued River'],
  
  // India
  'Goa': ['Arabian Sea', 'Mandovi River', 'Zuari River'],
  'Pondicherry': ['Bay of Bengal', 'Gingee River'],
  'Kochi': ['Arabian Sea', 'Vembanad Lake', 'Periyar River'],
  'Chennai': ['Bay of Bengal', 'Cooum River', 'Adyar River'],
  'Mumbai': ['Arabian Sea', 'Mahim Bay', 'Thane Creek'],
  'Bangalore': ['Vrishabhavathi River', 'Arkavathy River'],
  
  // Caribbean & Central America
  'San Juan': ['Atlantic Ocean', 'San Juan Bay', 'Condado Lagoon'],
  'Nassau': ['Atlantic Ocean', 'Nassau Harbour'],
  'Bridgetown': ['Atlantic Ocean', 'Carlisle Bay'],
  'Saint John\'s': ['Caribbean Sea', 'Atlantic Ocean'],
  'Castries': ['Caribbean Sea', 'Castries Harbour'],
  'Saint George': ['Caribbean Sea', 'St. George\'s Bay'],
  'Oranjestad': ['Caribbean Sea'],
  'Willemstad': ['Caribbean Sea', 'St. Anna Bay'],
  'Road Town': ['Caribbean Sea', 'Road Harbour'],
  'George Town (Exuma)': ['Atlantic Ocean', 'Elizabeth Harbour'],
  'San Pedro (Ambergris Caye)': ['Caribbean Sea', 'Hol Chan Marine Reserve'],
  'Placencia': ['Caribbean Sea', 'Placencia Lagoon'],
  'Roatán': ['Caribbean Sea'],
  'Tamarindo': ['Pacific Ocean', 'Tamarindo Bay'],
  
  // South America
  'Buenos Aires': ['Río de la Plata', 'Riachuelo River'],
  'Montevideo': ['Río de la Plata', 'Montevideo Bay'],
  'Santiago': ['Mapocho River', 'Maipo River'],
  'Lima': ['Pacific Ocean', 'Rímac River'],
  'Quito': ['Machángara River', 'Guayllabamba River'],
  'Bogotá': ['Bogotá River'],
  'Medellín': ['Medellín River', 'Porce River'],
  'Cartagena': ['Caribbean Sea', 'Cartagena Bay'],
  'Santa Marta': ['Caribbean Sea', 'Manzanares River'],
  'Viña del Mar': ['Pacific Ocean'],
  'Valparaíso': ['Pacific Ocean', 'Valparaíso Bay'],
  'Mendoza': ['Mendoza River'],
  'Bariloche': ['Nahuel Huapi Lake', 'Limay River'],
  'Cusco': ['Huatanay River', 'Vilcanota River'],
  'Arequipa': ['Chili River'],
  'Cuenca': ['Tomebamba River', 'Tarqui River', 'Yanuncay River', 'Machángara River'],
  'Salinas': ['Pacific Ocean', 'Santa Elena Peninsula'],
  
  // Canada
  'Vancouver': ['Pacific Ocean', 'Burrard Inlet', 'Fraser River', 'English Bay'],
  'Toronto': ['Lake Ontario', 'Humber River', 'Don River'],
  'Montreal': ['St. Lawrence River', 'Rivière des Prairies'],
  'Calgary': ['Bow River', 'Elbow River'],
  'Ottawa': ['Ottawa River', 'Rideau River', 'Rideau Canal'],
  'Victoria': ['Pacific Ocean', 'Juan de Fuca Strait', 'Victoria Harbour'],
  'Halifax': ['Atlantic Ocean', 'Halifax Harbour', 'Northwest Arm'],
  'Charlottetown': ['Northumberland Strait', 'Hillsborough River'],
  
  // Other Europe
  'Amsterdam': ['IJ River', 'Amstel River', 'North Sea Canal'],
  'Brussels': ['Senne River', 'Brussels-Charleroi Canal'],
  'Vienna': ['Danube River', 'Danube Canal'],
  'Prague': ['Vltava River'],
  'Budapest': ['Danube River'],
  'Berlin': ['Spree River', 'Havel River'],
  'Munich': ['Isar River'],
  'Zurich': ['Lake Zurich', 'Limmat River', 'Sihl River'],
  'Geneva': ['Lake Geneva', 'Rhône River', 'Arve River'],
  'Stockholm': ['Baltic Sea', 'Lake Mälaren'],
  'Copenhagen': ['Øresund Strait', 'Baltic Sea'],
  'Oslo': ['Oslofjord', 'Akerselva River'],
  'Reykjavik': ['Atlantic Ocean', 'Faxaflói Bay'],
  'Dublin': ['Irish Sea', 'Dublin Bay', 'River Liffey'],
  'Edinburgh': ['Firth of Forth', 'North Sea', 'Water of Leith'],
  'Lisbon': ['Atlantic Ocean', 'Tagus River'],
  'Ljubljana': ['Ljubljanica River', 'Sava River'],
  'Tallinn': ['Baltic Sea', 'Gulf of Finland', 'Tallinn Bay'],
  'Riga': ['Baltic Sea', 'Gulf of Riga', 'Daugava River'],
  
  // Africa
  'Cape Town': ['Atlantic Ocean', 'Table Bay', 'False Bay'],
  'Durban': ['Indian Ocean', 'Durban Bay', 'Umgeni River'],
  'Port Elizabeth': ['Indian Ocean', 'Algoa Bay'],
  'Knysna': ['Indian Ocean', 'Knysna Lagoon'],
  'Hermanus': ['Walker Bay', 'Atlantic Ocean'],
  'Plettenberg Bay': ['Indian Ocean', 'Keurbooms River'],
  'Marrakech': ['Tensift River'],
  'Casablanca': ['Atlantic Ocean'],
  'Tangier': ['Strait of Gibraltar', 'Atlantic Ocean', 'Mediterranean Sea'],
  'Cairo': ['Nile River'],
  'Alexandria': ['Mediterranean Sea', 'Lake Mariout'],
  'Sharm El Sheikh': ['Red Sea', 'Gulf of Aqaba'],
  'Hurghada': ['Red Sea'],
  'El Gouna': ['Red Sea'],
  'Dakar': ['Atlantic Ocean', 'Cap-Vert Peninsula'],
  'Victoria (Mahé)': ['Indian Ocean', 'Victoria Harbour'],
  'Port Louis': ['Indian Ocean', 'Port Louis Harbour'],
  'Grand Baie': ['Indian Ocean'],
  
  // Middle East
  'Dubai': ['Persian Gulf', 'Dubai Creek'],
  'Abu Dhabi': ['Persian Gulf'],
  'Tel Aviv': ['Mediterranean Sea', 'Yarkon River'],
  'Jerusalem': [],
  'Amman': ['Zarqa River'],
  'Beirut': ['Mediterranean Sea'],
  'Istanbul': ['Bosphorus Strait', 'Golden Horn', 'Sea of Marmara', 'Black Sea'],
  
  // Asia Other
  'Tokyo': ['Tokyo Bay', 'Sumida River', 'Arakawa River'],
  'Kyoto': ['Kamo River', 'Katsura River'],
  'Osaka': ['Osaka Bay', 'Yodo River'],
  'Seoul': ['Han River'],
  'Busan': ['Korea Strait', 'Nakdong River'],
  'Taipei': ['Tamsui River', 'Keelung River'],
  'Kaohsiung': ['Taiwan Strait', 'Love River'],
  'Hong Kong': ['South China Sea', 'Victoria Harbour', 'Pearl River Delta'],
  'Macau': ['Pearl River Delta', 'South China Sea'],
  
  // Pacific Islands
  'Nadi': ['Pacific Ocean', 'Nadi Bay'],
  'Port Vila': ['Pacific Ocean', 'Vila Bay'],
  'Papeete': ['Pacific Ocean', 'Matavai Bay'],
  'Apia': ['Pacific Ocean', 'Apia Harbour'],
  'Pago Pago': ['Pacific Ocean', 'Pago Pago Harbor'],
  
  // Default for any coastal town not in database
  'DEFAULT_COASTAL': ['Ocean', 'Sea', 'Bay']
};

async function populateWaterBodies() {
  console.log('💧 POPULATING WATER BODIES (within 15km)\\n');
  console.log('=========================================\\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  let alreadyHasData = 0;
  
  for (const town of towns) {
    // Skip if already has water_bodies
    if (town.water_bodies && town.water_bodies.length > 0) {
      alreadyHasData++;
      continue;
    }
    
    let waterBodies = [];
    
    // Check our database first
    if (WATER_BODIES_DATABASE[town.name]) {
      waterBodies = WATER_BODIES_DATABASE[town.name];
    } else {
      // Use geographic features and regions to determine water bodies
      const isCoastal = town.geographic_features?.some(f => 
        f.toLowerCase().includes('coastal') || 
        f.toLowerCase().includes('beach') ||
        f.toLowerCase().includes('port')
      );
      
      const isIsland = town.geographic_features?.some(f => 
        f.toLowerCase().includes('island')
      );
      
      const hasRiver = town.geographic_features?.some(f => 
        f.toLowerCase().includes('river')
      );
      
      const hasLake = town.geographic_features?.some(f => 
        f.toLowerCase().includes('lake')
      );
      
      // Extract water bodies from regions array
      if (town.regions && Array.isArray(town.regions)) {
        town.regions.forEach(region => {
          if (region.includes('Ocean') || region.includes('Sea') || 
              region.includes('Bay') || region.includes('Gulf') || 
              region.includes('Strait') || region.includes('Lake') ||
              region.includes('River')) {
            // Only add if it's a specific water body, not generic
            if (region !== 'Coastal' && region !== 'Island' && 
                !region.includes('Coast') && region !== 'Oceania') {
              waterBodies.push(region);
            }
          }
        });
      }
      
      // If coastal but no specific water body found, add generic
      if (isCoastal && waterBodies.length === 0) {
        // Try to determine which ocean/sea based on country
        const pacificCountries = ['United States', 'Mexico', 'Chile', 'Peru', 'Ecuador', 'Colombia', 'Australia', 'New Zealand', 'Japan', 'Philippines', 'Vietnam', 'Thailand'];
        const atlanticCountries = ['United States', 'Canada', 'Brazil', 'Argentina', 'Uruguay', 'United Kingdom', 'France', 'Spain', 'Portugal', 'Morocco', 'South Africa'];
        const mediterraneanCountries = ['Spain', 'France', 'Italy', 'Greece', 'Turkey', 'Croatia', 'Albania', 'Cyprus', 'Malta', 'Egypt', 'Israel', 'Lebanon'];
        const caribbeanCountries = ['Mexico', 'Belize', 'Honduras', 'Colombia', 'Venezuela', 'Cuba', 'Jamaica', 'Dominican Republic', 'Puerto Rico', 'Barbados', 'Trinidad and Tobago'];
        
        if (mediterraneanCountries.includes(town.country)) {
          waterBodies.push('Mediterranean Sea');
        } else if (caribbeanCountries.includes(town.country) && town.name.includes('Carib')) {
          waterBodies.push('Caribbean Sea');
        } else if (town.country === 'India') {
          // Determine based on location
          if (town.name === 'Chennai' || town.name === 'Pondicherry') {
            waterBodies.push('Bay of Bengal');
          } else {
            waterBodies.push('Arabian Sea');
          }
        } else if (isCoastal) {
          waterBodies.push('Coastal Waters');
        }
      }
    }
    
    // Remove duplicates and clean up
    waterBodies = [...new Set(waterBodies)];
    
    // Only update if we found water bodies
    if (waterBodies.length > 0) {
      const { error: updateError } = await supabase
        .from('towns')
        .update({ water_bodies: waterBodies })
        .eq('id', town.id);
        
      if (updateError) {
        console.log(`❌ Failed to update ${town.name}: ${updateError.message}`);
        errorCount++;
      } else {
        updateCount++;
        if (updateCount <= 10 || updateCount % 20 === 0) {
          console.log(`✅ ${town.name}, ${town.country}: [${waterBodies.join(', ')}]`);
        }
      }
    }
  }
  
  console.log('\\n' + '='.repeat(60));
  console.log('WATER BODIES UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`⏭️ Already had data: ${alreadyHasData} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Verify some key coastal towns
  console.log('\\n🔍 VERIFICATION OF KEY COASTAL TOWNS:\\n');
  
  const verifyTowns = ['Goa', 'Sydney', 'Miami Beach', 'Barcelona', 'Dubai', 'Singapore'];
  for (const name of verifyTowns) {
    const { data } = await supabase
      .from('towns')
      .select('name, country, water_bodies')
      .ilike('name', `%${name}%`)
      .limit(1)
      .single();
      
    if (data) {
      console.log(`${data.name}, ${data.country}:`);
      console.log(`  Water bodies: [${data.water_bodies?.join(', ') || 'NONE'}]`);
    }
  }
}

// Run population
populateWaterBodies().catch(console.error);