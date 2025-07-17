import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyGoogleMapsUpdate() {
  try {
    console.log('Verifying Google Maps links in online Supabase...\n');

    // Check for any remaining goo.gl links
    const { data: brokenLinks, count: brokenCount } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .like('google_maps_link', '%goo.gl%');

    console.log(`Remaining broken goo.gl links: ${brokenCount || 0}`);

    // Show some updated links
    const { data: updatedTowns } = await supabase
      .from('towns')
      .select('name, country, google_maps_link')
      .like('google_maps_link', 'https://www.google.com/maps/search/%')
      .limit(10);

    if (updatedTowns && updatedTowns.length > 0) {
      console.log('\nSample of updated Google Maps links:');
      updatedTowns.forEach(town => {
        console.log(`✓ ${town.name}, ${town.country}`);
        console.log(`  ${town.google_maps_link}\n`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyGoogleMapsUpdate();