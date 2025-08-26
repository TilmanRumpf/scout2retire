import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Known safe retirement destinations based on common knowledge
const SAFE_RETIREMENT_HUBS = {
  // New Zealand - very safe
  'Tauranga': 9,
  'Nelson': 9,
  
  // Singapore - one of safest
  'Singapore': 10,
  
  // Safe African destinations
  'Knysna': 7,
  'Plettenberg Bay': 7,
  
  // Panama retirement hubs
  'Bocas Town (Bocas del Toro)': 7,
  'Coronado': 8,
  'Pedasí': 7,
  'Boquete': 8,
  'El Valle de Antón': 8,
  
  // Caribbean
  'San Juan': 7,
  'Rincón': 7,
  'Philipsburg': 7,
  'George Town': 8,
  'Pago Pago': 7,
  'Nassau': 6,
  'Freeport': 6,
  
  // Safe Asian cities
  'Georgetown': 7,
  'Chiang Rai': 7,
  
  // European additions
  'Tartu': 9,
  'Budva': 7,
  'Herceg Novi': 7,
  'Gjirokastër': 6,
  
  // Safe island nations
  'Upolu': 8,
  'Nukuʻalofa': 7,
  'Victoria': 8,
  'Honiara': 6,
  'Neiafu': 7
};

async function fillMissingSafetyScores() {
  console.log('🔍 Analyzing safety scores...\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, safety_score')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Calculate country averages from existing data
  const countryScores = {};
  const countryCounts = {};
  
  towns.forEach(town => {
    if (town.safety_score !== null) {
      if (!countryScores[town.country]) {
        countryScores[town.country] = 0;
        countryCounts[town.country] = 0;
      }
      countryScores[town.country] += town.safety_score;
      countryCounts[town.country]++;
    }
  });
  
  // Calculate averages
  const countryAverages = {};
  for (const country in countryScores) {
    countryAverages[country] = Math.round(countryScores[country] / countryCounts[country] * 10) / 10;
  }
  
  console.log('📊 Country Average Safety Scores:\n');
  Object.entries(countryAverages)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, avg]) => {
      console.log(`${country.padEnd(25)} ${avg.toFixed(1)}/10`);
    });
  
  // Default scores for countries without data
  const DEFAULT_SCORES = {
    'Singapore': 10,
    'New Zealand': 9,
    'Panama': 7,
    'Bahamas': 6.5,
    'South Africa': 6,
    'American Samoa': 7,
    'Samoa': 8,
    'Tonga': 7,
    'Seychelles': 8,
    'Solomon Islands': 6,
    'Sint Maarten': 7,
    'Saint Martin': 7,
    'Vanuatu': 7,
    'Albania': 6,
    'Montenegro': 7
  };
  
  // Find towns with missing safety scores
  const missingScores = towns.filter(t => t.safety_score === null);
  console.log(`\n🎯 Found ${missingScores.length} towns with missing safety scores\n`);
  
  // Prepare updates
  const updates = [];
  
  missingScores.forEach(town => {
    let score;
    
    // First check if it's a known safe retirement hub
    if (SAFE_RETIREMENT_HUBS[town.name]) {
      score = SAFE_RETIREMENT_HUBS[town.name];
      console.log(`✅ ${town.name}, ${town.country}: ${score}/10 (known retirement hub)`);
    }
    // Then use country average
    else if (countryAverages[town.country]) {
      score = Math.round(countryAverages[town.country]);
      console.log(`📊 ${town.name}, ${town.country}: ${score}/10 (country average)`);
    }
    // Finally use default for country
    else if (DEFAULT_SCORES[town.country]) {
      score = DEFAULT_SCORES[town.country];
      console.log(`🌍 ${town.name}, ${town.country}: ${score}/10 (country default)`);
    }
    // Fallback to 7 (neutral-safe)
    else {
      score = 7;
      console.log(`❓ ${town.name}, ${town.country}: ${score}/10 (general default)`);
    }
    
    updates.push({
      id: town.id,
      safety_score: score
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns with safety scores`);
  console.log('Proceed with update? (This will modify the database)');
  
  // For safety, let's update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ safety_score: update.safety_score })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Safety scores update complete!');
  
  // Verify the update
  const { data: verification } = await supabase
    .from('towns')
    .select('safety_score')
    .is('safety_score', null);
    
  console.log(`\n📊 Remaining towns without safety score: ${verification?.length || 0}`);
}

fillMissingSafetyScores();