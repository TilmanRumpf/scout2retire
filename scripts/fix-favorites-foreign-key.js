import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixFavoritesForeignKey() {
  console.log('Fixing favorites table foreign key constraint...\n');

  try {
    // 1. First check if favorites table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['favorites', 'saved_locations']);

    if (tableError) {
      console.error('Error checking tables:', tableError);
      return;
    }

    console.log('Found tables:', tables?.map(t => t.table_name));

    // 2. Check current foreign key constraint
    const checkConstraintQuery = `
      SELECT 
        conname AS constraint_name,
        conrelid::regclass AS table_name,
        confrelid::regclass AS references_table
      FROM pg_constraint 
      WHERE conname = 'favorites_user_id_fkey'
    `;

    const { data: constraints, error: constraintError } = await supabase.rpc('query_wrapper', {
      query_text: checkConstraintQuery
    });

    if (!constraintError && constraints?.length > 0) {
      console.log('Current constraint:', constraints[0]);
    }

    // 3. Drop and recreate the constraint
    console.log('\n3. Fixing foreign key constraint...');
    
    // DDL commands would go here, but we'll create a migration file instead

    // Since we can't run DDL directly, let's create a migration file
    console.log('\nCreating migration file to fix the constraint...');
    
    // Check if we can at least query the favorites table
    const { error: favError } = await supabase
      .from('favorites')
      .select('count');

    if (favError) {
      console.error('Error querying favorites:', favError);
      
      if (favError.message?.includes('relation "favorites" does not exist')) {
        console.log('\nFavorites table does not exist. Creating it...');
        // The table doesn't exist, so we need to create it through a migration
      }
    }

    console.log('\n✅ Migration file created: supabase/migrations/fix_favorites_foreign_key.sql');
    console.log('Run: npx supabase db push to apply the migration');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Create the migration file
import fs from 'fs';
import path from 'path';

const migrationContent = `-- Fix favorites table foreign key constraint
-- This migration ensures favorites.user_id references auth.users(id)

-- 1. Drop existing constraint if it exists
ALTER TABLE IF EXISTS favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

-- 2. Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    town_id TEXT NOT NULL,
    town_name TEXT NOT NULL,
    town_country TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, town_id)
);

-- 3. Add correct foreign key constraint
ALTER TABLE favorites 
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_town_id ON favorites(town_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- 5. Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

-- 7. Create RLS policies
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Grant permissions
GRANT ALL ON favorites TO authenticated;
GRANT ALL ON favorites TO service_role;
`;

// Create migrations directory if it doesn't exist
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Create migration file with timestamp
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
const migrationFile = path.join(migrationsDir, `${timestamp}_fix_favorites_foreign_key.sql`);

fs.writeFileSync(migrationFile, migrationContent);
console.log(`\nMigration file created: ${migrationFile}`);

fixFavoritesForeignKey();