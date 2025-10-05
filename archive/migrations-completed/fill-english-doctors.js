import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fillEnglishDoctors() {
  console.log('🏥 Filling english_speaking_doctors data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Native English-speaking countries
  const ENGLISH_NATIVE = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand', 
    'Ireland', 'Bahamas', 'Barbados', 'Belize', 'Jamaica', 'Trinidad and Tobago',
    'Antigua and Barbuda', 'Saint Kitts and Nevis', 'Saint Lucia', 
    'Saint Vincent and Grenadines', 'Grenada', 'Dominica'
  ];
  
  // Former British colonies with high English usage
  const ENGLISH_COMMON = [
    'India', 'Singapore', 'Malaysia', 'Malta', 'Cyprus', 'Fiji', 
    'Mauritius', 'Seychelles', 'Botswana', 'South Africa', 'Kenya', 
    'Tanzania', 'Uganda', 'Nigeria', 'Ghana', 'Zambia', 'Zimbabwe'
  ];
  
  // Popular expat/tourist destinations
  const TOURIST_HUBS = [
    'Dubai', 'Abu Dhabi', 'Phuket', 'Koh Samui', 'Bangkok', 'Chiang Mai',
    'Bali', 'Canggu', 'Ubud', 'Lisbon', 'Porto', 'Algarve', 'Barcelona',
    'Madrid', 'Valencia', 'Malaga', 'Marbella', 'Palma de Mallorca',
    'Cancun', 'Playa del Carmen', 'Puerto Vallarta', 'Los Cabos',
    'Panama City', 'San Jose', 'Tamarindo', 'Tel Aviv', 'Jerusalem'
  ];
  
  // Medical tourism destinations
  const MEDICAL_TOURISM = [
    'Bangkok', 'Phuket', 'Singapore', 'Kuala Lumpur', 'Penang', 'Seoul',
    'Istanbul', 'Dubai', 'Tel Aviv', 'San Jose', 'Panama City', 'Monterrey',
    'Guadalajara', 'Mexico City', 'Medellin', 'Bogota', 'Buenos Aires'
  ];
  
  const missingData = towns.filter(t => t.english_speaking_doctors === null);
  console.log(`🎯 Found ${missingData.length} towns missing english_speaking_doctors data\n`);
  
  const updates = [];
  let yesCount = 0, noCount = 0;
  
  missingData.forEach(town => {
    let hasEnglishDocs;
    let reason;
    
    // Native English-speaking countries - always YES
    if (ENGLISH_NATIVE.includes(town.country)) {
      hasEnglishDocs = true;
      reason = 'English-speaking country';
      yesCount++;
    }
    // Common English countries - usually YES in cities
    else if (ENGLISH_COMMON.includes(town.country)) {
      if (town.population > 50000 || TOURIST_HUBS.includes(town.name) || MEDICAL_TOURISM.includes(town.name)) {
        hasEnglishDocs = true;
        reason = 'English common + urban';
      } else {
        hasEnglishDocs = false;
        reason = 'English common but rural';
      }
      hasEnglishDocs ? yesCount++ : noCount++;
    }
    // Tourist/expat hubs - usually YES
    else if (TOURIST_HUBS.includes(town.name) || 
             (town.expat_community_size && ['large', 'medium'].includes(town.expat_community_size))) {
      hasEnglishDocs = true;
      reason = 'Tourist/expat hub';
      yesCount++;
    }
    // Medical tourism destinations - YES
    else if (MEDICAL_TOURISM.includes(town.name)) {
      hasEnglishDocs = true;
      reason = 'Medical tourism';
      yesCount++;
    }
    // Capital cities - often YES
    else if (town.name === town.country || town.population > 1000000) {
      hasEnglishDocs = true;
      reason = 'Capital/major city';
      yesCount++;
    }
    // High English proficiency areas
    else if (town.english_proficiency_level && ['high', 'very high'].includes(town.english_proficiency_level)) {
      hasEnglishDocs = true;
      reason = 'High English proficiency';
      yesCount++;
    }
    // European tourist areas
    else if (['Spain', 'Portugal', 'France', 'Italy', 'Greece', 'Croatia', 'Cyprus', 'Malta'].includes(town.country) &&
             (town.population > 100000 || town.geographic_features?.includes('coastal'))) {
      hasEnglishDocs = true;
      reason = 'European tourist area';
      yesCount++;
    }
    // Default by region
    else {
      // Latin America - mixed
      if (['Mexico', 'Costa Rica', 'Panama', 'Colombia', 'Ecuador', 'Chile', 'Argentina', 'Uruguay'].includes(town.country)) {
        hasEnglishDocs = town.population > 200000;
        reason = hasEnglishDocs ? 'Latin America major city' : 'Latin America smaller town';
      }
      // Asia - depends on development
      else if (['Thailand', 'Vietnam', 'Philippines', 'Malaysia', 'Cambodia', 'Laos'].includes(town.country)) {
        hasEnglishDocs = town.population > 100000 || town.geographic_features?.includes('island');
        reason = hasEnglishDocs ? 'Asian city/tourist area' : 'Asian rural area';
      }
      // Default - NO for smaller towns
      else {
        hasEnglishDocs = town.population > 500000;
        reason = hasEnglishDocs ? 'Large city default' : 'Small town default';
      }
      hasEnglishDocs ? yesCount++ : noCount++;
    }
    
    console.log(`${town.name}, ${town.country}: ${hasEnglishDocs ? 'YES' : 'NO'} (${reason})`);
    
    updates.push({
      id: town.id,
      english_speaking_doctors: hasEnglishDocs
    });
  });
  
  console.log(`\n📊 Summary: ${yesCount} YES, ${noCount} NO`);
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ english_speaking_doctors: update.english_speaking_doctors })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 English-speaking doctors update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('english_speaking_doctors')
    .is('english_speaking_doctors', null);
    
  console.log(`\n📊 Remaining towns without english_speaking_doctors: ${verification?.length || 0}`);
}

fillEnglishDoctors();