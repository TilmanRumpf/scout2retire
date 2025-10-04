import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Create client with anon key (like browser)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('=== TESTING RPC WITH AUTHENTICATED USER ===\n');

// Sign in as Tilman
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'tilman.rumpf@gmail.com',
  password: 'testing123'
});

if (authError) {
  console.log('Auth error:', authError);
  process.exit(1);
}

console.log('Signed in as:', authData.user.email, authData.user.id);

// Get all threads
const { data: threads } = await supabase
  .from('chat_threads')
  .select('id, topic');

console.log(`\nTotal threads: ${threads.length}`);
threads.forEach(t => console.log(`  ${t.id.substring(0, 8)}... - ${t.topic}`));

// Call RPC (with auth context)
const threadIds = threads.map(t => t.id);
const { data: counts, error: countsError } = await supabase.rpc('get_unread_counts', {
  p_thread_ids: threadIds
});

if (countsError) {
  console.log('\nRPC ERROR:', countsError);
} else {
  console.log(`\nRPC returned ${counts.length} results:`);
  counts.forEach(c => {
    const thread = threads.find(t => t.id === c.thread_id);
    if (c.unread_count > 0) {
      console.log(`  ⚠️  ${thread?.topic}: ${c.unread_count} UNREAD`);
    } else {
      console.log(`  ✓ ${thread?.topic}: ${c.unread_count}`);
    }
  });

  const total = counts.reduce((sum, c) => sum + c.unread_count, 0);
  console.log(`\n📊 TOTAL UNREAD: ${total}`);
}

await supabase.auth.signOut();
process.exit(0);
