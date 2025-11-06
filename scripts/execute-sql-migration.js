import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLMigration() {
  try {
    console.log('Executing SQL migration to fix Google Maps links...\n');

    // Use RPC to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        UPDATE towns
        SET google_maps_link = 
            'https://www.google.com/maps/search/' || 
            REPLACE(REPLACE(REPLACE(name || ' ' || country, ' ', '+'), ',', ''), '''', '')
        WHERE google_maps_link LIKE '%goo.gl%' 
           OR google_maps_link LIKE '%maps.app.goo.gl%'
           OR google_maps_link IS NULL
           OR google_maps_link = '';
      `
    });

    if (error) {
      // If RPC doesn't exist, let's try a different approach
      console.log('RPC not available, using direct updates...');
      
      // Get all towns that need updating
      const { data: towns, error: fetchError } = await supabase
        .from('towns')
        .select('*')
        .or('google_maps_link.like.%goo.gl%,google_maps_link.is.null');

      if (fetchError) throw fetchError;

      console.log(`Updating ${towns.length} towns...`);

      // Update in batches
      const batchSize = 10;
      for (let i = 0; i < towns.length; i += batchSize) {
        const batch = towns.slice(i, i + batchSize);
        
        const updates = batch.map(town => ({
          id: town.id,
          google_maps_link: `https://www.google.com/maps/search/${encodeURIComponent(town.town_name + ' ' + town.country)}`
        }));

        // Use upsert to update multiple records
        const { error: updateError } = await supabase
          .from('towns')
          .upsert(updates, { onConflict: 'id' });

        if (updateError) {
          console.error(`Error in batch ${i/batchSize + 1}:`, updateError);
        } else {
          console.log(`✓ Updated batch ${i/batchSize + 1} (${Math.min(i + batchSize, towns.length)}/${towns.length})`);
        }
      }
    }

    // Verify the update
    const { count } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .like('google_maps_link', '%goo.gl%');

    console.log(`\n✅ Migration complete. Remaining broken links: ${count || 0}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

executeSQLMigration();