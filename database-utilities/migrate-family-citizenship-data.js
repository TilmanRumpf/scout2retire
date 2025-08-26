import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function migrateFamilyCitizenshipData() {
  console.log('🚀 MIGRATING FAMILY AND CITIZENSHIP DATA FROM ONBOARDING_RESPONSES TO USER_PREFERENCES\n');
  
  // Get all users with onboarding_responses data
  console.log('Fetching users with onboarding data...');
  const { data: responses, error: respError } = await supabase
    .from('onboarding_responses')
    .select('*');
    
  if (respError) {
    console.error('Error fetching onboarding responses:', respError);
    return;
  }
  
  console.log(`Found ${responses.length} users with onboarding data\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const response of responses) {
    console.log(`\n📝 Processing user: ${response.user_id}`);
    
    // Extract current_status data
    const currentStatus = response.current_status || {};
    
    // Handle family_situation - it might be wrapped in an object or be a direct string
    let familyStatus = 'solo';
    if (typeof currentStatus.family_situation === 'string') {
      familyStatus = currentStatus.family_situation;
    } else if (currentStatus.family_situation?.status) {
      familyStatus = currentStatus.family_situation.status;
    }
    
    // Extract citizenship data
    const citizenship = currentStatus.citizenship || {};
    const partnerCitizenship = currentStatus.partner_citizenship || {};
    
    // Prepare update data
    const updateData = {
      // Family status (handle both old and new formats)
      family_status: familyStatus,
      
      // User citizenship
      primary_citizenship: citizenship.primary_citizenship || null,
      secondary_citizenship: citizenship.secondary_citizenship || null,
      visa_concerns: citizenship.visa_concerns || false,
      
      // Partner citizenship (only if family_status is couple or family)
      partner_primary_citizenship: (familyStatus === 'couple' || familyStatus === 'family') 
        ? (partnerCitizenship.primary_citizenship || null)
        : null,
      partner_secondary_citizenship: (familyStatus === 'couple' || familyStatus === 'family')
        ? (partnerCitizenship.secondary_citizenship || null)
        : null,
      
      // Pet information
      bringing_pets: currentStatus.pet_owner && currentStatus.pet_owner.length > 0,
      
      // Partner and children info
      partner_agreement: currentStatus.partner_agreement || null,
      bringing_children: currentStatus.bringing_children || false,
      
      // Location info
      current_location: currentStatus.current_location || null,
      moving_motivation: currentStatus.moving_motivation || null
    };
    
    console.log('  - Family status:', familyStatus);
    console.log('  - Primary citizenship:', updateData.primary_citizenship);
    if (familyStatus === 'couple' || familyStatus === 'family') {
      console.log('  - Partner primary citizenship:', updateData.partner_primary_citizenship);
    }
    
    // Update user_preferences
    const { error: updateError } = await supabase
      .from('user_preferences')
      .update(updateData)
      .eq('user_id', response.user_id);
      
    if (updateError) {
      console.error(`  ❌ Error updating user_preferences:`, updateError.message);
      errorCount++;
    } else {
      console.log(`  ✅ Successfully migrated data`);
      successCount++;
    }
  }
  
  console.log('\n\n=== MIGRATION SUMMARY ===');
  console.log(`✅ Successfully migrated: ${successCount} users`);
  console.log(`❌ Errors encountered: ${errorCount} users`);
  
  // Verify the migration for ctorres
  console.log('\n3️⃣ Verifying migration for ctorres@asshole.com...');
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'ctorres@asshole.com')
    .single();
    
  if (user) {
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('family_status, primary_citizenship, secondary_citizenship, partner_primary_citizenship, partner_secondary_citizenship')
      .eq('user_id', user.id)
      .single();
      
    console.log('\nctorres data after migration:');
    console.log('- Family status:', prefs?.family_status);
    console.log('- Primary citizenship:', prefs?.primary_citizenship);
    console.log('- Secondary citizenship:', prefs?.secondary_citizenship);
    console.log('- Partner primary citizenship:', prefs?.partner_primary_citizenship);
    console.log('- Partner secondary citizenship:', prefs?.partner_secondary_citizenship);
  }
  
  console.log('\n✅ Migration complete!');
}

migrateFamilyCitizenshipData().catch(console.error);