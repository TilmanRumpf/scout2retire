import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== CHECKING THREAD READ STATUS ===\n');

// Get Tilman's user ID
const { data: tilman } = await supabase
  .from('users')
  .select('id, username, email')
  .eq('id', '83d285b2-b21b-4d13-a1a1-6d51b6733d52')
  .single();

console.log('User:', tilman.username, tilman.email, tilman.id);

// Get all friend threads
const { data: threads } = await supabase
  .from('chat_threads')
  .select('id, topic, created_at')
  .like('topic', 'friend-%')
  .order('created_at', { ascending: false });

console.log('\n=== ALL FRIEND THREADS ===');
threads.forEach(t => {
  console.log(`  ${t.topic} (${t.id})`);
});

// Get thread_read_status for Tilman
const { data: readStatus } = await supabase
  .from('thread_read_status')
  .select('*')
  .eq('user_id', tilman.id);

console.log('\n=== THREAD READ STATUS FOR TILMAN ===');
if (!readStatus || readStatus.length === 0) {
  console.log('  NO read status entries!');
} else {
  readStatus.forEach(rs => {
    const thread = threads.find(t => t.id === rs.thread_id);
    console.log(`  Thread: ${thread?.topic || rs.thread_id}`);
    console.log(`  Last read: ${rs.last_read_at}`);
    console.log('');
  });
}

// Get messages in friend threads
console.log('=== MESSAGES IN FRIEND THREADS ===');
for (const thread of threads) {
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id, user_id, created_at, message')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: false });

  if (messages && messages.length > 0) {
    console.log(`\nThread: ${thread.topic}`);
    messages.forEach(m => {
      console.log(`  ${m.created_at}: [${m.user_id === tilman.id ? 'TILMAN' : 'OTHER'}] ${m.message.substring(0, 50)}`);
    });
  }
}

// NOW SIMULATE THE RPC FUNCTION
console.log('\n\n=== SIMULATING RPC FUNCTION ===');
const threadIds = threads.map(t => t.id);
const { data: counts, error } = await supabase.rpc('get_unread_counts', {
  p_thread_ids: threadIds
});

if (error) {
  console.log('ERROR:', error);
} else {
  console.log('\nRPC Results (with service_role - no auth context):');
  counts.forEach(c => {
    const thread = threads.find(t => t.id === c.thread_id);
    console.log(`  ${thread?.topic}: ${c.unread_count} unread`);
  });

  const totalUnread = counts.reduce((sum, c) => sum + c.unread_count, 0);
  console.log(`\nTOTAL FRIEND UNREAD (service_role): ${totalUnread}`);
}

process.exit(0);
