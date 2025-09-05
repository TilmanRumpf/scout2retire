import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkPetField() {
  console.log('🐕 CHECKING PET FIELD STRUCTURE\n');
  
  // Check column type
  const { data: columns } = await supabase
    .from('user_preferences')
    .select('bringing_pets')
    .limit(0);
    
  // Get ctorres data
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'ctorres@asshole.com')
    .single();
    
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('bringing_pets')
    .eq('user_id', user.id)
    .single();
    
  console.log('Current bringing_pets value:', prefs?.bringing_pets);
  console.log('Type:', typeof prefs?.bringing_pets);
  
  // Check if there's a pet_types or pet_owner column
  const { data: allColumns } = await supabase.rpc('get_table_columns', {
    table_name: 'user_preferences'
  });
  
  const petColumns = allColumns?.filter(col => 
    col.column_name.includes('pet') || 
    col.column_name.includes('animal')
  );
  
  console.log('\nPet-related columns:', petColumns?.map(c => c.column_name));
  
  // Check onboarding_responses for pet data
  const { data: oldData } = await supabase
    .from('onboarding_responses')
    .select('current_status')
    .eq('user_id', user.id)
    .single();
    
  console.log('\nOriginal pet_owner data:', oldData?.current_status?.pet_owner);
}

checkPetField().catch(console.error);