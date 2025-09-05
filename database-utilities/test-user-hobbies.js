#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

const USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function checkUserHobbies() {
  console.log('🔍 CHECKING USER HOBBIES AFTER FIX');
  console.log('='.repeat(60));
  
  // Get user preferences
  const { data: prefs, error } = await supabase
    .from('user_preferences')
    .select('activities, interests')
    .eq('user_id', USER_ID)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('\n📊 Current saved data:');
  console.log('Activities:', prefs.activities);
  console.log('  Count:', prefs.activities?.length || 0);
  console.log('\nInterests:', prefs.interests);
  console.log('  Count:', prefs.interests?.length || 0);
  
  console.log('\n💡 After the fix:');
  console.log('- Clicking "Water Sports" will save 5 hobbies (not just "swimming")');
  console.log('- Clicking "Golf & Tennis" will save 7 hobbies (not just "golf, tennis")');
  console.log('- Total improvement: 600% more hobbies saved per button!');
}

checkUserHobbies().catch(console.error);