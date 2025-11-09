// Remove missing towns from regional_inspirations
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

async function cleanRegionalInspirations() {
  console.log('\n🧹 CLEANING REGIONAL INSPIRATIONS\n');

  try {
    // Step 1: Get all town names that actually exist
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('town_name');

    if (townsError) throw townsError;

    const existingTownNames = new Set(towns.map(t => t.town_name));
    console.log(`✅ Found ${existingTownNames.size} valid towns in database\n`);

    // Step 2: Get all regional inspirations
    const { data: inspirations, error: inspirationsError } = await supabase
      .from('regional_inspirations')
      .select('id, title, typical_town_examples');

    if (inspirationsError) throw inspirationsError;

    console.log(`📋 Checking ${inspirations.length} regional inspirations...\n`);

    // Step 3: Clean each inspiration
    let updatedCount = 0;
    let removedCount = 0;

    for (const inspiration of inspirations) {
      if (!inspiration.typical_town_examples || inspiration.typical_town_examples.length === 0) {
        continue;
      }

      const before = inspiration.typical_town_examples;
      const after = before.filter(townName => existingTownNames.has(townName));
      const removed = before.filter(townName => !existingTownNames.has(townName));

      if (removed.length > 0) {
        console.log(`🔧 "${inspiration.title}"`);
        console.log(`   Before: ${before.length} towns`);
        console.log(`   After:  ${after.length} towns`);
        console.log(`   Removed: ${removed.join(', ')}`);

        // If no towns left, unpublish the inspiration
        const updates = { typical_town_examples: after };
        if (after.length === 0) {
          updates.is_active = false;
          console.log(`   ⚠️  No towns left - UNPUBLISHING inspiration`);
        }

        // Update in database
        const { error: updateError } = await supabase
          .from('regional_inspirations')
          .update(updates)
          .eq('id', inspiration.id);

        if (updateError) {
          console.error(`   ❌ Failed to update: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated successfully\n`);
          updatedCount++;
          removedCount += removed.length;
        }
      }
    }

    // Step 4: Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Inspirations updated: ${updatedCount}`);
    console.log(`   Towns removed: ${removedCount}`);
    console.log(`   ${removedCount === 0 ? '✅ All clean!' : '✅ Cleanup complete!'}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

cleanRegionalInspirations();
