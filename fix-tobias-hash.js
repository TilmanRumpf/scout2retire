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
  const correctHash = '5f20731a'; // From console: calculated hash

  console.log('Fixing hash for tobiasrumpf@gmx.de');
  console.log('Setting to:', correctHash);

  await supabase
    .from('user_preferences')
    .update({ preferences_hash: correctHash })
    .eq('user_id', userId);

  await supabase
    .from('onboarding_responses')
    .update({ preferences_hash: correctHash })
    .eq('user_id', userId);

  console.log('✅ Hash updated! Refresh browser and try again.');
}

fixHash();
