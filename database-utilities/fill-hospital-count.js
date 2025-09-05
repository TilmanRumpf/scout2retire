import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fillHospitalCount() {
  console.log('🏥 Filling hospital count data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Hospital count estimation based on population and development
  const getHospitalCount = (population, country, isCapital) => {
    // Developed countries have more hospitals per capita
    const developedCountries = [
      'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
      'Japan', 'Australia', 'Netherlands', 'Belgium', 'Switzerland',
      'Austria', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Singapore',
      'South Korea', 'Italy', 'Spain', 'Portugal', 'Israel', 'New Zealand'
    ];
    
    const isDeveloped = developedCountries.includes(country);
    
    // Base calculation
    let hospitals = 0;
    
    if (population > 5000000) {
      hospitals = isDeveloped ? 50 : 25;
    } else if (population > 2000000) {
      hospitals = isDeveloped ? 30 : 15;
    } else if (population > 1000000) {
      hospitals = isDeveloped ? 20 : 10;
    } else if (population > 500000) {
      hospitals = isDeveloped ? 12 : 6;
    } else if (population > 200000) {
      hospitals = isDeveloped ? 8 : 4;
    } else if (population > 100000) {
      hospitals = isDeveloped ? 5 : 3;
    } else if (population > 50000) {
      hospitals = isDeveloped ? 3 : 2;
    } else if (population > 20000) {
      hospitals = isDeveloped ? 2 : 1;
    } else {
      hospitals = 1; // At least one clinic/hospital
    }
    
    // Capital cities get 20% more
    if (isCapital) {
      hospitals = Math.round(hospitals * 1.2);
    }
    
    // Medical tourism destinations get more
    const medicalTourismHubs = [
      'Bangkok', 'Singapore', 'Kuala Lumpur', 'Delhi', 'Mumbai', 'Chennai',
      'Istanbul', 'Dubai', 'Tel Aviv', 'Seoul', 'Tokyo', 'Mexico City',
      'São Paulo', 'Buenos Aires', 'San Jose', 'Panama City'
    ];
    
    if (medicalTourismHubs.some(hub => towns.name?.includes(hub))) {
      hospitals = Math.round(hospitals * 1.5);
    }
    
    return hospitals;
  };
  
  const missingData = towns.filter(t => t.hospital_count === null);
  console.log(`🎯 Found ${missingData.length} towns missing hospital count\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    const isCapital = town.name === town.country || 
                     town.name.includes('City') || 
                     town.name === 'Capital';
    
    const hospitalCount = getHospitalCount(town.population, town.country, isCapital);
    
    console.log(`${town.name}, ${town.country}: ${hospitalCount} hospitals (pop: ${(town.population || 0).toLocaleString()})`);
    
    updates.push({
      id: town.id,
      hospital_count: hospitalCount
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
        .update({ hospital_count: update.hospital_count })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Hospital count update complete!');
  
  // Verify and show summary
  const { data: allTowns } = await supabase
    .from('towns')
    .select('hospital_count, population');
    
  const totalHospitals = allTowns.reduce((sum, t) => sum + (t.hospital_count || 0), 0);
  const avgHospitals = (totalHospitals / allTowns.length).toFixed(1);
  
  console.log('\n📊 Hospital Distribution Summary:');
  console.log(`Total hospitals across all towns: ${totalHospitals}`);
  console.log(`Average hospitals per town: ${avgHospitals}`);
  
  // Group by hospital count
  const distribution = {};
  allTowns.forEach(t => {
    const count = t.hospital_count || 0;
    if (count === 1) distribution['1 hospital'] = (distribution['1 hospital'] || 0) + 1;
    else if (count <= 3) distribution['2-3 hospitals'] = (distribution['2-3 hospitals'] || 0) + 1;
    else if (count <= 5) distribution['4-5 hospitals'] = (distribution['4-5 hospitals'] || 0) + 1;
    else if (count <= 10) distribution['6-10 hospitals'] = (distribution['6-10 hospitals'] || 0) + 1;
    else distribution['10+ hospitals'] = (distribution['10+ hospitals'] || 0) + 1;
  });
  
  console.log('\nDistribution:');
  Object.entries(distribution).forEach(([range, count]) => {
    console.log(`${range}: ${count} towns (${(count/341*100).toFixed(1)}%)`);
  });
}

fillHospitalCount();