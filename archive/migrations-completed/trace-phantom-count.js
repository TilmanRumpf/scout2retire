import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== TRACING PHANTOM FRIEND COUNT ===\n');

// Get ctorres ID
const { data: ctorresUser } = await supabase
  .from('users')
  .select('id, username')
  .eq('username', 'ctorres')
  .single();

console.log('1. Current user (ctorres):', ctorresUser.id);

// Get ALL threads
const { data: allThreads } = await supabase
  .from('chat_threads')
  .select('*');

console.log('\n2. Total threads in database:', allThreads.length);

// Get unread counts for ALL threads
const threadIds = allThreads.map(t => t.id);
const { data: allCounts } = await supabase.rpc('get_unread_counts', {
  p_thread_ids: threadIds
});

console.log('\n3. Threads with unread > 0:');
const unreadThreads = allCounts.filter(c => c.unread_count > 0);
unreadThreads.forEach(c => {
  const thread = allThreads.find(t => t.id === c.thread_id);
  console.log('  Thread:', thread.topic);
  console.log('  Unread:', c.unread_count);
  console.log('  Town:', thread.town_id || 'null');
  console.log('  Lounge:', thread.retirement_lounge_id || 'null');
  console.log('');
});

// Simulate the Chat.jsx logic EXACTLY
console.log('4. Simulating Chat.jsx loadUnreadCounts logic:');

const countsMap = {};
allCounts.forEach(item => {
  countsMap[item.thread_id] = item.unread_count;
});

let friendsTotal = 0;
allThreads.forEach(thread => {
  const unreadCount = countsMap[thread.id] || 0;
  
  if (!thread.town_id && !thread.retirement_lounge_id && thread.topic !== 'Lounge') {
    console.log(`  Counting thread: ${thread.topic} = ${unreadCount} unread`);
    friendsTotal += unreadCount;
  }
});

console.log('\n5. FINAL friendsTotal:', friendsTotal);
console.log('\nIf this is 2, then the logic is counting non-friend threads as friends');
console.log('If this is 0, then the UI state is not updating');

process.exit(0);
