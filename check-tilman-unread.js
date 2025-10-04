import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: user } = await supabase
  .from('users')
  .select('id, username, email')
  .eq('id', '83d285b2-b21b-4d13-a1a1-6d51b6733d52')
  .single();

console.log('User:', user.username, user.email);

const { data: threads } = await supabase.from('chat_threads').select('*');
const threadIds = threads.map(t => t.id);

const { data: counts } = await supabase.rpc('get_unread_counts', { p_thread_ids: threadIds });

console.log('\nUnread messages:');
counts.filter(c => c.unread_count > 0).forEach(c => {
  const t = threads.find(x => x.id === c.thread_id);
  console.log(`  ${t.topic}: ${c.unread_count} unread`);
});

const friendThreads = threads.filter(t => t.topic?.startsWith('friend-'));
const friendCounts = counts.filter(c => {
  const t = threads.find(x => x.id === c.thread_id);
  return t?.topic?.startsWith('friend-');
});

const totalFriendUnread = friendCounts.reduce((sum, c) => sum + c.unread_count, 0);
console.log('\nTotal friend unread for Tilman:', totalFriendUnread);

process.exit(0);
