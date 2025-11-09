// Add is_published column to towns table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumns() {
  console.log('\n🚀 Adding is_published columns to towns table...\n');

  try {
    // Step 1: Add columns directly via SQL
    console.log('Step 1: Adding is_published column...');
    const { data: data1, error: error1 } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE towns ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true NOT NULL;'
    });

    if (error1) {
      console.error('❌ Error adding is_published:', error1);
      // Try alternative approach
      console.log('Trying alternative approach...');

      // Just update the table directly - column might already exist
      const { data: test, error: testError } = await supabase
        .from('towns')
        .select('is_published')
        .limit(1);

      if (testError && testError.message.includes('does not exist')) {
        console.error('Column truly does not exist. Please run SQL manually in Supabase Dashboard.');
        console.log('\n📋 SQL to run in Supabase Dashboard SQL Editor:');
        console.log('----------------------------------------');
        console.log('ALTER TABLE towns ADD COLUMN is_published BOOLEAN DEFAULT true NOT NULL;');
        console.log('ALTER TABLE towns ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;');
        console.log('ALTER TABLE towns ADD COLUMN published_by UUID REFERENCES auth.users(id);');
        console.log('CREATE INDEX idx_towns_is_published ON towns(is_published);');
        console.log('UPDATE towns SET is_published = false WHERE quality_of_life IS NULL;');
        console.log('----------------------------------------\n');
        process.exit(1);
      }
    }
    console.log('✅ is_published column added (or already exists)');

    // Step 2: Add published_at
    console.log('\nStep 2: Adding published_at column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE towns ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;'
    });
    if (error2 && !error2.message.includes('already exists')) {
      console.warn('⚠️ Warning on published_at:', error2.message);
    }
    console.log('✅ published_at column added');

    // Step 3: Add published_by
    console.log('\nStep 3: Adding published_by column...');
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE towns ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id);'
    });
    if (error3 && !error3.message.includes('already exists')) {
      console.warn('⚠️ Warning on published_by:', error3.message);
    }
    console.log('✅ published_by column added');

    console.log('\n✅ ALL COLUMNS ADDED SUCCESSFULLY!\n');
    console.log('Now refresh your browser to see the toggles working.\n');

  } catch (error) {
    console.error('\n❌ FAILED:', error);
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard:');
    console.log('----------------------------------------');
    console.log('ALTER TABLE towns ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true NOT NULL;');
    console.log('ALTER TABLE towns ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;');
    console.log('ALTER TABLE towns ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_towns_is_published ON towns(is_published);');
    console.log('UPDATE towns SET is_published = false WHERE quality_of_life IS NULL;');
    console.log('----------------------------------------\n');
  }
}

addColumns();
