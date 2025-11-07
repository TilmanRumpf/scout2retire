import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs'
);

console.log('Checking town visibility status...\n');

// Total towns with photos
const { count: totalWithPhotos } = await supabase
  .from('towns')
  .select('*', { count: 'exact', head: true })
  .not('image_url_1', 'is', null)
  .not('image_url_1', 'eq', '');

console.log(`📸 Total towns WITH photos: ${totalWithPhotos}`);

// Towns with photos AND quality_of_life (PUBLIC)
const { count: publicTowns } = await supabase
  .from('towns')
  .select('*', { count: 'exact', head: true })
  .not('image_url_1', 'is', null)
  .not('image_url_1', 'eq', '')
  .not('quality_of_life', 'is', null)
  .gte('quality_of_life', 0);

console.log(`✅ Towns visible to PUBLIC: ${publicTowns}`);

// Towns with photos BUT no quality_of_life (ADMIN ONLY)
const { count: adminOnly } = await supabase
  .from('towns')
  .select('*', { count: 'exact', head: true })
  .not('image_url_1', 'is', null)
  .not('image_url_1', 'eq', '')
  .is('quality_of_life', null);

console.log(`🚨 Towns HIDDEN from public (admin only): ${adminOnly}`);

// Get some examples of hidden towns
const { data: hiddenExamples } = await supabase
  .from('towns')
  .select('town_name, country, quality_of_life')
  .not('image_url_1', 'is', null)
  .not('image_url_1', 'eq', '')
  .is('quality_of_life', null)
  .limit(10);

console.log('\n📋 Examples of hidden towns:');
hiddenExamples?.forEach(town => {
  console.log(`  - ${town.town_name}, ${town.country} (quality_of_life: ${town.quality_of_life})`);
});
