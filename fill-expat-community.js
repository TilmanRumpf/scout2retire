import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillExpatCommunity() {
  console.log('🌍 Filling expat community size data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Known expat hubs
  const LARGE_EXPAT_HUBS = [
    // Asia
    'Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Hua Hin',
    'Singapore', 'Kuala Lumpur', 'Penang', 'Bali', 'Ubud',
    'Ho Chi Minh City', 'Da Nang', 'Nha Trang', 'Vung Tau',
    'Manila', 'Cebu City', 'Subic Bay', 'Dubai', 'Abu Dhabi',
    
    // Europe
    'Barcelona', 'Madrid', 'Valencia', 'Malaga', 'Alicante', 'Marbella',
    'Lisbon', 'Porto', 'Cascais', 'Algarve', 'Nice', 'Paris',
    'Berlin', 'Munich', 'Amsterdam', 'Prague', 'Budapest',
    
    // Americas
    'Playa del Carmen', 'Puerto Vallarta', 'San Miguel de Allende',
    'Lake Chapala', 'Merida', 'Mexico City', 'Panama City', 'Boquete',
    'San Jose', 'Tamarindo', 'Medellin', 'Cuenca', 'Buenos Aires'
  ];
  
  const MEDIUM_EXPAT_COMMUNITIES = [
    // Secondary cities with expats
    'Chiang Rai', 'Koh Samui', 'Udon Thani', 'Georgetown',
    'Hoi An', 'Kampot', 'Siem Reap', 'Luang Prabang',
    'Canggu', 'Seminyak', 'Tel Aviv', 'Jerusalem',
    
    // Europe
    'Seville', 'Granada', 'Bilbao', 'Funchal', 'Faro',
    'Florence', 'Rome', 'Milan', 'Vienna', 'Zurich',
    'Copenhagen', 'Stockholm', 'Dublin', 'Edinburgh',
    
    // Americas
    'Oaxaca', 'Mazatlan', 'La Paz', 'Ensenada', 'Ajijic',
    'Coronado', 'Bocas del Toro', 'Montevideo', 'Florianopolis'
  ];
  
  // Patterns by country
  const COUNTRY_PATTERNS = {
    // High expat countries
    'Mexico': { capital: 'large', coastal: 'medium', other: 'small' },
    'Costa Rica': { capital: 'large', coastal: 'medium', other: 'small' },
    'Panama': { capital: 'large', coastal: 'medium', other: 'small' },
    'Ecuador': { capital: 'medium', coastal: 'small', other: 'small' },
    'Thailand': { capital: 'large', coastal: 'medium', other: 'small' },
    'Vietnam': { capital: 'large', coastal: 'medium', other: 'small' },
    'Malaysia': { capital: 'large', coastal: 'medium', other: 'small' },
    'Philippines': { capital: 'medium', coastal: 'small', other: 'small' },
    'Portugal': { capital: 'large', coastal: 'medium', other: 'small' },
    'Spain': { capital: 'large', coastal: 'medium', other: 'small' },
    
    // Medium expat countries
    'France': { capital: 'large', coastal: 'small', other: 'small' },
    'Italy': { capital: 'medium', coastal: 'small', other: 'small' },
    'Germany': { capital: 'medium', coastal: 'small', other: 'small' },
    'Colombia': { capital: 'medium', coastal: 'small', other: 'none' },
    'Uruguay': { capital: 'medium', coastal: 'small', other: 'none' },
    
    // Low expat countries
    'United States': { capital: 'small', coastal: 'small', other: 'none' },
    'Canada': { capital: 'small', coastal: 'small', other: 'none' },
    'Australia': { capital: 'small', coastal: 'small', other: 'none' },
    'New Zealand': { capital: 'small', coastal: 'small', other: 'none' },
    
    // Default
    'default': { capital: 'small', coastal: 'small', other: 'none' }
  };
  
  const missingData = towns.filter(t => !t.expat_community_size);
  console.log(`🎯 Found ${missingData.length} towns missing expat community size\n`);
  
  const updates = [];
  const counts = { large: 0, medium: 0, small: 0, none: 0 };
  
  missingData.forEach(town => {
    let size;
    let reason;
    
    // Check known hubs first
    if (LARGE_EXPAT_HUBS.includes(town.name)) {
      size = 'large';
      reason = 'known major hub';
    }
    else if (MEDIUM_EXPAT_COMMUNITIES.includes(town.name)) {
      size = 'medium';
      reason = 'known expat destination';
    }
    else {
      // Use country patterns
      const pattern = COUNTRY_PATTERNS[town.country] || COUNTRY_PATTERNS.default;
      
      // Determine town type
      let townType = 'other';
      if (town.name === town.country || town.name.includes('City') || 
          town.population > 1000000) {
        townType = 'capital';
      }
      else if (town.geographic_features?.includes('coastal') || 
               town.geographic_features?.includes('island')) {
        townType = 'coastal';
      }
      
      size = pattern[townType];
      reason = `${town.country} ${townType}`;
      
      // Special adjustments
      if (town.english_speaking_doctors && size === 'none') {
        size = 'small'; // If English doctors available, likely some expats
      }
      if (town.retirement_visa_available && size === 'none') {
        size = 'small'; // Retirement visa countries attract expats
      }
    }
    
    console.log(`${town.name}, ${town.country}: ${size} (${reason})`);
    counts[size]++;
    
    updates.push({
      id: town.id,
      expat_community_size: size
    });
  });
  
  console.log(`\n📊 Summary: ${counts.large} large, ${counts.medium} medium, ${counts.small} small, ${counts.none} none`);
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ expat_community_size: update.expat_community_size })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Expat community size update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('expat_community_size')
    .is('expat_community_size', null);
    
  console.log(`\n📊 Remaining towns without expat community size: ${verification?.length || 0}`);
}

fillExpatCommunity();