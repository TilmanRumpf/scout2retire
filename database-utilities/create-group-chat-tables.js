import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createGroupChatTables() {
  console.log('🔧 Creating group chat tables...\n');

  try {
    // Step 1: Add is_group column to chat_threads
    console.log('1️⃣ Adding is_group column to chat_threads...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE;`
    });

    if (alterError) {
      console.error('❌ Error adding is_group column:', alterError);
    } else {
      console.log('✅ is_group column added to chat_threads\n');
    }

    // Step 2: Create group_chat_members table
    console.log('2️⃣ Creating group_chat_members table...');
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS group_chat_members (
          id BIGSERIAL PRIMARY KEY,
          thread_id BIGINT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          joined_at TIMESTAMPTZ DEFAULT NOW(),
          role TEXT DEFAULT 'member',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(thread_id, user_id)
        );
      `
    });

    if (createTableError) {
      console.error('❌ Error creating table:', createTableError);
    } else {
      console.log('✅ group_chat_members table created\n');
    }

    // Step 3: Create indexes
    console.log('3️⃣ Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_group_chat_members_thread_id ON group_chat_members(thread_id);',
      'CREATE INDEX IF NOT EXISTS idx_group_chat_members_user_id ON group_chat_members(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_threads_is_group ON chat_threads(is_group);'
    ];

    for (const indexSql of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (error) {
        console.error('❌ Error creating index:', error);
      }
    }
    console.log('✅ Indexes created\n');

    // Step 4: Enable RLS
    console.log('4️⃣ Enabling RLS on group_chat_members...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE group_chat_members ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled\n');
    }

    // Step 5: Create RLS policies
    console.log('5️⃣ Creating RLS policies...');

    const policies = [
      {
        name: 'Users can view members of their groups',
        sql: `
          CREATE POLICY "Users can view members of their groups"
            ON group_chat_members
            FOR SELECT
            USING (
              EXISTS (
                SELECT 1 FROM group_chat_members gcm
                WHERE gcm.thread_id = group_chat_members.thread_id
                AND gcm.user_id = auth.uid()
              )
            );
        `
      },
      {
        name: 'Users can add members to their groups',
        sql: `
          CREATE POLICY "Users can add members to their groups"
            ON group_chat_members
            FOR INSERT
            WITH CHECK (
              EXISTS (
                SELECT 1 FROM chat_threads ct
                WHERE ct.id = thread_id
                AND (ct.created_by = auth.uid() OR EXISTS (
                  SELECT 1 FROM group_chat_members gcm
                  WHERE gcm.thread_id = thread_id
                  AND gcm.user_id = auth.uid()
                  AND gcm.role = 'admin'
                ))
              )
            );
        `
      },
      {
        name: 'Admins can remove members from groups',
        sql: `
          CREATE POLICY "Admins can remove members from groups"
            ON group_chat_members
            FOR DELETE
            USING (
              EXISTS (
                SELECT 1 FROM group_chat_members gcm
                WHERE gcm.thread_id = group_chat_members.thread_id
                AND gcm.user_id = auth.uid()
                AND gcm.role = 'admin'
              )
            );
        `
      },
      {
        name: 'Users can leave groups themselves',
        sql: `
          CREATE POLICY "Users can leave groups themselves"
            ON group_chat_members
            FOR DELETE
            USING (user_id = auth.uid());
        `
      },
      {
        name: 'Members can update their own membership',
        sql: `
          CREATE POLICY "Members can update their own membership"
            ON group_chat_members
            FOR UPDATE
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid() AND role = OLD.role);
        `
      }
    ];

    for (const policy of policies) {
      // Drop policy if it exists first
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy.name}" ON group_chat_members;`
      });

      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error) {
        console.error(`❌ Error creating policy "${policy.name}":`, error);
      } else {
        console.log(`✅ Created policy: ${policy.name}`);
      }
    }

    console.log('\n🎉 Group chat tables created successfully!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

createGroupChatTables();
