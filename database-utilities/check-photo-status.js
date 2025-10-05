import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkPhotoStatus() {
  console.log('\n📊 CHECKING PHOTO STATUS...\n');

  // First, let's see what we can actually query
  const { data: sample, error: sampleError } = await supabase
    .from('towns')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.error('Error fetching sample:', sampleError);
    return;
  }

  console.log('=== AVAILABLE COLUMNS ===');
  console.log(Object.keys(sample[0] || {}).join(', '));

  // Total towns
  const { count: totalCount, error: totalError } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error counting total towns:', totalError);
    return;
  }

  // Get all towns to check photo-related fields
  const { data: allTowns, error: dataError } = await supabase
    .from('towns')
    .select('*');

  if (dataError) {
    console.error('Error fetching towns:', dataError);
    return;
  }

  // Check for photo-related fields
  const photoFields = Object.keys(allTowns[0] || {}).filter(k =>
    k.toLowerCase().includes('photo') || k.toLowerCase().includes('image')
  );

  console.log('\n=== PHOTO-RELATED FIELDS ===');
  console.log(photoFields.length > 0 ? photoFields.join(', ') : 'None found');

  console.log('\n=== BASIC STATS ===');
  console.log(`Total towns: ${totalCount}`);
  console.log(`Data retrieved: ${allTowns.length} rows`);
}

checkPhotoStatus();
