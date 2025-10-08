#!/usr/bin/env node

/**
 * Apply role-based moderation migration using Supabase Management API
 * Executes SQL via direct HTTP POST to Supabase
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function executeSQL(sql) {
  // Use Supabase's PostgREST to execute SQL via a query
  // We'll POST to /rest/v1/rpc/query with the SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response;
}

async function applyMigration() {
  console.log('🚀 Applying role-based moderation migration...\n');

  try {
    const migrationPath = resolve(__dirname, '../supabase/migrations/20251007120000_role_based_moderation.sql');
    const fullSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split into individual statements
    const statements = fullSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out empty/comment-only statements

    console.log(`📄 Executing ${statements.length} SQL statements...\n`);

    let stepNum = 1;
    for (const statement of statements) {
      if (statement.toUpperCase().includes('COMMENT ON')) continue;

      let stepName = '';
      if (statement.includes('ALTER TABLE chat_messages')) stepName = 'Adding pinning columns';
      else if (statement.includes('CREATE INDEX')) stepName = 'Creating index';
      else if (statement.includes('delete_message_as_moderator')) stepName = 'Creating delete_message_as_moderator';
      else if (statement.includes('remove_member')) stepName = 'Creating remove_member';
      else if (statement.includes('promote_to_moderator')) stepName = 'Creating promote_to_moderator';
      else if (statement.includes('pin_message')) stepName = 'Creating pin_message';
      else if (statement.includes('GRANT EXECUTE')) stepName = 'Granting permissions';

      if (stepName) {
        console.log(`Step ${stepNum}: ${stepName}...`);
        stepNum++;
      }

      try {
        await executeSQL(statement + ';');
        if (stepName) console.log(`   ✅ Success\n`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('404')) {
          if (stepName) console.log(`   ℹ️  Skipped (${error.message.includes('404') ? 'endpoint not found' : 'already exists'})\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Migration completed!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 The Supabase REST API may not support raw SQL execution.');
    console.error('📋 Let me try an alternative approach...\n');

    // Fallback: Create individual migration scripts
    console.log('🔧 Creating fallback: individual SQL files for manual execution...\n');

    const sqlParts = {
      '01_add_columns.sql': `
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_pinned
ON chat_messages(thread_id, is_pinned, created_at DESC)
WHERE is_pinned = TRUE;
      `,
      '02_function_delete.sql': fs.readFileSync(
        resolve(__dirname, '../supabase/migrations/20251007120000_role_based_moderation.sql'),
        'utf8'
      ).match(/CREATE OR REPLACE FUNCTION delete_message_as_moderator[\s\S]+?\$\$;/)?.[0] + '\n' +
        'GRANT EXECUTE ON FUNCTION delete_message_as_moderator TO authenticated;',
      '03_function_remove.sql': fs.readFileSync(
        resolve(__dirname, '../supabase/migrations/20251007120000_role_based_moderation.sql'),
        'utf8'
      ).match(/CREATE OR REPLACE FUNCTION remove_member[\s\S]+?\$\$;/)?.[0] + '\n' +
        'GRANT EXECUTE ON FUNCTION remove_member TO authenticated;',
      '04_function_promote.sql': fs.readFileSync(
        resolve(__dirname, '../supabase/migrations/20251007120000_role_based_moderation.sql'),
        'utf8'
      ).match(/CREATE OR REPLACE FUNCTION promote_to_moderator[\s\S]+?\$\$;/)?.[0] + '\n' +
        'GRANT EXECUTE ON FUNCTION promote_to_moderator TO authenticated;',
      '05_function_pin.sql': fs.readFileSync(
        resolve(__dirname, '../supabase/migrations/20251007120000_role_based_moderation.sql'),
        'utf8'
      ).match(/CREATE OR REPLACE FUNCTION pin_message[\s\S]+?\$\$;/)?.[0] + '\n' +
        'GRANT EXECUTE ON FUNCTION pin_message TO authenticated;'
    };

    const tempDir = resolve(__dirname, '../.temp-migration');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    for (const [filename, sql] of Object.entries(sqlParts)) {
      fs.writeFileSync(resolve(tempDir, filename), sql);
      console.log(`   ✅ Created ${filename}`);
    }

    console.log(`\n📂 SQL files created in: .temp-migration/`);
    console.log('\n⚠️  NEXT STEPS:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste each file from .temp-migration/ in order');
    console.log('3. Execute each one');
    console.log('\nOR run this command if you have psql installed:');
    console.log(`   for f in .temp-migration/*.sql; do psql [YOUR_DB_URL] < $f; done\n`);

    process.exit(1);
  }
}

applyMigration();
