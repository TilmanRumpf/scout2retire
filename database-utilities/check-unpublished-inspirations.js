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

const { data, error } = await supabase
  .from('regional_inspirations')
  .select('id, title, is_active, typical_town_examples')
  .in('title', [
    'Costa Rica pura vida?',
    'Swiss alpine villages?',
    'Malaysian melting pot?',
    'Mexican beach life?',
    'Colombian renaissance?'
  ])
  .order('title');

if (error) {
  console.error('Error:', error);
} else {
  console.log('\n5 UNPUBLISHED INSPIRATIONS:\n');
  data.forEach(i => {
    console.log(`${i.is_active ? '🟢' : '🔴'} ${i.title}`);
    console.log(`   is_active: ${i.is_active}`);
    console.log(`   towns: ${i.typical_town_examples?.join(', ') || 'none'}`);
    console.log('');
  });
}
