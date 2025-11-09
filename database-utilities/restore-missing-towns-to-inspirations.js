// Restore the 43 missing towns back to regional_inspirations
// These should stay so admins can click them and be prompted to create them
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

// The 43 missing towns that were removed, organized by inspiration
const TOWNS_TO_RESTORE = {
  'Swiss alpine villages?': ['Zurich', 'Geneva', 'Lucerne', 'Interlaken', 'Zermatt'],
  'Mexican beach life?': ['Cancun', 'Tulum', 'Cozumel'],
  'Spanish culture & charm?': ['Seville', 'Madrid'],
  'Colombian mountain cities?': ['Cali', 'Cartagena', 'Barranquilla', 'Santa Marta'],
  'Dutch canals & culture?': ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague'],
  'Portuguese coastal living?': ['Cascais', 'Tavira'],
  'French Riviera sunshine?': ['Cannes', 'Antibes'],
  'Italian lakes & mountains?': ['Bergamo', 'Brescia'],
  'Croatian coast?': ['Split', 'Dubrovnik'],
  'Turkish coastal towns?': ['Antalya', 'Fethiye'],
  'Greek islands?': ['Mykonos', 'Santorini'],
  'Costa Rican beaches?': ['Tamarindo', 'Jaco'],
  'Ecuadorian highlands?': ['Cuenca', 'Loja'],
  'Peruvian history?': ['Cusco', 'Arequipa'],
  'Chilean coastal cities?': ['Valparaiso', 'La Serena']
};

async function restoreMissingTowns() {
  console.log('\n🔄 RESTORING MISSING TOWNS TO REGIONAL INSPIRATIONS\n');

  try {
    // Get all regional inspirations
    const { data: inspirations, error: inspirationsError } = await supabase
      .from('regional_inspirations')
      .select('id, title, typical_town_examples, is_active');

    if (inspirationsError) throw inspirationsError;

    console.log(`📋 Found ${inspirations.length} regional inspirations\n`);

    let restoredCount = 0;
    let reactivatedCount = 0;

    for (const [inspirationTitle, townsToAdd] of Object.entries(TOWNS_TO_RESTORE)) {
      const inspiration = inspirations.find(i => i.title === inspirationTitle);

      if (!inspiration) {
        console.log(`⚠️  Inspiration "${inspirationTitle}" not found - skipping`);
        continue;
      }

      const currentTowns = inspiration.typical_town_examples || [];
      const newTowns = [...new Set([...currentTowns, ...townsToAdd])]; // Merge and dedupe

      if (newTowns.length > currentTowns.length) {
        const added = newTowns.filter(t => !currentTowns.includes(t));

        console.log(`🔧 "${inspirationTitle}"`);
        console.log(`   Before: ${currentTowns.length} towns`);
        console.log(`   After:  ${newTowns.length} towns`);
        console.log(`   Added: ${added.join(', ')}`);

        const updates = { typical_town_examples: newTowns };

        // Reactivate if it was unpublished and now has towns
        if (!inspiration.is_active && newTowns.length > 0) {
          updates.is_active = true;
          console.log(`   ✅ REACTIVATING inspiration (now has ${newTowns.length} towns)`);
          reactivatedCount++;
        }

        // Update in database
        const { error: updateError } = await supabase
          .from('regional_inspirations')
          .update(updates)
          .eq('id', inspiration.id);

        if (updateError) {
          console.error(`   ❌ Failed to update: ${updateError.message}`);
        } else {
          console.log(`   ✅ Restored successfully\n`);
          restoredCount += added.length;
        }
      } else {
        console.log(`✅ "${inspirationTitle}" - already has all towns\n`);
      }
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Towns restored: ${restoredCount}`);
    console.log(`   Inspirations reactivated: ${reactivatedCount}`);
    console.log(`   ✅ Restoration complete!\n`);
    console.log('Now admins can click these towns and be prompted to create them in the database.\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

restoreMissingTowns();
