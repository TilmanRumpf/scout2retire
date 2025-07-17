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

async function testGoogleMapsFix() {
  try {
    console.log('Testing Google Maps link fix...\n');

    // First, let's see some current broken links
    const { data: brokenLinks, error: fetchError } = await supabase
      .from('towns')
      .select('id, name, country, google_maps_link')
      .like('google_maps_link', '%goo.gl%')
      .limit(5);

    if (fetchError) throw fetchError;

    if (brokenLinks && brokenLinks.length > 0) {
      console.log('Sample of current broken links:');
      brokenLinks.forEach(town => {
        console.log(`- ${town.name}, ${town.country}: ${town.google_maps_link}`);
      });
      console.log('\n');

      // Show what the new links would look like
      console.log('New links would be:');
      brokenLinks.forEach(town => {
        const newLink = `https://www.google.com/maps/search/${encodeURIComponent(town.name + ' ' + town.country)}`;
        console.log(`- ${town.name}, ${town.country}: ${newLink}`);
      });
    } else {
      console.log('No broken goo.gl links found.');
    }

    // Count total affected rows
    const { count } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .or('google_maps_link.like.%goo.gl%,google_maps_link.is.null,google_maps_link.eq.');

    console.log(`\nTotal towns that would be updated: ${count}`);

    // Test the actual SQL transformation
    const { data: testData } = await supabase
      .from('towns')
      .select('name, country')
      .limit(3);

    if (testData) {
      console.log('\nSQL transformation test:');
      testData.forEach(town => {
        // Simulate the SQL REPLACE operations
        const transformed = (town.name + '+' + town.country)
          .replace(/ /g, '+')
          .replace(/,/g, '')
          .replace(/'/g, '');
        console.log(`- ${town.name}, ${town.country} → ${transformed}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGoogleMapsFix();