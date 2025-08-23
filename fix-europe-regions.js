import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fix all "Europe" regions with proper regional names
const EUROPE_FIXES = {
  // France
  'Bordeaux': { country: 'France', newRegion: 'Nouvelle-Aquitaine' },
  'Saint-Tropez': { country: 'France', newRegion: 'Provence-Alpes-Côte d\'Azur' },
  'Paris': { country: 'France', newRegion: 'Île-de-France' },
  
  // Italy
  'Rome': { country: 'Italy', newRegion: 'Lazio' },
  
  // Latvia
  'Riga': { country: 'Latvia', newRegion: 'Riga Region' },
  
  // Portugal
  'Tavira': { country: 'Portugal', newRegion: 'Algarve' },
  
  // Spain
  'Alicante': { country: 'Spain', newRegion: 'Valencia Community' },
  'Valencia': { country: 'Spain', newRegion: 'Valencia Community' }
};

// Fix "Asia" and "South America" generic regions
const CONTINENT_FIXES = {
  // Asia entries - need specific regions
  'Bangkok': { country: 'Thailand', newRegion: 'Central Thailand' },
  'Chiang Mai': { country: 'Thailand', newRegion: 'Northern Thailand' },
  'Phuket': { country: 'Thailand', newRegion: 'Southern Thailand' },
  'Ho Chi Minh City': { country: 'Vietnam', newRegion: 'Southeast Vietnam' },
  'Hanoi': { country: 'Vietnam', newRegion: 'Northern Vietnam' },
  'Da Nang': { country: 'Vietnam', newRegion: 'Central Vietnam' },
  'Kuala Lumpur': { country: 'Malaysia', newRegion: 'Federal Territory' },
  'Penang': { country: 'Malaysia', newRegion: 'Penang State' },
  
  // South America entries
  'Montevideo': { country: 'Uruguay', newRegion: 'Montevideo Department' },
  'Quito': { country: 'Ecuador', newRegion: 'Pichincha Province' }
};

// Clean up regions with parentheses - standardize to cleaner format
const PARENTHESES_CLEANUP = {
  'Nouvelle-Aquitaine (Béarn)': 'Nouvelle-Aquitaine',
  'Namur (Wallonia)': 'Namur Province',
  'Windward Islands (Tahiti)': 'Windward Islands',
  'San Pedro (Ambergris Caye)': 'Ambergris Caye',
  'Harju (Tallinn)': 'Harju County',  // This was wrong - Lugano is in Switzerland!
  'Tuamasaga (Upolu)': 'Tuamasaga District',
  'Nouvelle-Aquitaine (Dordogne)': 'Nouvelle-Aquitaine',
  'Occitanie (Pyrénées-Orientales)': 'Occitanie',
  'Galicia (Pontevedra)': 'Galicia',
  'Port Louis (Capital)': 'Port Louis District',
  '(Central)': 'West Flanders',  // Bruges is in West Flanders
  'Apulia (Puglia)': 'Apulia',
  'Bavaria (Lake Constance)': 'Bavaria',
  'Andalusia (Cádiz)': 'Andalusia',
  'Prague (Capital)': 'Prague',
  'Algarve (Faro)': 'Algarve'
};

// Special fix for Lugano - it had wrong region
const SPECIAL_FIXES = {
  'Lugano': { country: 'Switzerland', newRegion: 'Ticino' }
};

async function fixAllProblematicRegions() {
  console.log('🌍 FIXING ALL PROBLEMATIC REGIONS\n');
  console.log('==================================\n');
  
  let fixCount = 0;
  let errorCount = 0;
  
  // 1. Fix "Europe" regions
  console.log('📍 FIXING "EUROPE" REGIONS:\n');
  for (const [townName, fix] of Object.entries(EUROPE_FIXES)) {
    const { data: town } = await supabase
      .from('towns')
      .select('id, region')
      .eq('name', townName)
      .eq('country', fix.country)
      .single();
    
    if (town) {
      const { error } = await supabase
        .from('towns')
        .update({ region: fix.newRegion })
        .eq('id', town.id);
      
      if (!error) {
        console.log(`✅ ${townName}, ${fix.country}: "Europe" → "${fix.newRegion}"`);
        fixCount++;
      } else {
        console.log(`❌ Failed: ${townName} - ${error.message}`);
        errorCount++;
      }
    }
  }
  
  // 2. Fix "Asia" and "South America" regions
  console.log('\n📍 FIXING CONTINENT REGIONS:\n');
  
  // First find all towns with these generic regions
  const { data: asiaTowns } = await supabase
    .from('towns')
    .select('id, name, country')
    .eq('region', 'Asia');
    
  const { data: southAmericaTowns } = await supabase
    .from('towns')
    .select('id, name, country')
    .eq('region', 'South America');
  
  // Fix Asia towns
  if (asiaTowns) {
    for (const town of asiaTowns) {
      const fix = CONTINENT_FIXES[town.name];
      if (fix) {
        const { error } = await supabase
          .from('towns')
          .update({ region: fix.newRegion })
          .eq('id', town.id);
        
        if (!error) {
          console.log(`✅ ${town.name}, ${town.country}: "Asia" → "${fix.newRegion}"`);
          fixCount++;
        }
      } else {
        console.log(`⚠️ Need manual fix: ${town.name}, ${town.country} (currently "Asia")`);
      }
    }
  }
  
  // Fix South America towns
  if (southAmericaTowns) {
    for (const town of southAmericaTowns) {
      const fix = CONTINENT_FIXES[town.name];
      if (fix) {
        const { error } = await supabase
          .from('towns')
          .update({ region: fix.newRegion })
          .eq('id', town.id);
        
        if (!error) {
          console.log(`✅ ${town.name}, ${town.country}: "South America" → "${fix.newRegion}"`);
          fixCount++;
        }
      } else {
        console.log(`⚠️ Need manual fix: ${town.name}, ${town.country} (currently "South America")`);
      }
    }
  }
  
  // 3. Clean up parentheses in regions
  console.log('\n📍 CLEANING UP PARENTHESES IN REGIONS:\n');
  for (const [oldRegion, newRegion] of Object.entries(PARENTHESES_CLEANUP)) {
    const { data: towns } = await supabase
      .from('towns')
      .select('id, name, country')
      .eq('region', oldRegion);
    
    if (towns && towns.length > 0) {
      for (const town of towns) {
        const { error } = await supabase
          .from('towns')
          .update({ region: newRegion })
          .eq('id', town.id);
        
        if (!error) {
          console.log(`✅ ${town.name}: "${oldRegion}" → "${newRegion}"`);
          fixCount++;
        } else {
          errorCount++;
        }
      }
    }
  }
  
  // 4. Special fixes (like Lugano)
  console.log('\n📍 SPECIAL FIXES:\n');
  for (const [townName, fix] of Object.entries(SPECIAL_FIXES)) {
    const { data: town } = await supabase
      .from('towns')
      .select('id, region')
      .eq('name', townName)
      .eq('country', fix.country)
      .single();
    
    if (town) {
      const { error } = await supabase
        .from('towns')
        .update({ region: fix.newRegion })
        .eq('id', town.id);
      
      if (!error) {
        console.log(`✅ ${townName}, ${fix.country}: "${town.region}" → "${fix.newRegion}"`);
        fixCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('REGION CLEANUP COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Fixed: ${fixCount} regions`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Final verification
  console.log('\n🔍 FINAL VERIFICATION:\n');
  
  // Check if any "Europe", "Asia", or "South America" remain
  const { data: remaining } = await supabase
    .from('towns')
    .select('name, country, region')
    .or('region.eq.Europe,region.eq.Asia,region.eq.South America,region.eq.North America,region.eq.Africa,region.eq.Oceania');
  
  if (remaining && remaining.length > 0) {
    console.log('⚠️ Still have generic continent regions:');
    remaining.forEach(t => console.log(`  - ${t.name}, ${t.country}: "${t.region}"`));
  } else {
    console.log('✅ No more generic continent regions!');
  }
  
  // Check parentheses
  const { data: parens } = await supabase
    .from('towns')
    .select('name, region')
    .like('region', '%(%');
  
  if (parens && parens.length > 0) {
    console.log('\n⚠️ Still have regions with parentheses:');
    parens.forEach(t => console.log(`  - ${t.name}: "${t.region}"`));
  } else {
    console.log('✅ No more regions with parentheses!');
  }
}

// Run fixes
fixAllProblematicRegions().catch(console.error);