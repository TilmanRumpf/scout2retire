import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// REAL SPECIFIC water bodies - NO GENERIC CRAP!
const WATER_BODIES_SPECIFIC = {
  // Belgium
  'Bruges': ['North Sea'],  // 15km from coast
  'Ghent': [], // Inland, remove coastal waters
  
  // Belize
  'Corozal': ['Caribbean Sea', 'Corozal Bay'],
  
  // Brazil
  'Florianópolis': ['Atlantic Ocean', 'Conceição Lagoon', 'North Bay', 'South Bay'],
  
  // Cambodia
  'Kampot': ['Gulf of Thailand', 'Kampong Bay River'],
  
  // Canada
  'Moncton': ['Petitcodiac River'], // Not coastal, river city
  
  // Chile
  'La Serena': ['Pacific Ocean', 'Coquimbo Bay'],
  
  // Cook Islands
  'Rarotonga (Avarua)': ['Pacific Ocean', 'Avarua Harbor'],
  
  // Costa Rica
  'Escazú': [], // Inland suburb of San José, not coastal!
  
  // Dominican Republic
  'Las Terrenas': ['Atlantic Ocean', 'Samaná Bay'],
  'Puerto Plata': ['Atlantic Ocean'],
  'Punta Cana': ['Atlantic Ocean', 'Caribbean Sea'],
  'Sosúa': ['Atlantic Ocean', 'Sosúa Bay'],
  
  // Ecuador
  'Manta': ['Pacific Ocean'],
  
  // Fiji
  'Savusavu': ['Pacific Ocean', 'Savusavu Bay'],
  'Suva': ['Pacific Ocean', 'Suva Harbor', 'Laucala Bay'],
  
  // Germany
  'Eckernförde': ['Baltic Sea', 'Eckernförde Bay'],
  'Wismar': ['Baltic Sea', 'Wismar Bay'],
  
  // Latvia
  'Jurmala': ['Baltic Sea', 'Gulf of Riga'],
  
  // Marshall Islands
  'Majuro': ['Pacific Ocean', 'Majuro Lagoon'],
  
  // Martinique
  'Fort-de-France': ['Caribbean Sea', 'Fort-de-France Bay'],
  
  // Mexico
  'Ensenada': ['Pacific Ocean', 'Todos Santos Bay'],
  'Huatulco': ['Pacific Ocean', 'Huatulco Bays'],
  'La Paz': ['Sea of Cortez', 'La Paz Bay'],
  'Merida': [], // Inland Yucatan, not coastal!
  'Mérida': [], // Duplicate, also inland!
  
  // Micronesia
  'Pohnpei (Kolonia)': ['Pacific Ocean', 'Pohnpei Lagoon'],
  
  // Montenegro
  'Budva': ['Adriatic Sea'],
  'Herceg Novi': ['Adriatic Sea', 'Bay of Kotor'],
  'Kotor': ['Adriatic Sea', 'Bay of Kotor'],
  
  // Morocco
  'Agadir': ['Atlantic Ocean', 'Agadir Bay'],
  'Essaouira': ['Atlantic Ocean'],
  
  // Namibia
  'Swakopmund': ['Atlantic Ocean'],
  
  // Netherlands
  'Bergen (NH)': ['North Sea'], // Keep North Sea, it's correct
  'Haarlem': [], // Inland, not coastal
  'Hoorn': ['IJsselmeer', 'Markermeer'],
  'Leiden': [], // Inland, not coastal
  
  // New Caledonia
  'Noumea': ['Pacific Ocean', 'Coral Sea', 'Sainte Marie Bay'],
  
  // Northern Cyprus
  'Kyrenia': ['Mediterranean Sea'],
  'Paphos': ['Mediterranean Sea'],
  
  // Palau
  'Koror': ['Pacific Ocean', 'Philippine Sea'],
  
  // Panama
  'Bocas Town (Bocas del Toro)': ['Caribbean Sea', 'Almirante Bay'],
  'Coronado': ['Pacific Ocean', 'Bay of Panama'],
  'Panama City': ['Pacific Ocean', 'Bay of Panama'],
  'Pedasí': ['Pacific Ocean', 'Gulf of Panama'],
  
  // Portugal
  'Nazaré': ['Atlantic Ocean'],
  
  // Puerto Rico
  'Rincón': ['Atlantic Ocean', 'Mona Passage'],
  
  // Saint Kitts and Nevis
  'Basseterre': ['Caribbean Sea', 'Atlantic Ocean'],
  
  // Saint Martin
  'Marigot': ['Caribbean Sea', 'Marigot Bay'],
  
  // Saint Vincent
  'Kingstown': ['Caribbean Sea', 'Atlantic Ocean'],
  
  // Sint Maarten
  'Philipsburg': ['Caribbean Sea', 'Great Bay'],
  
  // Solomon Islands
  'Honiara': ['Pacific Ocean', 'Solomon Sea', 'Iron Bottom Sound'],
  
  // Tonga
  'Neiafu': ['Pacific Ocean', 'Port of Refuge Harbor'],
  
  // Tunisia
  'Hammamet': ['Mediterranean Sea', 'Gulf of Hammamet'],
  'Sousse': ['Mediterranean Sea', 'Gulf of Hammamet'],
  'Tunis': ['Mediterranean Sea', 'Gulf of Tunis', 'Lake of Tunis'],
  
  // Turks and Caicos
  'Providenciales': ['Atlantic Ocean', 'Caicos Banks'],
  
  // UK
  'Edinburgh': ['Firth of Forth', 'Water of Leith'], // Remove generic "North Sea"
  'Truro (Cornwall)': ['English Channel', 'Truro River', 'Fal River'],
  
  // USA
  'Gainesville': [], // Inland Florida, not coastal!
  'Honolulu': ['Pacific Ocean', 'Mamala Bay'],
  'Orlando': [], // Inland Florida, not coastal!
  
  // Uruguay
  'Colonia del Sacramento': ['Río de la Plata'],
  'Punta del Este': ['Atlantic Ocean', 'Río de la Plata'],
  
  // US Virgin Islands
  'Charlotte Amalie': ['Caribbean Sea', 'Charlotte Amalie Harbor'],
  'Christiansted': ['Caribbean Sea', 'Christiansted Harbor']
};

async function fixGenericCoastalWaters() {
  console.log('🌊 FIXING GENERIC "COASTAL WATERS" ENTRIES\n');
  console.log('===========================================\n');
  
  let updateCount = 0;
  let errorCount = 0;
  let removedCount = 0;
  
  for (const [townName, waterBodies] of Object.entries(WATER_BODIES_SPECIFIC)) {
    // Find the town
    const { data: town } = await supabase
      .from('towns')
      .select('id, name, country, water_bodies')
      .eq('name', townName)
      .single();
    
    if (!town) {
      console.log(`⚠️ Not found: ${townName}`);
      errorCount++;
      continue;
    }
    
    // Update water_bodies
    const { error } = await supabase
      .from('towns')
      .update({ water_bodies: waterBodies })
      .eq('id', town.id);
    
    if (!error) {
      const oldWater = town.water_bodies?.join(', ') || 'null';
      if (waterBodies.length > 0) {
        console.log(`✅ ${town.name}, ${town.country}:`);
        console.log(`   Was: [${oldWater}]`);
        console.log(`   Now: [${waterBodies.join(', ')}]`);
        updateCount++;
      } else {
        console.log(`🗑️ ${town.name}, ${town.country}: REMOVED (not coastal)`);
        removedCount++;
      }
    } else {
      console.log(`❌ Failed: ${town.name} - ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('GENERIC WATER BODIES FIX COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Fixed with real names: ${updateCount} towns`);
  console.log(`🗑️ Removed (not coastal): ${removedCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Final check for any remaining "Coastal Waters"
  console.log('\n📊 FINAL CHECK:\n');
  
  const { data: stillGeneric } = await supabase
    .from('towns')
    .select('name, country, water_bodies');
  
  const remaining = stillGeneric?.filter(t => 
    t.water_bodies?.some(w => 
      w === 'Coastal Waters' || 
      w === 'coastal water' ||
      w === 'Ocean' ||
      w === 'Sea' ||
      w === 'River' ||
      w === 'Lake'
    )
  );
  
  if (remaining && remaining.length > 0) {
    console.log(`⚠️ Still have generic entries: ${remaining.length} towns`);
    remaining.forEach(t => {
      console.log(`  - ${t.name}, ${t.country}: [${t.water_bodies.join(', ')}]`);
    });
  } else {
    console.log('✅ No more generic "Coastal Waters" entries!');
  }
}

// Run fix
fixGenericCoastalWaters().catch(console.error);