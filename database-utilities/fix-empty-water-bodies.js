import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// REAL water bodies for towns with empty arrays
const WATER_BODIES_FIX = {
  // Belgium
  'Dinant': ['Meuse River'],
  'Maastricht': ['Meuse River'],  // Netherlands but near Belgium
  
  // Cambodia - major water!
  'Phnom Penh': ['Mekong River', 'Tonle Sap River', 'Bassac River'],
  'Siem Reap': ['Tonle Sap Lake', 'Siem Reap River'],
  
  // Canada
  'Kelowna': ['Okanagan Lake'],
  
  // France
  'Annecy': ['Lake Annecy', 'Thiou River'],
  'Pau': ['Gave de Pau River'],
  
  // Germany
  'Heidelberg': ['Neckar River'],
  'Freiburg im Breisgau': ['Dreisam River'],
  'Trier': ['Moselle River'],
  'Wiesbaden': ['Rhine River', 'Main River'],
  
  // Guatemala
  'Lake Atitlán (Panajachel)': ['Lake Atitlán'],  // Obviously!
  
  // Laos - Mekong River cities
  'Luang Prabang': ['Mekong River', 'Nam Khan River'],
  'Vientiane': ['Mekong River'],
  
  // Netherlands
  'Amersfoort': ['Eem River'],
  'Zutphen': ['IJssel River', 'Berkel River'],
  
  // Panama
  'Boquete': ['Caldera River'],
  
  // Paraguay
  'Asunción': ['Paraguay River', 'Pilcomayo River'],
  
  // Portugal
  'Braga': ['Cávado River', 'Este River'],
  'Viseu': ['Pavia River', 'Dão River'],
  
  // Nepal
  'Kathmandu': ['Bagmati River', 'Bishnumati River'],
  'Pokhara': ['Phewa Lake', 'Seti River'],
  
  // UK
  'Bath': ['River Avon'],
  
  // USA - Many have significant water bodies
  'Asheville': ['French Broad River', 'Swannanoa River'],
  'Bend': ['Deschutes River'],
  'Boise': ['Boise River'],
  'Chapel Hill': ['Jordan Lake'],
  'Charlotte': ['Lake Norman', 'Lake Wylie', 'Catawba River'],
  'Chattanooga': ['Tennessee River', 'Chickamauga Lake'],
  'Huntsville': ['Tennessee River', 'Wheeler Lake'],
  'Lancaster': ['Susquehanna River', 'Conestoga River'],
  'Palm Springs': [], // Desert city, no significant water within 15km
  'Raleigh': ['Neuse River', 'Falls Lake', 'Jordan Lake'],
  'Santa Fe': ['Santa Fe River'],  // Small seasonal river
  'Scottsdale': ['Salt River', 'Verde River'],
  'St. George': ['Virgin River'],
  'The Villages': [], // Inland Florida, artificial ponds only
  
  // Colombia
  'Medellin': ['Medellín River'],
  'Villa de Leyva': [], // Highland town, no major water
  
  // Costa Rica
  'Atenas': [], // Mountain town
  'Grecia': [], // Mountain town
  
  // Ecuador
  'Vilcabamba': ['Vilcabamba River'],
  
  // Mexico
  'Oaxaca City': ['Atoyac River'],
  'Puebla': ['Atoyac River', 'Alseseca River'],
  
  // Morocco
  'Marrakesh': [], // Desert city, no significant water bodies
  
  // Namibia
  'Windhoek': [], // Desert capital, no permanent water
  
  // Botswana
  'Gaborone': ['Gaborone Dam', 'Notwane River'],
  
  // Rwanda
  'Kigali': [], // Hills, no major water bodies within 15km
  
  // Italy
  'Orvieto': [], // Hilltop town, no major water
  'Spoleto': [], // Mountain town, small streams only
  
  // Other inland towns with no significant water
  'Leuven': ['Dijle River'],
  'Tervuren': [], // Forest town
  'San Ignacio': ['Macal River', 'Mopan River'],
  'Sarlat-la-Canéda': [], // Inland Dordogne
  'Evora': [] // Inland Alentejo
};

async function fixEmptyWaterBodies() {
  console.log('🌊 FIXING EMPTY WATER_BODIES\n');
  console.log('=============================\n');
  
  let updateCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (const [townName, waterBodies] of Object.entries(WATER_BODIES_FIX)) {
    // Find the town
    const { data: town } = await supabase
      .from('towns')
      .select('id, name, country')
      .eq('name', townName)
      .single();
    
    if (!town) {
      // Try with fuzzy match for compound names
      const { data: towns } = await supabase
        .from('towns')
        .select('id, name, country')
        .ilike('name', `%${townName.split(' ')[0]}%`);
      
      const match = towns?.find(t => t.name === townName);
      
      if (!match) {
        console.log(`⚠️ Not found: ${townName}`);
        errorCount++;
        continue;
      } else {
        town.id = match.id;
        town.name = match.name;
        town.country = match.country;
      }
    }
    
    // Update water_bodies
    const { error } = await supabase
      .from('towns')
      .update({ water_bodies: waterBodies })
      .eq('id', town.id);
    
    if (!error) {
      if (waterBodies.length > 0) {
        console.log(`✅ ${town.name}, ${town.country}: → [${waterBodies.join(', ')}]`);
        updateCount++;
      } else {
        console.log(`⭕ ${town.name}, ${town.country}: → [] (no significant water within 15km)`);
        skippedCount++;
      }
    } else {
      console.log(`❌ Failed: ${town.name} - ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('WATER BODIES FIX COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated with water: ${updateCount} towns`);
  console.log(`⭕ Confirmed no water: ${skippedCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Final check
  console.log('\n📊 FINAL CHECK:\n');
  
  const { data: stillEmpty } = await supabase
    .from('towns')
    .select('name, country, geographic_features')
    .eq('water_bodies', '{}');
  
  console.log(`Towns with empty water_bodies: ${stillEmpty?.length || 0}`);
  
  if (stillEmpty && stillEmpty.length > 0) {
    console.log('\nRemaining empty (verify these are correct):');
    stillEmpty.slice(0, 20).forEach(t => {
      const features = t.geographic_features ? t.geographic_features.join(', ') : 'No features';
      console.log(`  - ${t.name}, ${t.country} (${features})`);
    });
  }
}

// Run fix
fixEmptyWaterBodies().catch(console.error);