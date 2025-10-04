import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: user } = await supabase.from('users').select('id').eq('username', 'ctorres').single();
console.log('User:', user.id);

const { data: connections } = await supabase.from('user_connections').select('*').or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq('status', 'accepted');
console.log('\nAccepted friends:', connections?.length || 0);

const { data: threads } = await supabase.from('chat_threads').select('*');
const friendThreads = threads?.filter(t => t.topic?.startsWith('friend-'));
console.log('Friend threads:', friendThreads?.length || 0);
friendThreads?.forEach(t => console.log('  -', t.topic));

if (threads?.length > 0) {
  const { data: counts } = await supabase.rpc('get_unread_counts', { p_thread_ids: threads.map(t => t.id) });
  console.log('\nUnread messages:');
  counts?.filter(c => c.unread_count > 0).forEach(c => {
    const t = threads.find(x => x.id === c.thread_id);
    console.log(`  - ${t?.topic}: ${c.unread_count} unread`);
  });
}

process.exit(0);
