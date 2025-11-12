#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  const users = [
    { email: 'tilman.rumpf@gmail.com', id: '83d285b2-b21b-4d13-a1a1-6d51b6733d52' },
    { email: 'tobiasrumpf@gmx.de', id: 'd1039857-71e2-4562-86aa-1f0b4a0c17c8' }
  ];

  console.log('🔍 Verifying crash reporting status...\n');

  for (const user of users) {
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('privacy')
      .eq('user_id', user.id)
      .maybeSingle();

    const status = prefs?.privacy?.allow_crash_reporting;
    const icon = status ? '✅' : '❌';
    
    console.log(`${icon} ${user.email}: ${status ? 'ENABLED' : 'DISABLED'}`);
  }
}

verify();
