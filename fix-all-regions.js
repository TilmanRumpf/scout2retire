import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Region fixes for all issues found
const REGION_FIXES = {
  // Fix invalid "—" regions
  'Valletta': { country: 'Malta', newRegion: 'Central Malta' },
  'Sliema': { country: 'Malta', newRegion: 'Central Malta' },
  'Singapore': { country: 'Singapore', newRegion: 'Central Singapore' },
  'Taipei': { country: 'Taiwan', newRegion: 'Northern Taiwan' },
  'Kaohsiung': { country: 'Taiwan', newRegion: 'Southern Taiwan' },
  
  // Add missing region
  'Tallinn': { country: 'Estonia', newRegion: 'Harju County' },
  
  // Fix USA towns (use full state names)
  'Palm Beach': { country: 'United States', newRegion: 'Florida' },
  'Phoenix': { country: 'United States', newRegion: 'Arizona' },
  'Honolulu': { country: 'United States', newRegion: 'Hawaii' },
  'Gainesville, FL': { country: 'United States', newRegion: 'Florida', rename: 'Gainesville' },
  'The Villages': { country: 'United States', newRegion: 'Florida' },
  'Scottsdale': { country: 'United States', newRegion: 'Arizona' },
  'Austin': { country: 'United States', newRegion: 'Texas' },
  'Tucson': { country: 'United States', newRegion: 'Arizona' },
  'Clearwater': { country: 'United States', newRegion: 'Florida' },
  'Boulder': { country: 'United States', newRegion: 'Colorado' },
  'Boise': { country: 'United States', newRegion: 'Idaho' },
  'St. Petersburg': { country: 'United States', newRegion: 'Florida' },
  'Las Vegas': { country: 'United States', newRegion: 'Nevada' },
  'Venice (FL)': { country: 'United States', newRegion: 'Florida' },
  'Jacksonville': { country: 'United States', newRegion: 'Florida' },
  'Fort Myers': { country: 'United States', newRegion: 'Florida' },
  'Palm Springs': { country: 'United States', newRegion: 'California' },
  'San Diego': { country: 'United States', newRegion: 'California' },
  'Savannah': { country: 'United States', newRegion: 'Georgia' },
  'St. George': { country: 'United States', newRegion: 'Utah' },
  'Denver': { country: 'United States', newRegion: 'Colorado' },
  'Lancaster': { country: 'United States', newRegion: 'Pennsylvania' },
  'Virginia Beach': { country: 'United States', newRegion: 'Virginia' },
  'Bend': { country: 'United States', newRegion: 'Oregon' },
  'Sarasota': { country: 'United States', newRegion: 'Florida' },
  'New Port Richey': { country: 'United States', newRegion: 'Florida' },
  'Chattanooga': { country: 'United States', newRegion: 'Tennessee' },
  'Orlando': { country: 'United States', newRegion: 'Florida' },
  'Naples': { country: 'United States', newRegion: 'Florida' },
  'Portland': { country: 'United States', newRegion: 'Oregon' },
  'Galveston': { country: 'United States', newRegion: 'Texas' },
  'San Antonio': { country: 'United States', newRegion: 'Texas' },
  'Huntsville': { country: 'United States', newRegion: 'Alabama' },
  
  // Fix Spain regions (remove "Europe", use proper regions)
  'Santander': { country: 'Spain', newRegion: 'Cantabria' },
  'Vigo': { country: 'Spain', newRegion: 'Galicia' },
  'San Sebastián': { country: 'Spain', newRegion: 'Basque Country' },
  'Girona': { country: 'Spain', newRegion: 'Catalonia' },
  'Cádiz': { country: 'Spain', newRegion: 'Andalusia' },
  
  // Fix Portugal regions (remove "Europe", standardize)
  'Algarve (Lagos)': { country: 'Portugal', newRegion: 'Algarve' },
  'Portimão': { country: 'Portugal', newRegion: 'Algarve' },
  'Albufeira': { country: 'Portugal', newRegion: 'Algarve' },
  'Vilamoura': { country: 'Portugal', newRegion: 'Algarve' },
  'Olhão': { country: 'Portugal', newRegion: 'Algarve' },
  'Évora': { country: 'Portugal', newRegion: 'Alentejo' },
  'Porto': { country: 'Portugal', newRegion: 'Porto District' },
  'Aveiro': { country: 'Portugal', newRegion: 'Aveiro District' },
  'Coimbra': { country: 'Portugal', newRegion: 'Coimbra District' },
  'Funchal (Madeira)': { country: 'Portugal', newRegion: 'Madeira' },
  'Cascais': { country: 'Portugal', newRegion: 'Lisbon District' },
  'Lisbon': { country: 'Portugal', newRegion: 'Lisbon District' },
  
  // Fix Australian regions (standardize state names)
  'Newcastle (Aus)': { country: 'Australia', newRegion: 'New South Wales', rename: 'Newcastle' },
  
  // Fix other countries with generic "Europe" or wrong regions
  'Prague': { country: 'Czech Republic', newRegion: 'Central Bohemia' },
  'Amsterdam': { country: 'Netherlands', newRegion: 'North Holland' },
  'Hoorn': { country: 'Netherlands', newRegion: 'North Holland' },
  'Haarlem': { country: 'Netherlands', newRegion: 'North Holland' },
  'Lemmer': { country: 'Netherlands', newRegion: 'Friesland' },
  'Brussels': { country: 'Belgium', newRegion: 'Brussels-Capital Region' },
  'Ghent': { country: 'Belgium', newRegion: 'East Flanders' },
  'Leuven': { country: 'Belgium', newRegion: 'Flemish Brabant' },
  'Vienna': { country: 'Austria', newRegion: 'Vienna' },
  'Ljubljana': { country: 'Slovenia', newRegion: 'Central Slovenia' },
  'Split': { country: 'Croatia', newRegion: 'Split-Dalmatia County' },
  'Dubrovnik': { country: 'Croatia', newRegion: 'Dubrovnik-Neretva County' },
  'Zagreb': { country: 'Croatia', newRegion: 'Zagreb County' },
  'Trogir': { country: 'Croatia', newRegion: 'Split-Dalmatia County' },
  'Rovinj': { country: 'Croatia', newRegion: 'Istria County' },
  'Athens': { country: 'Greece', newRegion: 'Attica' },
  'Paphos': { country: 'Northern Cyprus', newRegion: 'Paphos District' },
  'Ioannina': { country: 'Greece', newRegion: 'Epirus' }
};

async function fixAllRegions() {
  console.log('🌍 FIXING ALL REGION DATA\n');
  console.log('=====================================\n');
  
  let fixCount = 0;
  let errorCount = 0;
  const results = [];
  
  for (const [townName, fix] of Object.entries(REGION_FIXES)) {
    // Find the town
    const { data: town, error: findError } = await supabase
      .from('towns')
      .select('id, name, region')
      .eq('name', townName)
      .eq('country', fix.country)
      .single();
    
    if (findError || !town) {
      console.log(`⚠️ Could not find: ${townName}, ${fix.country}`);
      errorCount++;
      continue;
    }
    
    // Prepare update
    const updates = { region: fix.newRegion };
    if (fix.rename) {
      updates.name = fix.rename;
    }
    
    // Update the region
    const { error: updateError } = await supabase
      .from('towns')
      .update(updates)
      .eq('id', town.id);
    
    if (updateError) {
      console.log(`❌ Failed to update ${townName}: ${updateError.message}`);
      errorCount++;
    } else {
      const oldRegion = town.region || 'NULL';
      console.log(`✅ ${townName}: "${oldRegion}" → "${fix.newRegion}"`);
      if (fix.rename) {
        console.log(`   Also renamed to: ${fix.rename}`);
      }
      fixCount++;
      results.push({
        town: townName,
        country: fix.country,
        oldRegion: oldRegion,
        newRegion: fix.newRegion
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('REGION FIX COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Fixed: ${fixCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Verify some key fixes
  console.log('\n🔍 VERIFICATION OF KEY FIXES:\n');
  
  const verifyTowns = ['Singapore', 'Tallinn', 'Gainesville', 'Naples', 'Lisbon'];
  for (const name of verifyTowns) {
    const { data } = await supabase
      .from('towns')
      .select('name, country, region')
      .ilike('name', name)
      .limit(2); // May have multiple Naples (Italy vs USA)
    
    if (data && data.length > 0) {
      data.forEach(t => {
        console.log(`  ${t.name}, ${t.country}: region = "${t.region}"`);
      });
    }
  }
  
  // Final summary by country
  console.log('\n📊 FINAL REGION SUMMARY:\n');
  
  const countries = ['United States', 'Spain', 'Portugal', 'Malta', 'Singapore', 'Taiwan'];
  for (const country of countries) {
    const { data } = await supabase
      .from('towns')
      .select('region')
      .eq('country', country);
    
    const regions = new Set(data?.map(t => t.region));
    console.log(`${country}: ${Array.from(regions).join(', ')}`);
  }
}

// Run fixes
fixAllRegions().catch(console.error);