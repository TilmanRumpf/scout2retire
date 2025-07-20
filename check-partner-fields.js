import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkPartnerFields() {
  // Check if partner fields exist in user_preferences
  const { data: columns, error } = await supabase
    .rpc('query', { 
      query_text: `
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences'
        AND column_name LIKE 'partner_%'
        ORDER BY column_name
      ` 
    });

  console.log('🔍 Existing partner fields in user_preferences:');
  if (columns && columns.length > 0) {
    columns.forEach(col => console.log(`  - ${col.column_name}`));
  } else {
    console.log('  ❌ No partner fields found');
  }

  // Check how many users have partner data in onboarding
  const { data: partnerData, error: partnerError } = await supabase
    .from('onboarding_responses')
    .select('user_id, current_status')
    .or('current_status->family_situation.eq.couple,current_status->family_situation.eq.family,current_status->family_situation->status.eq.couple,current_status->family_situation->status.eq.family');

  if (!partnerError && partnerData) {
    console.log(`\n👫 Users with couple/family status: ${partnerData.length}`);
    
    // Check partner citizenship data
    const withPartnerCitizenship = partnerData.filter(p => 
      p.current_status?.partner_citizenship?.primary_citizenship
    );
    
    console.log(`📋 Users with partner citizenship data: ${withPartnerCitizenship.length}`);
    
    if (withPartnerCitizenship.length > 0) {
      console.log('\n📝 Sample partner citizenship data:');
      withPartnerCitizenship.slice(0, 3).forEach(user => {
        console.log(`\nUser ${user.user_id}:`);
        console.log(`  Primary: ${user.current_status.partner_citizenship.primary_citizenship}`);
        console.log(`  Secondary: ${user.current_status.partner_citizenship.secondary_citizenship || 'none'}`);
        console.log(`  Dual: ${user.current_status.partner_citizenship.dual_citizenship}`);
      });
    }
  }
}

checkPartnerFields().catch(console.error);