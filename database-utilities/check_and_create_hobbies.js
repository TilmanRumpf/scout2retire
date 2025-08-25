// Check current schema and create hobbies tables step by step
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkAndCreateHobbies() {
  try {
    console.log('🔍 Checking current database state...');
    
    // Check if hobbies table exists
    const { data: hobbiesData, error: hobbiesError } = await supabase
      .from('hobbies')
      .select('*')
      .limit(1);
    
    if (hobbiesError) {
      console.log('❌ Hobbies table does not exist, need to create it');
      console.log('Error:', hobbiesError.message);
    } else {
      console.log('✅ Hobbies table exists, checking contents...');
      console.log(`Found ${hobbiesData.length} hobbies`);
    }
    
    // Check available tables by trying each one
    const tables = ['towns', 'users', 'user_preferences', 'onboarding_progress'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' not accessible`);
      }
    }
    
    // Since we can't create tables via client, let's provide the exact SQL
    console.log('\n📝 To create the hobbies tables, execute this SQL in the Supabase SQL Editor:');
    console.log('=' .repeat(80));
    
    const createTableSQL = `
-- Create hobbies table
CREATE TABLE IF NOT EXISTS hobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('activity', 'interest', 'custom')),
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_hobbies junction table  
CREATE TABLE IF NOT EXISTS user_hobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, hobby_id)
);

-- Create town_hobbies junction table
CREATE TABLE IF NOT EXISTS town_hobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
    hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(town_id, hobby_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hobbies_category ON hobbies(category);
CREATE INDEX IF NOT EXISTS idx_hobbies_name ON hobbies(name);
CREATE INDEX IF NOT EXISTS idx_user_hobbies_user_id ON user_hobbies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hobbies_hobby_id ON user_hobbies(hobby_id);
CREATE INDEX IF NOT EXISTS idx_town_hobbies_town_id ON town_hobbies(town_id);
CREATE INDEX IF NOT EXISTS idx_town_hobbies_hobby_id ON town_hobbies(hobby_id);

-- Enable RLS
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE town_hobbies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Hobbies are viewable by everyone" ON hobbies;
CREATE POLICY "Hobbies are viewable by everyone" ON hobbies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own hobbies" ON user_hobbies;
CREATE POLICY "Users can view their own hobbies" ON user_hobbies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own hobbies" ON user_hobbies;
CREATE POLICY "Users can insert their own hobbies" ON user_hobbies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own hobbies" ON user_hobbies;
CREATE POLICY "Users can update their own hobbies" ON user_hobbies FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own hobbies" ON user_hobbies;
CREATE POLICY "Users can delete their own hobbies" ON user_hobbies FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Town hobbies are viewable by everyone" ON town_hobbies;
CREATE POLICY "Town hobbies are viewable by everyone" ON town_hobbies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage town hobbies" ON town_hobbies;
CREATE POLICY "Authenticated users can manage town hobbies" ON town_hobbies FOR ALL USING (auth.role() = 'authenticated');
`;
    
    console.log(createTableSQL);
    console.log('=' .repeat(80));
    
  } catch (error) {
    console.error('💥 Error checking database:', error);
  }
}

checkAndCreateHobbies();