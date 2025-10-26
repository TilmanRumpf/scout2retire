#!/usr/bin/env node
/**
 * Check what Scotty tables/columns actually exist
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkScottyTables() {
  console.log('🔍 Checking Scotty tables and columns\n');

  // Check scotty_conversations table
  console.log('📊 scotty_conversations table:');
  console.log('-'.repeat(60));

  try {
    const { data: convData, error: convError } = await supabase
      .from('scotty_conversations')
      .select('*')
      .limit(1);

    if (convError && convError.code === '42P01') {
      console.log('   ❌ Table does not exist');
    } else if (convError) {
      console.log(`   ⚠️  Error: ${convError.message}`);
    } else {
      console.log('   ✅ Table exists with columns:');
      if (convData && convData.length > 0) {
        Object.keys(convData[0]).forEach(col => {
          console.log(`      - ${col}`);
        });
      } else {
        // Try to get column info another way
        const { data: cols } = await supabase
          .from('scotty_conversations')
          .select()
          .limit(0);
        console.log('   (No data, unable to list columns)');
      }
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // Check scotty_messages table
  console.log('\n📊 scotty_messages table:');
  console.log('-'.repeat(60));

  try {
    const { data: msgData, error: msgError } = await supabase
      .from('scotty_messages')
      .select('*')
      .limit(1);

    if (msgError && msgError.code === '42P01') {
      console.log('   ❌ Table does not exist');
    } else if (msgError) {
      console.log(`   ⚠️  Error: ${msgError.message}`);
    } else {
      console.log('   ✅ Table exists with columns:');
      if (msgData && msgData.length > 0) {
        Object.keys(msgData[0]).forEach(col => {
          console.log(`      - ${col}`);
        });
      } else {
        console.log('   (No data, unable to list columns)');
      }
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // Check scotty_chat_usage table (paywall tracking)
  console.log('\n📊 scotty_chat_usage table:');
  console.log('-'.repeat(60));

  try {
    const { data: usageData, error: usageError } = await supabase
      .from('scotty_chat_usage')
      .select('*')
      .limit(1);

    if (usageError && usageError.code === '42P01') {
      console.log('   ❌ Table does not exist');
    } else if (usageError) {
      console.log(`   ⚠️  Error: ${usageError.message}`);
    } else {
      console.log('   ✅ Table exists with columns:');
      if (usageData && usageData.length > 0) {
        Object.keys(usageData[0]).forEach(col => {
          console.log(`      - ${col}`);
        });
      } else {
        console.log('   (No data in table)');
      }
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  console.log('\n✅ Check complete');
}

checkScottyTables().catch(console.error);