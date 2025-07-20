import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkUserPreferences() {
  // Check user_preferences table structure
  const { data: columns, error: colError } = await supabase
    .rpc('query', { 
      query_text: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences'
        ORDER BY ordinal_position
      ` 
    });

  if (!colError && columns) {
    console.log('📋 user_preferences table structure:');
    console.table(columns);
  }

  // Get sample data
  const { data: prefs, error } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(2);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📄 Sample user_preferences records:');
  console.log(JSON.stringify(prefs, null, 2));

  // Check which users have onboarding data but no preferences
  const { data: missingPrefs, error: missingError } = await supabase
    .rpc('query', { 
      query_text: `
        SELECT DISTINCT o.user_id
        FROM onboarding_responses o
        LEFT JOIN user_preferences p ON o.user_id = p.user_id
        WHERE p.user_id IS NULL
      ` 
    });

  if (!missingError && missingPrefs) {
    console.log('\n⚠️ Users with onboarding data but no preferences:');
    console.log(missingPrefs);
  }
}

checkUserPreferences().catch(console.error);