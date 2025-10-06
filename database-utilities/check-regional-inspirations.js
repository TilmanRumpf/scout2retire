import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkInspirations() {
  const { data, error } = await supabase
    .from('regional_inspirations')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== REGIONAL INSPIRATIONS ===\n');
  data.forEach((row, i) => {
    console.log(`${i + 1}. ${row.title}`);
    console.log(`   Region: ${row.region_name}`);
    console.log(`   Image: ${row.image_url || 'NONE'}`);
    console.log(`   Description: ${row.description.substring(0, 80)}...`);
    console.log('');
  });

  // Find the Turkish one
  const turkish = data.find(r => r.title.toLowerCase().includes('turkish') || r.title.includes('?'));
  if (turkish) {
    console.log('=== FOUND PROBLEMATIC ENTRY ===');
    console.log('ID:', turkish.id);
    console.log('Title:', turkish.title);
    console.log('Region:', turkish.region_name);
    console.log('\nThis should be changed to something like:');
    console.log('Title: "Antalya" or "Turkish Riviera" (no question mark)');
  }
}

checkInspirations();
