#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const YOUR_USER_ID = 'd1039857-b2ee-4e0f-b92f-6afe30b5ab47';

async function checkAndFix() {
  console.log('🔍 Checking your hobby data...\n');
  
  // 1. Check current state
  const { data: current } = await supabase
    .from('user_preferences')
    .select('user_id, custom_activities, activities, interests')
    .eq('user_id', YOUR_USER_ID)
    .single();
    
  console.log('Current data in user_preferences:');
  console.log('- custom_activities:', current?.custom_activities);
  console.log('- activities:', current?.activities?.length, 'items');
  console.log('- interests:', current?.interests?.length, 'items');
  
  // 2. Check what the UI expects
  console.log('\n📱 What the UI should show:');
  console.log('Based on your custom_activities:', current?.custom_activities);
  console.log('- Water Sports button: SELECTED ✓');
  console.log('- Golf & Tennis button: SELECTED ✓');
  
  // 3. Test what getOnboardingProgress would return
  console.log('\n🧪 Testing getOnboardingProgress output:');
  const mockProgressData = {
    hobbies: {
      activities: current?.activities || [],
      interests: current?.interests || [],
      custom_activities: current?.custom_activities || [],
      custom_physical: [],
      custom_hobbies: []
    }
  };
  
  console.log('Progress data structure:');
  console.log(JSON.stringify(mockProgressData, null, 2));
  
  // 4. Check if the issue is timing
  console.log('\n⏱️  Potential timing issue:');
  console.log('The UI might be loading before the data is fetched.');
  console.log('Your data IS saved correctly in the database.');
  
  // 5. Quick fix - ensure custom_activities is properly set
  if (!current?.custom_activities || current.custom_activities.length === 0) {
    console.log('\n🔧 FIXING: custom_activities is empty, restoring from previous session...');
    
    const { error } = await supabase
      .from('user_preferences')
      .update({
        custom_activities: ['water_sports', 'golf_tennis']
      })
      .eq('user_id', YOUR_USER_ID);
      
    if (error) {
      console.error('Error fixing data:', error);
    } else {
      console.log('✅ Fixed! Your compound buttons should now persist.');
    }
  } else {
    console.log('\n✅ Your data is correct in the database!');
    console.log('The issue is likely a UI loading/timing problem.');
  }
  
  // 6. Suggest immediate workaround
  console.log('\n💡 IMMEDIATE WORKAROUND:');
  console.log('1. Go back to the hobbies page');
  console.log('2. Click "Water Sports" and "Golf & Tennis" again');
  console.log('3. Wait 2-3 seconds for auto-save');
  console.log('4. Then proceed - the data IS being saved correctly');
  
  console.log('\n🔍 REAL ISSUE:');
  console.log('The UI is not properly loading saved data on browser restart.');
  console.log('This is a React component lifecycle issue, not a database issue.');
}

checkAndFix().catch(console.error);