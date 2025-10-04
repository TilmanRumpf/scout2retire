import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: user } = await supabase.from('users').select('id').eq('username', 'ctorres').single();

const { data: threads } = await supabase.from('chat_threads').select('*');
const threadIds = threads.map(t => t.id);

const { data: counts } = await supabase.rpc('get_unread_counts', { p_thread_ids: threadIds });

console.log('ALL UNREAD COUNTS FOR CTORRES:');
counts.forEach(c => {
  if (c.unread_count > 0) {
    const t = threads.find(x => x.id === c.thread_id);
    console.log(`  Thread: ${t.topic}`);
    console.log(`  Unread: ${c.unread_count}`);
    console.log(`  Town: ${t.town_id || 'none'}`);
    console.log(`  Lounge: ${t.retirement_lounge_id || 'none'}`);
    console.log('');
  }
});

const friendThreads = threads.filter(t => t.topic?.startsWith('friend-'));
const friendCounts = counts.filter(c => {
  const t = threads.find(x => x.id === c.thread_id);
  return t?.topic?.startsWith('friend-');
});

const totalFriendUnread = friendCounts.reduce((sum, c) => sum + c.unread_count, 0);
console.log('TOTAL FRIEND UNREAD:', totalFriendUnread);

process.exit(0);
