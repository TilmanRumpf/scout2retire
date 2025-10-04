import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== DELETING ALL ORPHANED THREAD_READ_STATUS ENTRIES ===\n');

// Get all thread_read_status entries
const { data: allReadStatus } = await supabase
  .from('thread_read_status')
  .select('*');

console.log(`Total thread_read_status entries: ${allReadStatus.length}`);

// Get all valid thread IDs
const { data: allThreads } = await supabase
  .from('chat_threads')
  .select('id');

const validThreadIds = new Set(allThreads.map(t => t.id));
console.log(`Total valid thread IDs: ${validThreadIds.size}`);

// Find orphaned entries
const orphaned = allReadStatus.filter(rs => !validThreadIds.has(rs.thread_id));

console.log(`\nOrphaned entries: ${orphaned.length}`);

if (orphaned.length > 0) {
  console.log('\nOrphaned thread_read_status entries:');
  orphaned.forEach(rs => {
    console.log(`  User: ${rs.user_id.substring(0, 8)}..., Thread: ${rs.thread_id}, Last read: ${rs.last_read_at}`);
  });

  console.log('\nDeleting...');
  const orphanedIds = orphaned.map(rs => rs.id);

  const { error } = await supabase
    .from('thread_read_status')
    .delete()
    .in('id', orphanedIds);

  if (error) {
    console.log('ERROR:', error);
  } else {
    console.log(`✓ Deleted ${orphaned.length} orphaned thread_read_status entries`);
  }
} else {
  console.log('\n✓ No orphaned entries found');
}

console.log('\n=== DONE ===');
process.exit(0);
