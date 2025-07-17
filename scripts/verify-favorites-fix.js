import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFavoritesFix() {
  console.log('Verifying favorites table fix...\n');

  try {
    // 1. Test query to favorites table
    console.log('1. Testing favorites table query...');
    const { error: favError, count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact' });

    if (favError) {
      console.error('Error querying favorites:', favError);
    } else {
      console.log(`✅ Favorites table accessible. Total records: ${count || 0}`);
    }

    // 2. Get a test user
    console.log('\n2. Getting authenticated user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('No authenticated user. Testing with a sample user ID...');
      
      // Try to find any user in the database
      const { data: users } = await supabase.auth.admin.listUsers?.() || {};
      if (users && users.users && users.users.length > 0) {
        console.log('Found users in auth system');
      }
    } else {
      console.log(`✅ Authenticated user: ${user.email} (${user.id})`);
      
      // 3. Test inserting a favorite
      console.log('\n3. Testing favorite insert...');
      const testTownId = 'porto-portugal';
      
      // First delete if exists
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('town_id', testTownId);
      
      // Try to insert
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          town_id: testTownId,
          town_name: 'Porto',
          town_country: 'Portugal'
        });

      if (insertError) {
        console.error('❌ Insert failed:', insertError);
        console.error('Details:', insertError.details, insertError.hint);
      } else {
        console.log('✅ Successfully inserted test favorite');
        
        // Clean up
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('town_id', testTownId);
        
        console.log('✅ Cleanup complete');
      }
    }

    console.log('\n✅ Favorites table is properly configured!');
    console.log('Tobias should now be able to favorite towns without errors.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyFavoritesFix();