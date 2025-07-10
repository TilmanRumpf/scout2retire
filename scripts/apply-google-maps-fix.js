import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixGoogleMapsLinks() {
  try {
    console.log('Starting Google Maps link fix...\n');

    // First, get all towns with broken links
    const { data: towns, error: fetchError } = await supabase
      .from('towns')
      .select('id, name, country, google_maps_link')
      .or('google_maps_link.like.%goo.gl%,google_maps_link.like.%maps.app.goo.gl%,google_maps_link.is.null,google_maps_link.eq.');

    if (fetchError) throw fetchError;

    console.log(`Found ${towns.length} towns to update\n`);

    // Update each town
    let successCount = 0;
    let errorCount = 0;

    for (const town of towns) {
      // Create the new Google Maps search URL
      const searchQuery = `${town.name} ${town.country}`
        .replace(/'/g, '') // Remove apostrophes
        .replace(/,/g, ''); // Remove commas
      
      const newLink = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

      // Update the town
      const { error: updateError } = await supabase
        .from('towns')
        .update({ google_maps_link: newLink })
        .eq('id', town.id);

      if (updateError) {
        console.error(`Error updating ${town.name}, ${town.country}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`✓ Updated ${town.name}, ${town.country}`);
        successCount++;
      }
    }

    console.log(`\n✅ Successfully updated ${successCount} towns`);
    if (errorCount > 0) {
      console.log(`❌ Failed to update ${errorCount} towns`);
    }

    // Verify a few updates
    console.log('\nVerifying some updated links:');
    const { data: verified } = await supabase
      .from('towns')
      .select('name, country, google_maps_link')
      .like('google_maps_link', 'https://www.google.com/maps/search/%')
      .limit(5);

    if (verified) {
      verified.forEach(town => {
        console.log(`- ${town.name}, ${town.country}: ${town.google_maps_link}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixGoogleMapsLinks();