#!/usr/bin/env node
/**
 * Query the actual definitions of views to understand their structure
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function queryViewDefinitions() {
  console.log('🔍 Querying view definitions from database\n');

  const viewNames = [
    'user_geographic_distribution',
    'user_favorites_with_towns',
    'scotty_analytics',
    'scotty_topics',
    'town_summaries',
    'scotty_mentioned_towns'
  ];

  for (const viewName of viewNames) {
    console.log(`\n📋 View: ${viewName}`);
    console.log('─'.repeat(60));

    // Try to get sample data from the view to understand its structure
    try {
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log('   Columns:');
        Object.keys(data[0]).forEach(col => {
          const value = data[0][col];
          const type = value === null ? 'null' : typeof value;
          console.log(`   - ${col} (${type})`);
        });
      } else {
        console.log('   ⚠️  No data in view');
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  console.log('\n✅ Query complete');
}

queryViewDefinitions().catch(console.error);