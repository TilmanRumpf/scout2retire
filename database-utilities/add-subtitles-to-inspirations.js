import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Evocative, region-specific subtitles (max 5 words each)
const subtitles = {
  'French Riviera dreaming?': 'Mediterranean glamour meets Alpine charm',
  'Costa Rica pura vida?': 'Rainforest paradise, Pacific Ocean bliss',
  'Croatian coastline calling?': 'Adriatic azure, ancient Roman elegance',
  'Malaysian melting pot?': 'Tropical fusion, English-speaking modernity',
  'Mexican beach life?': 'Caribbean sun, colonial culture blend',
  'Portuguese lifestyle ': 'Atlantic islands, eternal spring weather',
  'Thai temple towns?': 'Buddhist serenity, tropical street food',
  'Ecuador colonial charm?': 'Andean peaks, Spanish colonial heritage',
  'Colombian renaissance?': 'Eternal spring, vibrant mountain cities',
  'Greek island paradise?': 'Aegean blue, whitewashed village dreams',
  'Dutch waterways and cycling?': 'Canal towns, bicycle-friendly flat landscapes',
  'Turkish coastal charm?': 'East meets West, Mediterranean sunshine',
  'Harbor towns and seafood?': 'Atlantic port wine, riverside terracotta',
  'Authentic Spanish living?': 'Plaza life, siesta culture rhythm',
  'Swiss alpine villages?': 'Pristine mountain peaks, clockwork precision',
  'Italian dolce vita?': 'Tuscan hills, vineyard-covered golden valleys',
  'Panama mountain escape?': 'Coffee highlands, spring-like year-round climate'
};

async function addSubtitles() {
  try {
    console.log('🔍 Fetching all regional inspirations...\n');

    const { data: inspirations, error: fetchError } = await supabase
      .from('regional_inspirations')
      .select('id, title, region_name')
      .eq('is_active', true)
      .order('display_order');

    if (fetchError) {
      console.error('❌ Error fetching inspirations:', fetchError);
      return;
    }

    console.log(`📊 Found ${inspirations.length} active inspirations\n`);

    // First, add the subtitle column if it doesn't exist
    console.log('🔧 Adding subtitle column to regional_inspirations table...\n');

    // Note: This will fail if column already exists, which is fine
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE regional_inspirations ADD COLUMN IF NOT EXISTS subtitle TEXT;'
    });

    if (alterError && !alterError.message.includes('already exists')) {
      console.log('⚠️  Note: Could not add column via RPC (may need manual SQL)');
      console.log('   Run this SQL manually if needed:');
      console.log('   ALTER TABLE regional_inspirations ADD COLUMN IF NOT EXISTS subtitle TEXT;\n');
    }

    // Update subtitles
    let updated = 0;
    let notFound = 0;

    for (const inspiration of inspirations) {
      const subtitle = subtitles[inspiration.title];

      if (subtitle) {
        console.log(`✏️  Updating "${inspiration.title}"`);
        console.log(`   Region: ${inspiration.region_name}`);
        console.log(`   Subtitle: "${subtitle}"\n`);

        const { error: updateError } = await supabase
          .from('regional_inspirations')
          .update({ subtitle })
          .eq('id', inspiration.id);

        if (updateError) {
          console.error(`   ❌ Error updating:`, updateError.message);
        } else {
          updated++;
        }
      } else {
        console.log(`⚠️  No subtitle defined for: "${inspiration.title}"`);
        console.log(`   Region: ${inspiration.region_name}\n`);
        notFound++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Updated: ${updated} inspirations`);
    console.log(`⚠️  Missing subtitles: ${notFound} inspirations`);
    console.log('='.repeat(60));

    if (notFound > 0) {
      console.log('\n📝 Please add subtitles for the missing inspirations above');
    }

  } catch (err) {
    console.error('❌ Fatal error:', err);
  }
}

// Run the script
addSubtitles();
