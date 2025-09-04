#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Use the ANON key from .env like the app does
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

const USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';
const USER_EMAIL = 'tobiasrumpf@gmx.de';

async function testAnonUpdate() {
  console.log('🔍 TESTING ANON KEY UPDATE PERMISSIONS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Sign in as the user first
    console.log('\n1. SIGNING IN AS USER:');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: 'Ilvy@2022' // You mentioned this was the test password
    });
    
    if (signInError) {
      console.log('❌ Sign in error:', signInError.message);
      return;
    }
    
    console.log('✅ Signed in as:', signInData.user.email);
    console.log('Session user ID:', signInData.user.id);
    
    // 2. Now try to update user_preferences
    console.log('\n2. ATTEMPTING UPDATE WITH ANON KEY + AUTH:');
    const testData = {
      activities: ['swimming', 'hiking', 'cycling'],
      interests: ['reading', 'cooking'],
      custom_physical: [],
      custom_hobbies: [],
      travel_frequency: 'frequent',
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
      console.log('Error code:', updateError.code);
      console.log('Error message:', updateError.message);
      console.log('Error details:', updateError.details);
      console.log('Error hint:', updateError.hint);
      return;
    }
    
    if (!updateResult || updateResult.length === 0) {
      console.log('❌ Update returned no data - likely RLS blocking');
      console.log('Full result:', updateResult);
      return;
    }
    
    console.log('✅ Update succeeded!');
    console.log('Returned data:', updateResult[0].activities);
    
    // 3. Verify by reading
    console.log('\n3. VERIFYING UPDATE:');
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_preferences')
      .select('activities, interests, travel_frequency, updated_at')
      .eq('user_id', USER_ID)
      .single();
    
    if (verifyError) {
      console.log('❌ Verify error:', verifyError);
      return;
    }
    
    console.log('✅ After update - activities:', verifyData.activities);
    console.log('✅ After update - interests:', verifyData.interests);
    console.log('✅ After update - travel_frequency:', verifyData.travel_frequency);
    console.log('✅ After update - updated_at:', verifyData.updated_at);
    
    // 4. Sign out
    await supabase.auth.signOut();
    console.log('\n✅ Signed out');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAnonUpdate().catch(console.error);
