/**
 * Add updated_by column to towns table for tracking last modifier
 * Run with: node database-utilities/add-updated-by-column.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addUpdatedByColumn() {
  console.log('👤 Adding updated_by column to towns table...');

  // Add the column
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Add updated_by column if it doesn't exist
      ALTER TABLE towns
      ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

      -- Add index for better query performance
      CREATE INDEX IF NOT EXISTS idx_towns_updated_by ON towns(updated_by);

      -- Add comment
      COMMENT ON COLUMN towns.updated_by IS 'User ID of person who last modified this town record';
    `
  });

  if (error) {
    console.error('❌ Error adding column:', error);
    return;
  }

  console.log('✅ Column added successfully!');
  console.log('\n📦 Column details:');
  console.log('- Column: updated_by');
  console.log('- Type: UUID (references auth.users)');
  console.log('- Purpose: Track who last modified each town');
  console.log('- Auto-populated: Yes (by app code on updates)');
}

addUpdatedByColumn();
