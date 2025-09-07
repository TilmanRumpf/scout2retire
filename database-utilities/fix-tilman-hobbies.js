#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateTilmanHobbies() {
  console.log('🌊 Updating Tilman\'s hobbies to include ALL water activities...\n');
  
  // First get Tilman's user ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'tilman.rumpf@gmail.com')
    .single();
    
  if (userError || !user) {
    console.error('Could not find user:', userError);
    return;
  }
  
  console.log('✅ Found user ID:', user.id);
  
  // All water activities from both Water Sports and Water Crafts groups
  const allWaterActivities = [
    'snorkeling', 'swimming', 'swimming_laps', 'water_aerobics', 'water_polo',
    'boating', 'canoeing', 'deep_sea_fishing', 'fishing', 'kayaking', 
    'sailing', 'scuba_diving', 'stand_up_paddleboarding', 'surfing', 
    'windsurfing', 'yacht_racing'
  ];
  
  console.log('🏊 Water activities to add:', allWaterActivities.length, 'activities');
  console.log('Activities:', allWaterActivities.join(', '));
  
  // Update user preferences with all water activities
  const { data: updated, error: updateError } = await supabase
    .from('user_preferences')
    .update({
      activities: allWaterActivities,
      custom_activities: ['water_sports', 'water_crafts'] // Both compound buttons
    })
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (updateError) {
    console.error('❌ Error updating preferences:', updateError);
    return;
  }
  
  console.log('\n✅ Successfully updated Tilman\'s hobbies!');
  console.log('📊 Updated data:');
  console.log('- Activities:', updated.activities?.length, 'items');
  console.log('- Custom activities:', updated.custom_activities);
  
  // Verify the update
  console.log('\n🔍 Verification:');
  const { data: verification } = await supabase
    .from('user_preferences')
    .select('activities, custom_activities')
    .eq('user_id', user.id)
    .single();
    
  console.log('✅ Current activities in database:', verification?.activities?.length);
  console.log('✅ Current custom activities:', verification?.custom_activities);
  
  console.log('\n🎯 Result: Tilman now has all water activities from both Water Sports and Water Crafts groups!');
}

updateTilmanHobbies().catch(console.error);