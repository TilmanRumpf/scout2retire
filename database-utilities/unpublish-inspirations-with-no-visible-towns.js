// Auto-unpublish regional inspirations that have no valid visible towns
// A valid visible town must:
// 1. Exist in database
// 2. Be published (is_published = true, or true by default if column doesn't exist)
// 3. Have a valid image (image_url_1 is not null/empty/'NULL')

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

async function unpublishInspirationsWithNoVisibleTowns() {
  console.log('\n🔍 CHECKING REGIONAL INSPIRATIONS FOR VISIBLE TOWNS\n');

  try {
    // Step 1: Get all valid visible towns (published + has image)
    let validTownNames = new Set();

    // Try with is_published column first
    const { data: publishedTowns, error: publishedError } = await supabase
      .from('towns')
      .select('town_name')
      .eq('is_published', true)
      .not('image_url_1', 'is', null)
      .not('image_url_1', 'eq', '')
      .not('image_url_1', 'ilike', 'NULL')
      .not('image_url_1', 'eq', 'null');

    if (publishedError) {
      // Column doesn't exist yet - fallback to all towns with images (default to published)
      console.log('⚠️  is_published column not found, treating all towns with images as published');
      const { data: townsWithImages, error: fallbackError } = await supabase
        .from('towns')
        .select('town_name')
        .not('image_url_1', 'is', null)
        .not('image_url_1', 'eq', '')
        .not('image_url_1', 'ilike', 'NULL')
        .not('image_url_1', 'eq', 'null');

      if (fallbackError) throw fallbackError;
      validTownNames = new Set(townsWithImages.map(t => t.town_name));
    } else {
      validTownNames = new Set(publishedTowns.map(t => t.town_name));
    }

    console.log(`✅ Found ${validTownNames.size} valid visible towns\n`);

    // Step 2: Get all regional inspirations
    const { data: inspirations, error: inspirationsError } = await supabase
      .from('regional_inspirations')
      .select('id, title, typical_town_examples, is_active');

    if (inspirationsError) throw inspirationsError;

    console.log(`📋 Checking ${inspirations.length} regional inspirations...\n`);

    // Step 3: Check each inspiration
    let unpublishedCount = 0;
    let alreadyUnpublishedCount = 0;

    for (const inspiration of inspirations) {
      const townExamples = inspiration.typical_town_examples || [];

      // Count how many towns are actually visible
      const visibleTowns = townExamples.filter(townName => validTownNames.has(townName));
      const invisibleTowns = townExamples.filter(townName => !validTownNames.has(townName));

      if (visibleTowns.length === 0 && townExamples.length > 0) {
        // Has towns listed, but NONE are visible
        if (inspiration.is_active) {
          console.log(`🔴 "${inspiration.title}"`);
          console.log(`   Total towns: ${townExamples.length}`);
          console.log(`   Visible: ${visibleTowns.length}`);
          console.log(`   Invisible: ${invisibleTowns.join(', ')}`);
          console.log(`   ⚠️  UNPUBLISHING (no visible towns)`);

          const { error: updateError } = await supabase
            .from('regional_inspirations')
            .update({ is_active: false })
            .eq('id', inspiration.id);

          if (updateError) {
            console.error(`   ❌ Failed to unpublish: ${updateError.message}`);
          } else {
            console.log(`   ✅ Unpublished successfully\n`);
            unpublishedCount++;
          }
        } else {
          console.log(`🔵 "${inspiration.title}" - already unpublished (${invisibleTowns.length} invisible towns)\n`);
          alreadyUnpublishedCount++;
        }
      } else if (visibleTowns.length > 0) {
        console.log(`🟢 "${inspiration.title}" - OK (${visibleTowns.length}/${townExamples.length} visible)\n`);
      }
    }

    // Step 4: Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Valid visible towns in database: ${validTownNames.size}`);
    console.log(`   Inspirations auto-unpublished: ${unpublishedCount}`);
    console.log(`   Already unpublished: ${alreadyUnpublishedCount}`);
    console.log(`   ${unpublishedCount === 0 ? '✅ No changes needed!' : '✅ Auto-unpublish complete!'}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

unpublishInspirationsWithNoVisibleTowns();
