#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const TOBIAS_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function debugUILoading() {
  console.log('🔍 DEBUGGING UI LOADING ISSUE FOR TOBIAS\n');
  
  // 1. Check what's in user_preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', TOBIAS_ID)
    .single();
    
  console.log('✅ DATABASE HAS YOUR DATA:');
  console.log('- user_id:', prefs?.user_id);
  console.log('- custom_activities:', prefs?.custom_activities);
  console.log('- activities:', prefs?.activities?.length, 'items');
  console.log('- interests:', prefs?.interests?.length, 'items');
  
  // 2. Simulate what getOnboardingProgress returns
  console.log('\n📱 WHAT getOnboardingProgress SHOULD RETURN:');
  const mockProgressData = {
    success: true,
    data: {
      hobbies: {
        activities: prefs?.activities || [],
        interests: prefs?.interests || [],
        custom_activities: prefs?.custom_activities || [],
        custom_physical: prefs?.custom_physical || [],
        custom_hobbies: prefs?.custom_hobbies || []
      }
    }
  };
  
  console.log('hobbies.custom_activities:', mockProgressData.data.hobbies.custom_activities);
  
  // 3. Simulate UI reconstruction
  console.log('\n🎮 UI RECONSTRUCTION:');
  const loadedCompoundButtons = mockProgressData.data.hobbies.custom_activities || [];
  console.log('loadedCompoundButtons:', loadedCompoundButtons);
  
  const reconstructedActivities = loadedCompoundButtons.filter(id => !id.startsWith('interest_'));
  const reconstructedInterests = loadedCompoundButtons
    .filter(id => id.startsWith('interest_'))
    .map(id => id.replace('interest_', ''));
    
  console.log('reconstructedActivities:', reconstructedActivities);
  console.log('reconstructedInterests:', reconstructedInterests);
  
  console.log('\n✅ EXPECTED UI STATE:');
  console.log('- Water Sports button: SELECTED');
  console.log('- Golf & Tennis button: SELECTED');
  
  console.log('\n🐛 POSSIBLE ISSUES:');
  console.log('1. getCurrentUser() might not be returning the right user ID');
  console.log('2. getOnboardingProgress() might not be including custom_activities');
  console.log('3. The useEffect in OnboardingHobbies might not be firing');
  console.log('4. The loading might complete before data is fetched (race condition)');
  
  console.log('\n💡 IMMEDIATE FIX:');
  console.log('Add this debug to OnboardingHobbies.jsx line 590:');
  console.log(`
console.log('🔍 DEBUG: Loading user data');
console.log('User ID:', userResult.user?.id);
console.log('Progress result:', progressResult);
console.log('Hobbies data:', progressResult.data?.hobbies);
console.log('custom_activities:', progressResult.data?.hobbies?.custom_activities);
  `);
}

debugUILoading().catch(console.error);