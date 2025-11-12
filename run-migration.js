#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.log('Usage: node run-migration.js <migration-file.sql>');
  process.exit(1);
}

const sql = readFileSync(migrationFile, 'utf8');

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: { schema: 'public' },
    auth: { persistSession: false }
  }
);

console.log(`🚀 Running migration: ${migrationFile}\n`);

// Execute SQL via Postgres REST API
const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  },
  body: JSON.stringify({ query: sql })
});

if (!response.ok) {
  console.log('❌ Migration failed via REST API, trying direct connection...\n');

  // Fallback: Show SQL for manual execution
  console.log('📋 Copy this SQL and run in Supabase SQL Editor:\n');
  console.log('─'.repeat(80));
  console.log(sql);
  console.log('─'.repeat(80));
  console.log('\n🔗 https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');
} else {
  const result = await response.json();
  console.log('✅ Migration successful!');
  console.log('Result:', result);
}
