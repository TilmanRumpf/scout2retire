#!/usr/bin/env node

// Test if the user_preferences saving works now

import { createClient } from '@supabase/supabase-js';

// Use service role to simulate what should happen
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

const USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function saveHobbiesLikeAppDoes() {
  console.log('🔍 SAVING HOBBIES LIKE APP DOES');
  console.log('=' .repeat(60));
  
  try {
    // This is what happens when user clicks "Water Sports" compound button
    const hobbiesData = {
      activities: ['swimming'], // Water Sports maps to swimming
      interests: [],
      custom_physical: [],
      custom_hobbies: [],
      travel_frequency: 'rare',
      updated_at: new Date().toISOString()
    };
    
    console.log('1. Saving Water Sports (swimming):');
    console.log('Data:', hobbiesData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('user_preferences')
      .update(hobbiesData)
      .eq('user_id', USER_ID)
      .select();
    
    if (updateError) {
      console.log('❌ Error:', updateError);
    } else {
      console.log('✅ Saved successfully');
      console.log('Activities now:', updateResult[0].activities);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now test clicking "Golf & Tennis" compound button
    const hobbiesData2 = {
      activities: ['swimming', 'golf', 'tennis'], // Adding golf and tennis
      interests: [],
      custom_physical: [],
      custom_hobbies: [],
      travel_frequency: 'rare',
      updated_at: new Date().toISOString()
    };
    
    console.log('\n2. Adding Golf & Tennis:');
    console.log('Data:', hobbiesData2);
    
    const { data: updateResult2, error: updateError2 } = await supabase
      .from('user_preferences')
      .update(hobbiesData2)
      .eq('user_id', USER_ID)
      .select();
    
    if (updateError2) {
      console.log('❌ Error:', updateError2);
    } else {
      console.log('✅ Saved successfully');
      console.log('Activities now:', updateResult2[0].activities);
    }
    
    // Verify final state
    console.log('\n3. Final verification:');
    const { data: finalData, error: finalError } = await supabase
      .from('user_preferences')
      .select('activities, interests, updated_at')
      .eq('user_id', USER_ID)
      .single();
    
    if (finalError) {
      console.log('❌ Error reading:', finalError);
    } else {
      console.log('✅ Final activities:', finalData.activities);
      console.log('✅ Final interests:', finalData.interests);
      console.log('✅ Last updated:', finalData.updated_at);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

saveHobbiesLikeAppDoes().catch(console.error);
