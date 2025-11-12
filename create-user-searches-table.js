#!/usr/bin/env node
/**
 * Creates user_searches table for anonymous search analytics
 * RUN THIS: node create-user-searches-table.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable() {
  console.log('🚀 Creating user_searches table for anonymous analytics...\n');

  try {
    // Test if table already exists
    const { data: existing, error: testError } = await supabase
      .from('user_searches')
      .select('id')
      .limit(1);

    if (!testError || testError.code !== '42P01') {
      console.log('✅ Table user_searches already exists!');
      console.log('   Testing insert permission...\n');

      // Test anonymous insert
      const { data: testInsert, error: insertError } = await supabase
        .from('user_searches')
        .insert({
          search_type: 'text',
          search_term: 'test',
          results_count: 0
        })
        .select();

      if (insertError) {
        console.log('❌ Insert test failed:', insertError.message);
      } else {
        console.log('✅ Anonymous insert works!');
        console.log('   Test record:', testInsert[0]);

        // Clean up test record
        await supabase
          .from('user_searches')
          .delete()
          .eq('id', testInsert[0].id);
        console.log('   Cleaned up test record\n');
      }

      return;
    }

    console.log('📋 Table does not exist. Please run this SQL in Supabase Dashboard:\n');
    console.log('🔗 https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new\n');
    console.log('─'.repeat(80));
    console.log(`
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  search_type TEXT NOT NULL,
  search_term TEXT,
  results_count INTEGER DEFAULT 0,
  filters_applied JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address INET
);

CREATE INDEX idx_user_searches_created_at ON user_searches(created_at DESC);
CREATE INDEX idx_user_searches_user_id ON user_searches(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_user_searches_search_type ON user_searches(search_type);
CREATE INDEX idx_user_searches_search_term ON user_searches(search_term) WHERE search_term IS NOT NULL;

ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_searches_insert_anyone"
  ON user_searches FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "user_searches_select_own"
  ON user_searches FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "user_searches_select_admin"
  ON user_searches FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
    `.trim());
    console.log('─'.repeat(80));
    console.log('\n💡 After running the SQL, execute this script again to verify.\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createTable();
