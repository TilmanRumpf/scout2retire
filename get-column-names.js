#!/usr/bin/env node

// GET EXACT COLUMN NAMES FOR RLS FIX

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Tables we need to fix
const TABLES_TO_CHECK = [
  'user_connections',
  'blocked_users',
  'user_blocks',
  'friendships',
  'retirement_schedule',
  'user_likes',
  'chat_messages',
  'direct_messages',
  'chat_threads',
  'scotty_conversations',
  'scotty_messages',
  'thread_read_status',
  'notifications',
  'chat_favorites',
  'country_likes',
  'discovery_views',
  'onboarding_responses',
  'user_hobbies',
  'user_preferences',
  'favorites',
  'user_interactions',
  'query_logs',
  'scotty_chat_usage'
];

async function checkTableColumns() {
  console.log('🔍 CHECKING EXACT COLUMN NAMES FOR ALL TABLES');
  console.log('='.repeat(80));
  console.log('');

  const tableInfo = {};

  for (const tableName of TABLES_TO_CHECK) {
    console.log(`\n📋 TABLE: ${tableName}`);
    console.log('-'.repeat(40));

    try {
      // Try to get table structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('not found')) {
          console.log('   ❌ Table does not exist');
          continue;
        }
      }

      // Query information schema for ALL columns to understand structure
      const { data: allColumns, error: allColError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT
            column_name,
            data_type
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `
      });

      if (allColumns && allColumns.length > 0) {
        const userColumns = allColumns.filter(col =>
          col.column_name.includes('user') ||
          col.column_name.includes('sender') ||
          col.column_name.includes('receiver') ||
          col.column_name.includes('friend') ||
          col.column_name.includes('requester') ||
          col.column_name.includes('liker') ||
          col.column_name.includes('liked') ||
          col.column_name.includes('blocker') ||
          col.column_name.includes('blocked') ||
          col.column_name.includes('created_by') ||
          col.column_name === 'from_id' ||
          col.column_name === 'to_id' ||
          col.column_name === 'follower_id' ||
          col.column_name === 'following_id'
        );

        if (userColumns.length > 0) {
          console.log('   ✅ USER COLUMNS FOUND:');
          userColumns.forEach(col => {
            console.log(`      ${col.column_name} (${col.data_type})`);
          });

          tableInfo[tableName] = userColumns.map(c => c.column_name);
        } else {
          console.log('   ⚠️ No user-related columns found');
          console.log('   All columns:', allColumns.map(c => c.column_name).join(', '));
        }
      }

    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY - TABLES WITH USER COLUMNS:\n');

  Object.entries(tableInfo).forEach(([table, columns]) => {
    console.log(`${table}:`);
    columns.forEach(col => {
      console.log(`  - ${col}`);
    });
  });

  console.log('\n✅ Use these exact column names in RLS policies!');
}

checkTableColumns().catch(console.error);