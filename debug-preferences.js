#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
  const userId = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';
  
  console.log('📊 Checking onboarding_responses...');
  const { data: responses } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  console.log('onboarding_responses:', responses ? 'EXISTS' : 'NULL');
  if (responses) {
    console.log('  - current_status:', !!responses.current_status);
    console.log('  - region:', !!responses.region);
    console.log('  - climate:', !!responses.climate);
    console.log('  - culture:', !!responses.culture);
    console.log('  - hobbies:', !!responses.hobbies);
    console.log('  - administration:', !!responses.administration);
    console.log('  - costs:', !!responses.costs);
  }
  
  console.log('\n📊 Checking user_preferences...');
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (prefs) {
    console.log('user_preferences exists!');
    console.log('  - current_status:', !!prefs.current_status);
    console.log('  - region_preferences:', !!prefs.region_preferences);
    console.log('  - climate_preferences:', !!prefs.climate_preferences);
    console.log('  - culture_preferences:', !!prefs.culture_preferences);
    console.log('  - hobbies:', !!prefs.hobbies);
    console.log('  - administration:', !!prefs.administration);
    console.log('  - costs:', !!prefs.costs);
    console.log('\nFull climate_preferences:');
    console.log(JSON.stringify(prefs.climate_preferences, null, 2));
  }
}

debug();
