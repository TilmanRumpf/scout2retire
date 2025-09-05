#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAuditTable() {
  console.log('Creating audit trail table directly...\n');
  
  // First, let's check if the table already exists
  const { data: existingTables, error: checkError } = await supabase
    .from('towns')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.error('Error connecting to database:', checkError);
    return;
  }
  
  console.log('✅ Database connection successful');
  
  // Try to select from audit table to see if it exists
  const { data: auditCheck, error: auditError } = await supabase
    .from('town_data_audit')
    .select('id')
    .limit(1);
  
  if (!auditError) {
    console.log('✅ Audit table already exists!');
    
    // Show current stats
    const { count } = await supabase
      .from('town_data_audit')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Current audit records: ${count || 0}`);
    return;
  }
  
  console.log('Table does not exist, will create via SQL file.');
  console.log('\nPlease run the following commands:');
  console.log('1. cd /Users/tilmanrumpf/Desktop/scout2retire');
  console.log('2. npx supabase db push');
  console.log('\nOr apply the migration manually in Supabase dashboard.');
  
  // Show the SQL for manual application
  console.log('\n📋 SQL to run in Supabase SQL Editor:');
  console.log('----------------------------------------');
  console.log(`
CREATE TABLE IF NOT EXISTS town_data_audit (
  id SERIAL PRIMARY KEY,
  town_id INTEGER REFERENCES towns(id) ON DELETE CASCADE,
  column_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  data_source TEXT,
  enrichment_method TEXT,
  cost_usd DECIMAL(10,6),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  operator TEXT DEFAULT 'unified-enrichment',
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  rollback_id INTEGER REFERENCES town_data_audit(id),
  batch_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_town_id ON town_data_audit(town_id);
CREATE INDEX IF NOT EXISTS idx_audit_column ON town_data_audit(column_name);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON town_data_audit(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_batch ON town_data_audit(batch_id);
CREATE INDEX IF NOT EXISTS idx_audit_success ON town_data_audit(success);
  `);
}

createAuditTable().catch(console.error);