import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Test with ANON key (like the browser uses)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('=== TESTING RPC AS CTORRES (ANON KEY) ===\n');

// Sign in as ctorres
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'ctorres@asshole.com',
  password: 'Torres2030!'
});

if (authError) {
  console.error('Login failed:', authError.message);
  process.exit(1);
}

console.log('✓ Logged in as:', authData.user.email);

// Get threads
const { data: threads } = await supabase
  .from('chat_threads')
  .select('*');

console.log('✓ Threads retrieved:', threads?.length);

const friendThreads = threads?.filter(t => t.topic?.startsWith('friend-'));
console.log('✓ Friend threads:', friendThreads?.length);

// Call RPC function
const threadIds = threads?.map(t => t.id) || [];
const { data: counts, error: rpcError } = await supabase.rpc('get_unread_counts', {
  p_thread_ids: threadIds
});

if (rpcError) {
  console.error('RPC error:', rpcError);
  process.exit(1);
}

console.log('\n=== UNREAD COUNTS FROM RPC ===');
counts.forEach(c => {
  const thread = threads.find(t => t.id === c.thread_id);
  if (c.unread_count > 0 || thread?.topic?.startsWith('friend-')) {
    console.log(`${thread?.topic}: ${c.unread_count} unread`);
  }
});

// Calculate friendsTotal exactly like Chat.jsx does
const countsMap = {};
counts.forEach(item => {
  countsMap[item.thread_id] = item.unread_count;
});

let friendsTotal = 0;
threads.forEach(thread => {
  const unreadCount = countsMap[thread.id] || 0;
  
  if (thread.town_id) {
    // skip
  } else if (thread.topic === 'Lounge' || thread.retirement_lounge_id) {
    // skip
  } else {
    friendsTotal += unreadCount;
  }
});

console.log('\n=== CALCULATED friendsTotal:', friendsTotal, '===');

await supabase.auth.signOut();
process.exit(0);
