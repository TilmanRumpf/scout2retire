import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Clean country names
function normalizeCountryName(country) {
  if (!country) return '';
  
  let normalized = country.replace(/\s*\([^)]*\)\s*/g, '').trim();
  
  const replacements = {
    'USA': 'United States',
    'UK': 'United Kingdom',
    '&': 'and',
    'Fed.States': 'Federal States',
    'St.': 'Saint'
  };
  
  Object.entries(replacements).forEach(([from, to]) => {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  });
  
  return normalized;
}

// Read the missing towns
const missingTowns = JSON.parse(fs.readFileSync('missing_towns.json', 'utf8'));

console.log(`\n=== Town Import Script ===`);
console.log(`Found ${missingTowns.length} towns to import\n`);

async function importTowns() {
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  // Process in batches of 10
  const batchSize = 10;
  
  for (let i = 0; i < missingTowns.length; i += batchSize) {
    const batch = missingTowns.slice(i, i + batchSize);
    
    for (const town of batch) {
      const normalizedCountry = normalizeCountryName(town.country);
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('towns')
        .select('id')
        .eq('name', town.name)
        .eq('country', normalizedCountry)
        .single();
        
      if (existing) {
        console.log(`⏭️  Skipping ${town.name}, ${normalizedCountry} (already exists)`);
        skipped++;
        continue;
      }
      
      // Insert the town
      const townData = {
        name: town.name,
        country: normalizedCountry,
        region: town.region || town.continent || null,
        regions: [town.continent, town.category].filter(Boolean),
        // Add basic descriptions based on category
        climate_description: town.category?.includes('Mediterranean') ? 'Mediterranean climate' :
                           town.category?.includes('Caribbean') ? 'Tropical Caribbean climate' :
                           town.category?.includes('Asia') ? 'Varied Asian climate' :
                           null
      };
      
      const { error } = await supabase
        .from('towns')
        .insert(townData);
        
      if (error) {
        console.error(`❌ Error importing ${town.name}, ${normalizedCountry}:`, error.message);
        errors++;
      } else {
        console.log(`✅ Imported ${town.name}, ${normalizedCountry}`);
        imported++;
      }
    }
    
    // Progress update
    const progress = Math.round(((i + batch.length) / missingTowns.length) * 100);
    console.log(`\nProgress: ${progress}% | Imported: ${imported} | Skipped: ${skipped} | Errors: ${errors}\n`);
  }
  
  // Final summary
  console.log('\n=== Import Complete ===');
  console.log(`Total processed: ${missingTowns.length}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);
  
  // Get final count
  const { count } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });
    
  console.log(`\n✅ Final town count in database: ${count}`);
}

// Run import
importTowns().catch(console.error);