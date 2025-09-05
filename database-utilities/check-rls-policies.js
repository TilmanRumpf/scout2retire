#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

const USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function testUpdate() {
  console.log('🔍 TESTING USER_PREFERENCES UPDATE');
  console.log('=' .repeat(60));
  
  try {
    // 1. First read current data
    console.log('\n1. READING CURRENT DATA:');
    const { data: currentData, error: readError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', USER_ID)
      .single();
    
    if (readError) {
      console.log('❌ Error reading:', readError);
      return;
    }
    
    console.log('✅ Current activities:', currentData.activities);
    console.log('✅ Last updated:', currentData.updated_at);
    
    // 2. Try to update with new data
    console.log('\n2. ATTEMPTING UPDATE:');
    const testData = {
      activities: ['swimming', 'hiking', 'cycling'],  // Simple hobby names, no compound buttons
      interests: ['reading', 'cooking'],
      custom_physical: [],
      custom_hobbies: [],
      travel_frequency: 'rare',
      updated_at: new Date().toISOString()
    };
    
    console.log('Updating with:', testData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('user_preferences')
      .update(testData)
      .eq('user_id', USER_ID)
      .select();
    
    if (updateError) {
      console.log('❌ Update error:', updateError);
      console.log('Error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      return;
    }
    
    if (!updateResult || updateResult.length === 0) {
      console.log('❌ Update returned no data - likely RLS blocking');
      return;
    }
    
    console.log('✅ Update succeeded!');
    console.log('Returned data:', updateResult[0].activities);
    
    // 3. Verify by reading again
    console.log('\n3. VERIFYING UPDATE:');
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_preferences')
      .select('activities, interests, updated_at')
      .eq('user_id', USER_ID)
      .single();
    
    if (verifyError) {
      console.log('❌ Verify error:', verifyError);
      return;
    }
    
    console.log('✅ After update - activities:', verifyData.activities);
    console.log('✅ After update - interests:', verifyData.interests);
    console.log('✅ After update - updated_at:', verifyData.updated_at);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testUpdate().catch(console.error);
