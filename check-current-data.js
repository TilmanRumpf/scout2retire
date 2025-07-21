import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkCurrentData() {
  console.log('🔍 CHECKING CURRENT DATABASE STATE\n');
  
  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'ctorres@asshole.com')
    .single();
    
  // Get preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  console.log('=== RELEVANT FIELDS ===');
  console.log('family_status:', prefs.family_status);
  console.log('primary_citizenship:', prefs.primary_citizenship);
  console.log('secondary_citizenship:', prefs.secondary_citizenship);
  console.log('partner_primary_citizenship:', prefs.partner_primary_citizenship);
  console.log('partner_secondary_citizenship:', prefs.partner_secondary_citizenship);
  console.log('bringing_pets:', prefs.bringing_pets);
  console.log('pet_types:', prefs.pet_types);
  
  // Check what the UI will load
  console.log('\n=== WHAT THE UI LOADS ===');
  console.log('family_situation:', prefs.family_status || 'solo');
  console.log('pet_owner:', prefs.pet_types || []);
  console.log('Has pet_types column?', prefs.pet_types !== undefined);
}

checkCurrentData().catch(console.error);