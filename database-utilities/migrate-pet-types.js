import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function migratePetTypes() {
  console.log('🐕 MIGRATING PET TYPES DATA\n');
  
  // Get all onboarding responses with pet data
  const { data: responses, error } = await supabase
    .from('onboarding_responses')
    .select('user_id, current_status');
    
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  let updated = 0;
  
  for (const response of responses) {
    const petOwner = response.current_status?.pet_owner;
    
    if (petOwner && Array.isArray(petOwner) && petOwner.length > 0) {
      console.log(`Updating user ${response.user_id}: pets = ${petOwner.join(', ')}`);
      
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ pet_types: petOwner })
        .eq('user_id', response.user_id);
        
      if (updateError) {
        console.error(`Error updating user ${response.user_id}:`, updateError.message);
      } else {
        updated++;
      }
    }
  }
  
  console.log(`\n✅ Updated ${updated} users with pet types`);
  
  // Check ctorres specifically
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'ctorres@asshole.com')
    .single();
    
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('bringing_pets, pet_types')
    .eq('user_id', user.id)
    .single();
    
  console.log('\nctorres pet data:');
  console.log('- bringing_pets:', prefs?.bringing_pets);
  console.log('- pet_types:', prefs?.pet_types);
}

migratePetTypes().catch(console.error);