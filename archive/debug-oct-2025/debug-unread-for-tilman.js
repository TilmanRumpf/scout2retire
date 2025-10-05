import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TILMAN_ID = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';

console.log('=== DEBUGGING UNREAD COUNT FOR TILMAN ===\n');

// Get all threads
const { data: allThreads } = await supabase
  .from('chat_threads')
  .select('*');

console.log(`Total threads: ${allThreads.length}\n`);

// Get Tilman's thread_read_status
const { data: readStatus } = await supabase
  .from('thread_read_status')
  .select('*')
  .eq('user_id', TILMAN_ID);

const readStatusMap = {};
readStatus.forEach(rs => {
  readStatusMap[rs.thread_id] = rs.last_read_at;
});

console.log(`Tilman has ${readStatus.length} read status entries\n`);

// For each thread, manually calculate unread count
for (const thread of allThreads) {
  const lastReadAt = readStatusMap[thread.id];

  let query = supabase
    .from('chat_messages')
    .select('id, user_id, created_at', { count: 'exact', head: false })
    .eq('thread_id', thread.id)
    .neq('user_id', TILMAN_ID); // Don't count Tilman's own messages

  if (lastReadAt) {
    query = query.gt('created_at', lastReadAt);
  }

  const { data: messages, count, error } = await query;

  if (error) {
    console.log(`ERROR for ${thread.topic}:`, error);
    continue;
  }

  if (count > 0) {
    console.log(`⚠️  ${thread.topic}:`);
    console.log(`   Last read: ${lastReadAt || 'NEVER'}`);
    console.log(`   Unread count: ${count}`);
    console.log(`   Messages:`);
    messages.forEach(m => {
      console.log(`     - ${m.created_at} by ${m.user_id.substring(0, 8)}...`);
    });
    console.log('');
  }
}

console.log('✅ DONE');
process.exit(0);
