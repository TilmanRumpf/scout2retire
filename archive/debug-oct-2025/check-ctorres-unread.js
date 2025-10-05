import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== CHECKING CTORRES UNREAD ===\n');

// Get ctorres user
const { data: ctorres } = await supabase
  .from('users')
  .select('id, username, email')
  .eq('username', 'ctorres')
  .single();

console.log('User:', ctorres.username, ctorres.email, ctorres.id);

// Get ALL threads
const { data: allThreads } = await supabase
  .from('chat_threads')
  .select('*');

console.log(`\nTotal threads: ${allThreads.length}`);

// Call RPC to get unread counts
const threadIds = allThreads.map(t => t.id);
const { data: counts, error } = await supabase.rpc('get_unread_counts', {
  p_thread_ids: threadIds
});

if (error) {
  console.log('RPC ERROR:', error);
} else {
  console.log('\n=== UNREAD COUNTS (from RPC) ===');
  const unreadThreads = counts.filter(c => c.unread_count > 0);

  if (unreadThreads.length === 0) {
    console.log('✓ All threads have 0 unread');
  } else {
    unreadThreads.forEach(c => {
      const thread = allThreads.find(t => t.id === c.thread_id);
      console.log(`⚠️  ${thread?.topic}: ${c.unread_count} unread`);
    });
  }

  const total = counts.reduce((sum, c) => sum + c.unread_count, 0);
  console.log(`\nTOTAL UNREAD: ${total}`);
}

// Check thread_read_status for ctorres
const { data: readStatus } = await supabase
  .from('thread_read_status')
  .select('*')
  .eq('user_id', ctorres.id);

console.log(`\n=== CTORRES THREAD_READ_STATUS ===`);
console.log(`Entries: ${readStatus.length}`);
readStatus.forEach(rs => {
  const thread = allThreads.find(t => t.id === rs.thread_id);
  console.log(`  ${thread?.topic || rs.thread_id}: last read ${rs.last_read_at}`);
});

// Check for messages
console.log('\n=== CHECKING FOR ACTUAL MESSAGES ===');
for (const thread of allThreads) {
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id, user_id, created_at')
    .eq('thread_id', thread.id)
    .neq('user_id', ctorres.id) // Not from ctorres
    .order('created_at', { ascending: false });

  if (messages && messages.length > 0) {
    console.log(`\n${thread.topic}:`);
    console.log(`  ${messages.length} messages from others`);
    const readEntry = readStatus.find(rs => rs.thread_id === thread.id);
    if (readEntry) {
      const unreadMsgs = messages.filter(m => new Date(m.created_at) > new Date(readEntry.last_read_at));
      console.log(`  ${unreadMsgs.length} unread (after ${readEntry.last_read_at})`);
    } else {
      console.log(`  ${messages.length} unread (never read)`);
    }
  }
}

console.log('\n=== DONE ===');
process.exit(0);
