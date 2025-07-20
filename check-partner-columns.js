import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkPartnerColumns() {
  console.log('🔍 CHECKING IF PARTNER COLUMNS EXIST IN USER_PREFERENCES TABLE\n');
  
  // Try to query the columns
  const { data, error } = await supabase
    .from('user_preferences')
    .select('partner_primary_citizenship, partner_secondary_citizenship')
    .limit(1);
    
  if (error) {
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('❌ Partner columns DO NOT EXIST');
      console.log('\n📋 Please execute this SQL in Supabase Dashboard:\n');
      console.log('ALTER TABLE user_preferences');
      console.log('ADD COLUMN IF NOT EXISTS partner_primary_citizenship TEXT,');
      console.log('ADD COLUMN IF NOT EXISTS partner_secondary_citizenship TEXT;');
      console.log('\n');
      return false;
    } else {
      console.error('Unexpected error:', error);
      return false;
    }
  }
  
  console.log('✅ Partner columns EXIST!');
  console.log('You can proceed with the migration.');
  return true;
}

checkPartnerColumns().catch(console.error);