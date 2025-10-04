import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get ctorres
const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('username', 'ctorres')
  .single();

console.log('=== CTORRES FRIENDS & UNREAD ANALYSIS ===\n');

// Get friends
const { data: friends } = await supabase
  .from('user_connections')
  .select(`
    id,
    user_id,
    friend_id,
    status,
    friend:users!user_connections_friend_id_fkey(id, username)
  `)
  .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
  .eq('status', 'accepted');

console.log('FRIENDS:', friends?.length || 0);
friends?.forEach(f => {
  const friendData = f.friend_id === user.id ? 'OTHER USER' : f.friend;
  console.log(`  - ${friendData?.username || 'Unknown'} (connection: ${f.id})`);
});

// Get all threads
const { data: threads } = await supabase
  .from('chat_threads')
  .select('*');

console.log('\nTHREADS:', threads?.length || 0);
const friendThreads = threads?.filter(t => 
  t.topic?.startsWith('friend-') && 
  !t.town_id && 
  !t.retirement_lounge_id
);

console.log('FRIEND THREADS:', friendThreads?.length || 0);
friendThreads?.forEach(t => {
  console.log(`  - ${t.topic} (thread: ${t.id})`);
});

// Get unread counts for all threads
if (threads && threads.length > 0) {
  const threadIds = threads.map(t => t.id);
  const { data: counts } = await supabase.rpc('get_unread_counts', {
    p_thread_ids: threadIds
  });

  console.log('\nUNREAD COUNTS:');
  counts?.forEach(c => {
    if (c.unread_count > 0) {
      const thread = threads.find(t => t.id === c.thread_id);
      console.log(`  - Thread ${thread?.topic || thread?.id}: ${c.unread_count} unread`);
    }
  });

  // Calculate per-friend unread
  console.log('\nPER-FRIEND UNREAD BREAKDOWN:');
  const friendUnreadMap = {};
  
  friendThreads?.forEach(thread => {
    const count = counts?.find(c => c.thread_id === thread.id)?.unread_count || 0;
    
    if (count > 0) {
      // Extract friend_id from topic
      const topicWithoutPrefix = thread.topic.replace('friend-', '');
      const ids = topicWithoutPrefix.split('-');
      const friendId = ids.find(id => id !== user.id);
      
      console.log(`  - Topic: ${thread.topic}`);
      console.log(`    IDs in topic: ${ids.join(', ')}`);
      console.log(`    Current user: ${user.id}`);
      console.log(`    Friend ID extracted: ${friendId}`);
      console.log(`    Unread: ${count}`);
      
      if (friendId) {
        friendUnreadMap[friendId] = (friendUnreadMap[friendId] || 0) + count;
      }
    }
  });

  console.log('\nFINAL PER-FRIEND MAP:');
  console.log(JSON.stringify(friendUnreadMap, null, 2));
}

process.exit(0);
