#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkChatTablesStructure() {
  console.log('🔍 Checking chat_threads table structure...\n');

  try {
    // Get a sample from chat_threads to see columns
    const { data: threadSample, error: threadError } = await supabase
      .from('chat_threads')
      .select('*')
      .limit(1);

    if (threadError) {
      console.log('❌ Error querying chat_threads:', threadError.message);
    } else if (threadSample && threadSample.length > 0) {
      console.log('📋 chat_threads columns:');
      const columns = Object.keys(threadSample[0]);
      columns.forEach(col => {
        const value = threadSample[0][col];
        console.log(`  - ${col}: ${typeof value} (sample: ${value})`);
      });
    } else {
      console.log('⚠️ chat_threads table is empty, cannot determine structure');
    }

    console.log('\n🔍 Checking chat_messages table structure...\n');

    // Get a sample from chat_messages
    const { data: messageSample, error: messageError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);

    if (messageError) {
      console.log('❌ Error querying chat_messages:', messageError.message);
    } else if (messageSample && messageSample.length > 0) {
      console.log('📋 chat_messages columns:');
      const columns = Object.keys(messageSample[0]);
      columns.forEach(col => {
        const value = messageSample[0][col];
        console.log(`  - ${col}: ${typeof value} (sample: ${value})`);
      });
    } else {
      console.log('⚠️ chat_messages table is empty, cannot determine structure');
    }

    console.log('\n🔍 Checking user_sessions table structure...\n');

    // Get a sample from user_sessions
    const { data: sessionSample, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .limit(1);

    if (sessionError) {
      console.log('❌ Error querying user_sessions:', sessionError.message);
    } else if (sessionSample && sessionSample.length > 0) {
      console.log('📋 user_sessions columns:');
      const columns = Object.keys(sessionSample[0]);
      columns.forEach(col => {
        const value = sessionSample[0][col];
        console.log(`  - ${col}: ${typeof value} (sample: ${value})`);
      });
    } else {
      console.log('⚠️ user_sessions table is empty, cannot determine structure');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkChatTablesStructure();