import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function querySpanishTowns() {
  console.log('🇪🇸 Querying all Spanish towns...\n');
  
  // First query: Get all Spanish towns with key fields
  const { data: allSpanishTowns, error: error1 } = await supabase
    .from('towns')
    .select('id, town_name, region, regions, geographic_features_actual, description, climate_description')
    .eq('country', 'Spain')
    .order('town_name');

  if (error1) {
    console.error('❌ Error fetching Spanish towns:', error1);
    return;
  }

  console.log(`📊 Found ${allSpanishTowns.length} Spanish towns total`);
  console.log('First 5 towns:');
  allSpanishTowns.slice(0, 5).forEach(town => {
    console.log(`- ${town.town_name} (${town.region})`);
  });
  
  console.log('\n🏖️ Searching for coastal references...\n');
  
  // Second query: Search for coastal references
  const { data: coastalTowns, error: error2 } = await supabase
    .from('towns')
    .select('id, town_name, region, regions, description, climate_description')
    .eq('country', 'Spain')
    .or(`description.ilike.%coast%,description.ilike.%beach%,description.ilike.%sea%,description.ilike.%ocean%,description.ilike.%mediterranean%,description.ilike.%atlantic%,description.ilike.%shore%,description.ilike.%marina%,description.ilike.%port%,description.ilike.%harbor%,climate_description.ilike.%coast%,climate_description.ilike.%beach%,climate_description.ilike.%sea%,climate_description.ilike.%mediterranean%,climate_description.ilike.%atlantic%`);

  if (error2) {
    console.error('❌ Error searching coastal towns:', error2);
    return;
  }

  console.log(`🏖️ Found ${coastalTowns.length} Spanish towns with coastal references:`);
  
  if (coastalTowns.length === 0) {
    console.log('❌ No coastal references found in Spanish towns');
    return;
  }

  coastalTowns.forEach((town, index) => {
    console.log(`\n${index + 1}. ${town.town_name} (ID: ${town.id})`);
    console.log(`   Region: ${town.region}`);
    if (town.regions && town.regions.length > 0) {
      console.log(`   Regions array: [${town.regions.join(', ')}]`);
    }
    
    // Check where coastal references appear
    const coastalTerms = ['coast', 'beach', 'sea', 'ocean', 'mediterranean', 'atlantic', 'shore', 'marina', 'port', 'harbor'];
    const foundIn = [];
    
    if (town.description) {
      const desc = town.description.toLowerCase();
      const foundTerms = coastalTerms.filter(term => desc.includes(term));
      if (foundTerms.length > 0) {
        foundIn.push(`description: ${foundTerms.join(', ')}`);
      }
    }
    
    if (town.climate_description) {
      const climate = town.climate_description.toLowerCase();
      const foundTerms = coastalTerms.filter(term => climate.includes(term));
      if (foundTerms.length > 0) {
        foundIn.push(`climate: ${foundTerms.join(', ')}`);
      }
    }
    
    if (town.regions) {
      const regionsText = town.regions.join(' ').toLowerCase();
      const foundTerms = coastalTerms.filter(term => regionsText.includes(term));
      if (foundTerms.length > 0) {
        foundIn.push(`regions: ${foundTerms.join(', ')}`);
      }
    }
    
    console.log(`   ⭐ Coastal references found in: ${foundIn.join(' | ')}`);
    
    if (town.description && town.description.length > 0) {
      console.log(`   📝 Description: ${town.description.substring(0, 200)}${town.description.length > 200 ? '...' : ''}`);
    }
    
    if (town.climate_description && town.climate_description.length > 0) {
      console.log(`   🌤️ Climate: ${town.climate_description.substring(0, 150)}${town.climate_description.length > 150 ? '...' : ''}`);
    }
  });

  console.log(`\n📊 Summary: ${coastalTowns.length} out of ${allSpanishTowns.length} Spanish towns (${Math.round(coastalTowns.length/allSpanishTowns.length*100)}%) have coastal references`);
}

querySpanishTowns().catch(console.error);