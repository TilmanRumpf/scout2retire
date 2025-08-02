import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillWalkability() {
  console.log('🚶 Filling walkability scores...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Known walkable cities
  const WALKABLE_CITIES = {
    // European cities - generally very walkable
    'Venice': 10, 'Florence': 9, 'Amsterdam': 9, 'Copenhagen': 9,
    'Barcelona': 9, 'Paris': 9, 'Prague': 9, 'Vienna': 9,
    'Lisbon': 8, 'Porto': 8, 'Budapest': 8, 'Krakow': 8,
    'Edinburgh': 8, 'Dublin': 8, 'Brussels': 8, 'Munich': 8,
    
    // Compact Asian cities
    'Singapore': 8, 'Hong Kong': 8, 'Tokyo': 8, 'Kyoto': 9,
    'Seoul': 7, 'Taipei': 7, 'Georgetown': 8, 'Hoi An': 9,
    
    // Notable walkable cities elsewhere
    'San Francisco': 8, 'Boston': 8, 'New York': 8, 'Montreal': 8,
    'Vancouver': 8, 'Portland': 7, 'Seattle': 7, 'Chicago': 7,
    'Buenos Aires': 7, 'Montevideo': 7, 'Cuenca': 8, 'Cartagena': 8,
    
    // Beach towns often walkable
    'Taormina': 9, 'Santorini': 8, 'Dubrovnik': 9, 'Split': 8,
    'San Sebastian': 8, 'Nice': 8, 'Cannes': 8, 'Brighton': 7
  };
  
  // Walkability patterns by region and type
  const WALKABILITY_PATTERNS = {
    // Europe - generally good walkability
    'Europe': {
      historic: 9,    // Old towns, historic centers
      large: 7,       // Major cities
      medium: 6,      // Mid-size cities
      small: 7,       // Small towns often compact
      coastal: 7,     // Beach towns
      rural: 4        // Rural areas
    },
    // Americas - more car-dependent
    'Americas': {
      historic: 8,    // Colonial centers
      large: 5,       // Sprawling cities
      medium: 4,      // Suburban sprawl
      small: 5,       // Main Street towns
      coastal: 6,     // Beach towns
      rural: 2        // Very car-dependent
    },
    // Asia - mixed
    'Asia': {
      historic: 8,    // Old quarters
      large: 6,       // Dense but challenging
      medium: 5,      // Variable
      small: 6,       // Often walkable centers
      coastal: 6,     // Resort towns
      rural: 3        // Limited infrastructure
    },
    // Default
    'default': {
      historic: 7,
      large: 5,
      medium: 4,
      small: 5,
      coastal: 6,
      rural: 3
    }
  };
  
  const missingData = towns.filter(t => t.walkability === null);
  console.log(`🎯 Found ${missingData.length} towns missing walkability scores\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    let score;
    let method;
    
    // Check known walkable cities
    if (WALKABLE_CITIES[town.name]) {
      score = WALKABLE_CITIES[town.name];
      method = 'known walkable city';
    }
    else {
      // Determine region
      let region = 'default';
      if (['France', 'Spain', 'Portugal', 'Italy', 'Germany', 'Netherlands', 'Belgium', 
           'Austria', 'Switzerland', 'Greece', 'Croatia', 'Czech Republic', 'Poland',
           'United Kingdom', 'Ireland', 'Malta', 'Cyprus'].includes(town.country)) {
        region = 'Europe';
      } else if (['United States', 'Canada', 'Mexico', 'Colombia', 'Ecuador', 'Peru',
                  'Chile', 'Argentina', 'Uruguay', 'Brazil', 'Costa Rica', 'Panama'].includes(town.country)) {
        region = 'Americas';
      } else if (['Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Philippines', 'Cambodia',
                  'Laos', 'India', 'Nepal', 'Sri Lanka', 'Indonesia'].includes(town.country)) {
        region = 'Asia';
      }
      
      const patterns = WALKABILITY_PATTERNS[region];
      
      // Determine town type
      let townType = 'medium';
      if (town.population > 1000000) townType = 'large';
      else if (town.population < 50000) townType = 'small';
      if (town.population < 10000) townType = 'rural';
      if (town.geographic_features?.includes('Coastal')) townType = 'coastal';
      
      // Historic towns are more walkable
      const historicTowns = ['Antigua', 'Cartagena', 'Cusco', 'Oaxaca', 'San Miguel de Allende',
                            'Colonia del Sacramento', 'Luang Prabang', 'George Town', 'Hoi An',
                            'Galle', 'Stone Town', 'Valletta', 'Rhodes', 'Chania'];
      if (historicTowns.includes(town.name)) townType = 'historic';
      
      score = patterns[townType];
      
      // Modifiers
      if (town.public_transport_quality >= 7) score += 1;
      if (town.requires_car) score -= 2;
      if (town.geographic_features?.includes('Mountain')) score -= 1;
      if (region === 'Europe' && town.population < 100000) score += 1; // European small towns often walkable
      
      // Ensure valid range
      score = Math.round(Math.max(1, Math.min(10, score)));
      
      method = `${region} ${townType}`;
    }
    
    console.log(`${town.name}, ${town.country}: ${score}/10 (${method})`);
    
    updates.push({
      id: town.id,
      walkability: score
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
        .update({ walkability: update.walkability })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Walkability update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('walkability')
    .is('walkability', null);
    
  console.log(`\n📊 Remaining towns without walkability: ${verification?.length || 0}`);
}

fillWalkability();