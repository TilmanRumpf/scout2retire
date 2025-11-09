import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPublished() {
  console.log('🔍 Checking is_published column...\n');

  // Check a few towns
  const { data, error } = await supabase
    .from('towns')
    .select('id, town_name, is_published, image_url_1')
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('Sample towns:');
  data.forEach(town => {
    console.log(`- ${town.town_name}: is_published=${town.is_published}, has_image=${!!town.image_url_1}`);
  });

  // Count published vs unpublished
  const { data: stats } = await supabase
    .from('towns')
    .select('is_published', { count: 'exact', head: false });

  const published = stats?.filter(t => t.is_published === true).length || 0;
  const unpublished = stats?.filter(t => t.is_published === false).length || 0;
  const nullish = stats?.filter(t => t.is_published === null || t.is_published === undefined).length || 0;

  console.log(`\n📊 Stats:`);
  console.log(`Published: ${published}`);
  console.log(`Unpublished: ${unpublished}`);
  console.log(`Null/Undefined: ${nullish}`);
}

checkPublished().then(() => process.exit(0));
