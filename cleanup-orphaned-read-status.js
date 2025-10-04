import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== CLEANING UP ORPHANED THREAD READ STATUS ===\n');

// Get all thread_read_status entries
const { data: allReadStatus } = await supabase
  .from('thread_read_status')
  .select('*');

console.log(`Found ${allReadStatus.length} thread_read_status entries`);

// Get all existing thread IDs
const { data: allThreads } = await supabase
  .from('chat_threads')
  .select('id');

const validThreadIds = new Set(allThreads.map(t => t.id));

// Find orphaned entries
const orphaned = allReadStatus.filter(rs => !validThreadIds.has(rs.thread_id));

console.log(`\nFound ${orphaned.length} orphaned entries (threads don't exist anymore):`);
orphaned.forEach(rs => {
  console.log(`  User: ${rs.user_id}, Thread: ${rs.thread_id}, Last read: ${rs.last_read_at}`);
});

if (orphaned.length > 0) {
  console.log('\nDeleting orphaned entries...');
  const orphanedIds = orphaned.map(rs => rs.id);

  const { error } = await supabase
    .from('thread_read_status')
    .delete()
    .in('id', orphanedIds);

  if (error) {
    console.log('ERROR:', error);
  } else {
    console.log(`✓ Deleted ${orphaned.length} orphaned entries`);
  }
} else {
  console.log('\n✓ No orphaned entries found');
}

console.log('\n=== DONE ===');
process.exit(0);
