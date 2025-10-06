import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function runMigration() {
  console.log('🚀 Running subtitle migration...\n');

  const updates = [
    { title: 'French Riviera dreaming?', subtitle: 'Mediterranean glamour meets Alpine charm' },
    { title: 'Costa Rica pura vida?', subtitle: 'Rainforest paradise, Pacific Ocean bliss' },
    { title: 'Croatian coastline calling?', subtitle: 'Adriatic azure, ancient Roman elegance' },
    { title: 'Malaysian melting pot?', subtitle: 'Tropical fusion, English-speaking modernity' },
    { title: 'Mexican beach life?', subtitle: 'Caribbean sun, colonial culture blend' },
    { title: 'Portuguese lifestyle ', subtitle: 'Atlantic islands, eternal spring weather' },
    { title: 'Thai temple towns?', subtitle: 'Buddhist serenity, tropical street food' },
    { title: 'Ecuador colonial charm?', subtitle: 'Andean peaks, Spanish colonial heritage' },
    { title: 'Colombian renaissance?', subtitle: 'Eternal spring, vibrant mountain cities' },
    { title: 'Greek island paradise?', subtitle: 'Aegean blue, whitewashed village dreams' },
    { title: 'Dutch waterways and cycling?', subtitle: 'Canal towns, bicycle-friendly flat landscapes' },
    { title: 'Turkish coastal charm?', subtitle: 'East meets West, Mediterranean sunshine' },
    { title: 'Harbor towns and seafood?', subtitle: 'Atlantic port wine, riverside terracotta' },
    { title: 'Authentic Spanish living?', subtitle: 'Plaza life, siesta culture rhythm' },
    { title: 'Swiss alpine villages?', subtitle: 'Pristine mountain peaks, clockwork precision' },
    { title: 'Italian dolce vita?', subtitle: 'Tuscan hills, vineyard-covered golden valleys' },
    { title: 'Panama mountain escape?', subtitle: 'Coffee highlands, spring-like year-round climate' }
  ];

  console.log(`📊 Updating ${updates.length} inspirations...\n`);

  let success = 0;
  let failed = 0;

  for (const item of updates) {
    const { error } = await supabase
      .from('regional_inspirations')
      .update({ subtitle: item.subtitle })
      .eq('title', item.title);

    if (error) {
      console.log(`❌ Failed: ${item.title}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    } else {
      console.log(`✅ Updated: ${item.title}`);
      success++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Success: ${success} / ${updates.length}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60));

  // Verify
  const { data } = await supabase
    .from('regional_inspirations')
    .select('title, subtitle')
    .limit(3);

  if (data) {
    console.log('\n📋 Sample results:');
    data.forEach((item, i) => {
      console.log(`${i + 1}. ${item.title}: "${item.subtitle || 'NO SUBTITLE'}"`);
    });
  }
}

runMigration();
