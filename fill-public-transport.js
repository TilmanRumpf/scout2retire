import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillPublicTransport() {
  console.log('🚌 Filling public transport quality scores...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Cities known for excellent public transport
  const EXCELLENT_TRANSIT = {
    // Europe
    'Vienna': 10, 'Zurich': 10, 'Prague': 9, 'Berlin': 9, 'Munich': 9,
    'Amsterdam': 9, 'Copenhagen': 9, 'Stockholm': 9, 'Oslo': 9,
    'Paris': 9, 'London': 9, 'Barcelona': 9, 'Madrid': 9, 'Milan': 8,
    'Rome': 7, 'Brussels': 8, 'Budapest': 8, 'Warsaw': 8,
    
    // Asia
    'Singapore': 10, 'Tokyo': 10, 'Seoul': 10, 'Hong Kong': 10,
    'Taipei': 9, 'Bangkok': 8, 'Kuala Lumpur': 7, 'Shanghai': 9,
    
    // Americas
    'New York': 8, 'San Francisco': 7, 'Montreal': 8, 'Toronto': 8,
    'Mexico City': 7, 'Buenos Aires': 7, 'Santiago': 7, 'São Paulo': 7,
    
    // Oceania
    'Sydney': 8, 'Melbourne': 8, 'Auckland': 6, 'Wellington': 6
  };
  
  // Country transport quality baselines
  const COUNTRY_BASELINES = {
    // Excellent public transport countries
    'Switzerland': { large: 10, medium: 8, small: 6, tiny: 4 },
    'Netherlands': { large: 9, medium: 8, small: 6, tiny: 4 },
    'Germany': { large: 9, medium: 7, small: 5, tiny: 3 },
    'Austria': { large: 9, medium: 7, small: 5, tiny: 3 },
    'Belgium': { large: 8, medium: 7, small: 5, tiny: 3 },
    'Czech Republic': { large: 8, medium: 6, small: 4, tiny: 2 },
    
    // Good public transport
    'France': { large: 8, medium: 6, small: 4, tiny: 2 },
    'Spain': { large: 8, medium: 6, small: 4, tiny: 2 },
    'Portugal': { large: 7, medium: 5, small: 3, tiny: 2 },
    'Italy': { large: 7, medium: 5, small: 3, tiny: 2 },
    'United Kingdom': { large: 8, medium: 6, small: 4, tiny: 2 },
    
    // Asian countries
    'Singapore': { large: 10, medium: 10, small: 9, tiny: 8 },
    'Thailand': { large: 7, medium: 5, small: 3, tiny: 2 },
    'Malaysia': { large: 7, medium: 5, small: 3, tiny: 2 },
    'Vietnam': { large: 6, medium: 4, small: 2, tiny: 1 },
    'Philippines': { large: 5, medium: 3, small: 2, tiny: 1 },
    
    // Car-dependent countries
    'United States': { large: 5, medium: 3, small: 2, tiny: 1 },
    'Canada': { large: 6, medium: 4, small: 2, tiny: 1 },
    'Australia': { large: 7, medium: 5, small: 3, tiny: 1 },
    'New Zealand': { large: 6, medium: 4, small: 2, tiny: 1 },
    
    // Latin America
    'Mexico': { large: 6, medium: 4, small: 2, tiny: 1 },
    'Colombia': { large: 6, medium: 4, small: 2, tiny: 1 },
    'Ecuador': { large: 5, medium: 3, small: 2, tiny: 1 },
    'Panama': { large: 5, medium: 3, small: 2, tiny: 1 },
    'Costa Rica': { large: 5, medium: 3, small: 2, tiny: 1 },
    
    // Default
    'default': { large: 5, medium: 3, small: 2, tiny: 1 }
  };
  
  const missingData = towns.filter(t => t.public_transport_quality === null);
  console.log(`🎯 Found ${missingData.length} towns missing public transport quality\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    let score;
    let method;
    
    // Check if it's a known city
    if (EXCELLENT_TRANSIT[town.name]) {
      score = EXCELLENT_TRANSIT[town.name];
      method = 'known transit city';
    }
    // Use country baseline + modifiers
    else {
      const baseline = COUNTRY_BASELINES[town.country] || COUNTRY_BASELINES.default;
      
      // Determine size category
      let sizeCategory;
      if (town.population > 500000) sizeCategory = 'large';
      else if (town.population > 100000) sizeCategory = 'medium';
      else if (town.population > 50000) sizeCategory = 'small';
      else sizeCategory = 'tiny';
      
      score = baseline[sizeCategory];
      
      // Modifiers
      if (town.train_station) score += 1;
      if (town.has_uber) score += 0.5;
      if (town.requires_car) score -= 2;
      if (!town.has_public_transit) score = Math.min(score, 2);
      
      // Tourist areas get a boost
      if (town.geographic_features?.includes('island')) score -= 1;
      if (town.geographic_features?.includes('coastal') && town.population > 50000) score += 0.5;
      
      // Capital cities get a boost
      if (town.name.includes(town.country) || town.name === 'Capital') score += 1;
      
      // Ensure valid range
      score = Math.round(Math.max(1, Math.min(10, score)));
      
      method = `${sizeCategory} ${town.country} city`;
    }
    
    console.log(`${town.name}, ${town.country}: ${score}/10 (${method})`);
    
    updates.push({
      id: town.id,
      public_transport_quality: score
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
        .update({ public_transport_quality: update.public_transport_quality })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Public transport quality update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('public_transport_quality')
    .is('public_transport_quality', null);
    
  console.log(`\n📊 Remaining towns without public transport quality: ${verification?.length || 0}`);
}

fillPublicTransport();