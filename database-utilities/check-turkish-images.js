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

console.log('🔍 Checking Turkish towns for images...\n');

const townNames = ['Antalya', 'Bodrum', 'Fethiye', 'Alanya', 'Kas'];

const { data, error } = await supabase
  .from('towns')
  .select('town_name, image_url_1, image_url_2, image_url_3')
  .in('town_name', townNames);

if (error) {
  console.error('Error:', error);
} else {
  console.log(`Found ${data.length} towns:\n`);
  data.forEach(town => {
    const hasImage = town.image_url_1 !== null && town.image_url_1 !== '';
    console.log(`${town.town_name}:`);
    console.log(`  image_url_1: ${town.image_url_1 ? '✅ HAS IMAGE' : '❌ NO IMAGE'}`);
    console.log(`  image_url_2: ${town.image_url_2 ? '✅' : '❌'}`);
    console.log(`  image_url_3: ${town.image_url_3 ? '✅' : '❌'}`);
    console.log('');
  });

  const withImages = data.filter(t => t.image_url_1);
  console.log(`\n📊 Summary: ${withImages.length} of ${data.length} towns have image_url_1`);
  console.log(`Towns WITH images: ${withImages.map(t => t.town_name).join(', ')}`);

  const without = data.filter(t => !t.image_url_1);
  if (without.length > 0) {
    console.log(`\n❌ Towns WITHOUT images: ${without.map(t => t.town_name).join(', ')}`);
    console.log('\n⚠️  THIS IS WHY ONLY SOME TOWNS SHOW ON /DAILY PAGE!');
    console.log('   The query filters with: .not("image_url_1", "is", null)');
  }
}
