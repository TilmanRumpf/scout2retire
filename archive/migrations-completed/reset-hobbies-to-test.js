#!/usr/bin/env node

// Reset hobbies back to the compound buttons to test the UI

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

const USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function resetHobbies() {
  console.log('🔄 RESETTING HOBBIES TO TEST STATE');
  console.log('=' .repeat(60));
  
  try {
    // Reset to state where user has selected compound buttons
    const resetData = {
      activities: ['water_sports', 'golf_tennis'],  // Compound button IDs
      interests: [],
      custom_physical: [],
      custom_hobbies: [],
      travel_frequency: 'rare',
      updated_at: new Date().toISOString()
    };
    
    console.log('Resetting to compound button state:', resetData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('user_preferences')
      .update(resetData)
      .eq('user_id', USER_ID)
      .select();
    
    if (updateError) {
      console.log('❌ Error:', updateError);
    } else {
      console.log('✅ Reset complete');
      console.log('Activities now:', updateResult[0].activities);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

resetHobbies().catch(console.error);
