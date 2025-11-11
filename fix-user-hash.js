#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixHash() {
  const userId = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8'; // tobiasrumpf@gmx.de
  
  console.log('Fetching current preferences...');
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (!prefs) {
    console.log('No preferences found');
    return;
  }
  
  console.log('Current hash:', prefs.preferences_hash);
  console.log('Updating to calculated hash: 4fd5309d');
  
  const { error } = await supabase
    .from('user_preferences')
    .update({
      preferences_hash: '4fd5309d',
      preferences_updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (error) {
    console.log('ERROR:', error);
  } else {
    console.log('✅ Hash updated successfully!');
  }
}

fixHash();
