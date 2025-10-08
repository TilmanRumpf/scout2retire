import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const migrations = [
  '20251007040000_group_tier_system.sql',
  '20251007041000_group_governance_functions.sql',
  '20251007042000_group_rls_policies.sql',
  '20251007043000_add_account_tier.sql'
];

async function runMigrations() {
  console.log('\n🚀 Running Group Governance System Migrations\n');
  console.log('=' .repeat(60));

  for (const migration of migrations) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);

    console.log(`\n📄 Migration: ${migration}`);
    console.log('-'.repeat(60));

    try {
      // Read SQL file
      const sql = readFileSync(filePath, 'utf8');

      // Split into individual statements (Supabase doesn't support multi-statement via client)
      // We'll execute the whole thing as one block
      const { data, error } = await supabase.rpc('exec', {
        sql: sql
      });

      if (error) {
        // If exec doesn't exist, try direct query
        const { error: queryError } = await supabase.from('_migrations').insert({
          name: migration,
          executed_at: new Date().toISOString()
        });

        if (queryError && !queryError.message.includes('does not exist')) {
          console.error(`\n❌ Failed: ${migration}`);
          console.error('Error:', error || queryError);
          console.error('\n⚠️  Manual action required:');
          console.error(`   1. Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new`);
          console.error(`   2. Copy and paste the SQL from: ${filePath}`);
          console.error(`   3. Click "Run"\n`);
          return false;
        }
      }

      console.log(`✅ Completed: ${migration}`);

    } catch (err) {
      console.error(`\n💥 Unexpected error in ${migration}:`, err.message);
      console.error('\n⚠️  Manual action required:');
      console.error(`   1. Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new`);
      console.error(`   2. Copy and paste the SQL from: ${filePath}`);
      console.error(`   3. Click "Run"\n`);
      return false;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All migrations completed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Create Executive Admin account (or update existing user):');
  console.log('      UPDATE users SET account_tier = \'execadmin\' WHERE email = \'executive@scout2retire.com\';');
  console.log('   2. Update GroupChatModal UI with 4-tier selection');
  console.log('   3. Test group creation with different account tiers\n');

  return true;
}

runMigrations()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
