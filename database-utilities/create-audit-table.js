/**
 * Create town_field_audits table for storing audit results
 * Run this with: node database-utilities/create-audit-table.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createAuditTable() {
  console.log('Creating town_field_audits table...');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      -- Create town_field_audits table
      CREATE TABLE IF NOT EXISTS town_field_audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
        field_name TEXT NOT NULL,
        confidence TEXT NOT NULL CHECK (confidence IN ('high', 'limited', 'low', 'unknown', 'not_editable')),
        audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        audited_by UUID REFERENCES auth.users(id),
        UNIQUE(town_id, field_name)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_town_field_audits_town_id ON town_field_audits(town_id);
      CREATE INDEX IF NOT EXISTS idx_town_field_audits_audited_at ON town_field_audits(audited_at DESC);

      -- Enable RLS
      ALTER TABLE town_field_audits ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Anyone can view audit results" ON town_field_audits;
      DROP POLICY IF EXISTS "Authenticated users can audit" ON town_field_audits;

      -- Create policies
      CREATE POLICY "Anyone can view audit results"
        ON town_field_audits
        FOR SELECT
        USING (true);

      CREATE POLICY "Authenticated users can audit"
        ON town_field_audits
        FOR ALL
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
    `
  });

  if (error) {
    console.error('Error creating table:', error);

    // Try direct query as fallback
    console.log('Trying direct query...');
    const { error: directError } = await supabase.from('town_field_audits').select('id').limit(1);

    if (directError && directError.code === '42P01') {
      console.error('Table does not exist and could not be created.');
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:\n');
      console.log(`
CREATE TABLE IF NOT EXISTS town_field_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'limited', 'low', 'unknown', 'not_editable')),
  audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  audited_by UUID,
  UNIQUE(town_id, field_name)
);

CREATE INDEX IF NOT EXISTS idx_town_field_audits_town_id ON town_field_audits(town_id);
CREATE INDEX IF NOT EXISTS idx_town_field_audits_audited_at ON town_field_audits(audited_at DESC);

ALTER TABLE town_field_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view audit results"
  ON town_field_audits FOR SELECT USING (true);

CREATE POLICY "Authenticated users can audit"
  ON town_field_audits FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
      `);
    } else {
      console.log('✅ Table already exists!');
    }
  } else {
    console.log('✅ Table created successfully!');
  }
}

createAuditTable().catch(console.error);
