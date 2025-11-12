#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enableCrashReporting() {
  const users = [
    { email: 'tilman.rumpf@gmail.com', id: '83d285b2-b21b-4d13-a1a1-6d51b6733d52' },
    { email: 'tobiasrumpf@gmx.de', id: 'd1039857-71e2-4562-86aa-1f0b4a0c17c8' }
  ];

  console.log('🔧 Enabling crash reporting for specified users...\n');

  for (const user of users) {
    console.log(`Processing ${user.email}...`);

    // Get current privacy settings
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('privacy')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentPrivacy = prefs?.privacy || {};
    const updatedPrivacy = {
      ...currentPrivacy,
      allow_crash_reporting: true
    };

    // Update privacy settings
    const { error } = await supabase
      .from('user_preferences')
      .update({ privacy: updatedPrivacy })
      .eq('user_id', user.id);

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Enabled crash reporting`);
    }
  }

  console.log('\n✅ Done!');
}

enableCrashReporting();
