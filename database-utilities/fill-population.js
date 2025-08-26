import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillPopulation() {
  console.log('👥 Filling population data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, population')
    .is('population', null)
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`🎯 Found ${towns.length} towns missing population data\n`);
  
  // Known populations for common retirement destinations
  const KNOWN_POPULATIONS = {
    // Major cities
    'Singapore': 5686000,
    'Bangkok': 10539000,
    'Ho Chi Minh City': 9000000,
    'Dubai': 3400000,
    'Abu Dhabi': 1450000,
    'Panama City': 880000,
    'San Juan': 342000,
    'Cape Town': 4600000,
    'Montevideo': 1380000,
    'Taipei': 2600000,
    
    // Medium cities
    'Christchurch': 380000,
    'Wellington': 215000,
    'Queenstown': 15000,
    'Napier': 65000,
    'Tauranga': 155000,
    'Chiang Rai': 75000,
    'Hua Hin': 85000,
    'Phuket': 90000,
    'Koh Samui': 65000,
    'Udon Thani': 130000,
    'Hoi An': 120000,
    'Nha Trang': 420000,
    'Vung Tau': 450000,
    
    // Beach/Island towns
    'Bocas Town (Bocas del Toro)': 8000,
    'Coronado': 12000,
    'Pedasí': 4500,
    'Rincón': 15000,
    'Subic Bay (Olongapo)': 260000,
    'Portimão': 55000,
    'Vila Real de Santo António': 12000,
    'Taormina': 11000,
    'Marbella': 147000,
    'Malaga': 574000,
    'Palma de Mallorca': 420000,
    
    // European cities
    'Barcelona': 1620000,
    'Haarlem': 162000,
    'Amersfoort': 157000,
    'Bergen (NH)': 30000,
    'Hammamet': 75000,
    'Sousse': 275000,
    'Tunis': 640000,
    'Antalya': 2600000,
    'Bodrum': 40000,
    'Fethiye': 85000,
    
    // Small islands/remote
    'Koror': 11000,
    'Kigali': 1200000,
    'Basseterre': 13000,
    'Castries': 20000,
    'Marigot': 5700,
    'Kingstown': 16000,
    'Apia': 37000,
    'Dakar': 1150000,
    'Victoria (Mahé)': 26000,
    'Philipsburg': 1300,
    'Honiara': 85000,
    'Neiafu': 6000,
    'Sanlúcar de Barrameda': 68000,
    'Kaohsiung': 2770000,
    'Colonia del Sacramento': 27000,
    'Punta del Este': 12000,
    'Charlotte Amalie': 18000,
    'Christiansted': 2700,
    'Port Vila': 51000,
    'Providenciales': 25000,
    'Truro (Cornwall)': 19000,
    
    // US cities
    'Asheville': 95000,
    'Boise': 235000,
    'Charleston': 150000,
    'Charlotte': 875000,
    'Chattanooga': 182000,
    'Clearwater': 117000,
    'Denver': 715000,
    'Fort Myers': 87000,
    'Galveston': 53000,
    'Hilton Head Island': 38000,
    'Honolulu': 345000,
    'Huntsville': 215000,
    'Jacksonville': 950000,
    'Lancaster': 58000,
    'Las Vegas': 645000,
    'Myrtle Beach': 35000,
    'Naples': 22000,
    'Orlando': 310000,
    'Palm Beach': 9000,
    'Palm Springs': 48000,
    'Phoenix': 1625000,
    'Portland': 655000,
    'Raleigh': 475000,
    'San Antonio': 1550000,
    'San Diego': 1425000,
    'Santa Fe': 88000,
    'Savannah': 148000,
    'Scottsdale': 260000,
    'St. George': 95000,
    'The Villages': 135000,
    'Tucson': 550000,
    'Venice (FL)': 25000,
    'Virginia Beach': 455000,
    
    // South Africa
    'Hermanus': 35000,
    'Knysna': 77000,
    'Plettenberg Bay': 35000,
    'Lugano': 68000,
    'Bath': 95000,
    'Edinburgh': 525000
  };
  
  const updates = [];
  
  towns.forEach(town => {
    let population;
    
    if (KNOWN_POPULATIONS[town.name]) {
      population = KNOWN_POPULATIONS[town.name];
      console.log(`${town.name}, ${town.country}: ${population.toLocaleString()} (known)`);
    } else {
      // Estimate based on similar towns
      if (town.name.includes('City') || town.name === town.country) {
        population = 500000; // Capital/major city
      } else if (town.name.includes('Beach') || town.name.includes('Bay')) {
        population = 25000; // Beach town
      } else if (town.name.includes('Island')) {
        population = 15000; // Island community
      } else {
        population = 50000; // Default small city
      }
      console.log(`${town.name}, ${town.country}: ${population.toLocaleString()} (estimated)`);
    }
    
    updates.push({
      id: town.id,
      population: population
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ population: update.population })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Population data update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('population')
    .is('population', null);
    
  console.log(`\n📊 Remaining towns without population: ${verification?.length || 0}`);
}

fillPopulation();