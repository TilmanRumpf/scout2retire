import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== DELETING ALL FRIEND CHATS AND REQUESTS ===\n');

// 1. Delete all friend chat messages
console.log('1. Deleting all friend chat messages...');
const { data: friendThreads } = await supabase
  .from('chat_threads')
  .select('id')
  .like('topic', 'friend-%');

if (friendThreads && friendThreads.length > 0) {
  const friendThreadIds = friendThreads.map(t => t.id);

  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .in('thread_id', friendThreadIds);

  if (messagesError) {
    console.log('   ERROR deleting messages:', messagesError);
  } else {
    console.log(`   ✓ Deleted messages from ${friendThreadIds.length} friend threads`);
  }

  // 2. Delete thread_read_status for friend threads
  console.log('\n2. Deleting thread_read_status for friend threads...');
  const { error: readStatusError } = await supabase
    .from('thread_read_status')
    .delete()
    .in('thread_id', friendThreadIds);

  if (readStatusError) {
    console.log('   ERROR deleting read status:', readStatusError);
  } else {
    console.log('   ✓ Deleted read status entries');
  }

  // 3. Delete friend threads
  console.log('\n3. Deleting friend chat threads...');
  const { error: threadsError } = await supabase
    .from('chat_threads')
    .delete()
    .in('id', friendThreadIds);

  if (threadsError) {
    console.log('   ERROR deleting threads:', threadsError);
  } else {
    console.log(`   ✓ Deleted ${friendThreadIds.length} friend threads`);
  }
} else {
  console.log('   No friend threads found');
}

// 4. Delete all friend request notifications
console.log('\n4. Deleting all friend request notifications...');
const { error: notifError } = await supabase
  .from('notifications')
  .delete()
  .in('type', ['friend_invitation', 'friend_request', 'new_friend_request', 'invitation_received', 'invitation_accepted']);

if (notifError) {
  console.log('   ERROR deleting notifications:', notifError);
} else {
  console.log('   ✓ Deleted all friend request notifications');
}

// 5. Delete all user connections
console.log('\n5. Deleting all user connections...');
const { error: connectionsError } = await supabase
  .from('user_connections')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

if (connectionsError) {
  console.log('   ERROR deleting connections:', connectionsError);
} else {
  console.log('   ✓ Deleted all user connections');
}

console.log('\n=== ALL FRIEND DATA DELETED ===');
process.exit(0);
