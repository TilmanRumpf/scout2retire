import { createClient } from '@supabase/supabase-js';

// Local Supabase credentials
const supabaseUrl = 'http://localhost:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixFavorites() {
  console.log('🔍 Checking favorites table structure...\n');

  try {
    // 1. Check if favorites table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'favorites');

    if (tableError) {
      console.error('Error checking tables:', tableError);
      return;
    }

    console.log('Favorites table exists:', tables?.length > 0);

    // 2. Check columns in favorites table
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'favorites')
      .order('ordinal_position');

    if (columnError) {
      console.error('Error checking columns:', columnError);
      return;
    }

    console.log('\nCurrent favorites table columns:');
    columns?.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // 3. Check if town_country column exists
    const hasTownCountry = columns?.some(col => col.column_name === 'town_country');
    console.log(`\ntown_country column exists: ${hasTownCountry}`);

    if (!hasTownCountry) {
      console.log('\n⚠️  town_country column is missing! The migration may not have been applied.');
      console.log('The application expects this column to exist.');
      console.log('\nTo fix this, run the following SQL in Supabase Studio:');
      console.log('ALTER TABLE favorites ADD COLUMN IF NOT EXISTS town_country TEXT;');
    }

    // 4. Test the favorites table
    console.log('\n🧪 Testing favorites table access...');
    const { data: testData, error: testError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Error accessing favorites table:', testError);
    } else {
      console.log('✅ Successfully accessed favorites table');
      console.log('Row count:', testData?.length || 0);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAndFixFavorites();