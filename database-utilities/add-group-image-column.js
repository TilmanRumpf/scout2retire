/**
 * Add group_image_url column to chat_threads table
 * Run with: node database-utilities/add-group-image-column.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addGroupImageColumn() {
  console.log('🖼️  Adding group_image_url column to chat_threads...');

  // Add the column
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE chat_threads
      ADD COLUMN IF NOT EXISTS group_image_url TEXT;

      COMMENT ON COLUMN chat_threads.group_image_url IS 'URL to group chat logo/avatar image stored in Supabase Storage';
    `
  });

  if (error) {
    console.error('❌ Error adding column:', error);
    return;
  }

  console.log('✅ Column added successfully!');
  console.log('\n📦 Next steps:');
  console.log('1. Go to Supabase Dashboard → Storage');
  console.log('2. Create bucket: "group-avatars" (make it Public)');
  console.log('3. Storage policies will be auto-created by Supabase');
}

addGroupImageColumn();
