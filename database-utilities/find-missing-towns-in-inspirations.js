// Find towns referenced in regional_inspirations that don't exist in towns table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findMissingTowns() {
  console.log('\n🔍 FINDING MISSING TOWNS IN REGIONAL INSPIRATIONS\n');

  try {
    // Step 1: Get all regional inspirations
    const { data: inspirations, error: inspirationsError } = await supabase
      .from('regional_inspirations')
      .select('id, title, typical_town_examples');

    if (inspirationsError) throw inspirationsError;

    console.log(`Found ${inspirations.length} regional inspirations\n`);

    // Step 2: Get all town names from database
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('town_name');

    if (townsError) throw townsError;

    const existingTownNames = new Set(towns.map(t => t.town_name));
    console.log(`Found ${existingTownNames.size} towns in database\n`);

    // Step 3: Find missing towns
    const missing = [];
    const found = [];

    for (const inspiration of inspirations) {
      if (!inspiration.typical_town_examples || inspiration.typical_town_examples.length === 0) {
        continue;
      }

      for (const townName of inspiration.typical_town_examples) {
        if (!existingTownNames.has(townName)) {
          missing.push({
            inspiration: inspiration.title,
            townName: townName
          });
        } else {
          found.push({
            inspiration: inspiration.title,
            townName: townName
          });
        }
      }
    }

    // Step 4: Report results
    if (missing.length === 0) {
      console.log('✅ NO MISSING TOWNS! All featured towns exist in database.\n');
    } else {
      console.log(`❌ FOUND ${missing.length} MISSING TOWNS:\n`);

      // Group by inspiration
      const groupedMissing = {};
      missing.forEach(item => {
        if (!groupedMissing[item.inspiration]) {
          groupedMissing[item.inspiration] = [];
        }
        groupedMissing[item.inspiration].push(item.townName);
      });

      Object.entries(groupedMissing).forEach(([inspiration, towns]) => {
        console.log(`📍 "${inspiration}":`);
        towns.forEach(town => {
          console.log(`   ❌ ${town}`);
        });
        console.log('');
      });

      console.log('\n📊 SUMMARY:');
      console.log(`   Total featured towns: ${missing.length + found.length}`);
      console.log(`   ✅ Found in database: ${found.length}`);
      console.log(`   ❌ Missing from database: ${missing.length}`);
      console.log(`   Success rate: ${((found.length / (missing.length + found.length)) * 100).toFixed(1)}%\n`);

      console.log('\n🔧 TO FIX:');
      console.log('Option 1: Remove missing towns from regional_inspirations (edit in Region Manager)');
      console.log('Option 2: Add missing towns to database (Towns Manager → Add Town)');
      console.log('Option 3: Find similar towns and update the names\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

findMissingTowns();
