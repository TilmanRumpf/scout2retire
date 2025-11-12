#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConsent() {
  const userId = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8'; // tobiasrumpf@gmx.de

  console.log('🔍 Checking admin_access_consent for tobiasrumpf@gmx.de\n');

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('user_id, admin_access_consent')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: responses } = await supabase
    .from('onboarding_responses')
    .select('user_id, admin_access_consent')
    .eq('user_id', userId)
    .maybeSingle();

  console.log('user_preferences.admin_access_consent:', prefs?.admin_access_consent ?? 'NULL/MISSING');
  console.log('onboarding_responses.admin_access_consent:', responses?.admin_access_consent ?? 'NULL/MISSING');

  if (prefs?.admin_access_consent !== true || responses?.admin_access_consent !== true) {
    console.log('\n❌ PROBLEM FOUND: Consent not set to true!');
    console.log('Fixing now...\n');

    await supabase
      .from('user_preferences')
      .update({ admin_access_consent: true })
      .eq('user_id', userId);

    await supabase
      .from('onboarding_responses')
      .update({ admin_access_consent: true })
      .eq('user_id', userId);

    console.log('✅ Fixed: Set admin_access_consent = true for tobiasrumpf@gmx.de');
  } else {
    console.log('\n✅ Consent is already set to true');
  }
}

checkConsent();
