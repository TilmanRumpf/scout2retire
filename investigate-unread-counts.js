import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigate() {
  console.log('\n🔍 INVESTIGATING UNREAD COUNT ISSUE\n');
  console.log('=' .repeat(80));

  // 1. Get user IDs
  console.log('\n1️⃣ GETTING USER IDs');
  console.log('-'.repeat(80));

  const { data: ctorres, error: ctorresError } = await supabase
    .from('users')
    .select('id, email, full_name, username')
    .eq('email', 'ctorres@asshole.com')
    .single();

  const { data: tilman, error: tilmanError } = await supabase
    .from('users')
    .select('id, email, full_name, username')
    .eq('email', 'tilman.rumpf@gmail.com')
    .single();

  if (ctorresError || !ctorres) {
    console.error('❌ Could not find ctorres:', ctorresError);
    return;
  }
  if (tilmanError || !tilman) {
    console.error('❌ Could not find tilman:', tilmanError);
    return;
  }

  console.log(`✅ ctorres: ${ctorres.username} / ${ctorres.full_name} (${ctorres.id})`);
  console.log(`✅ tilman: ${tilman.username} / ${tilman.full_name} (${tilman.id})`);

  // 2. Get all chat threads
  console.log('\n2️⃣ GETTING ALL CHAT THREADS');
  console.log('-'.repeat(80));

  const { data: threads, error: threadsError } = await supabase
    .from('chat_threads')
    .select('id, town_id, created_at')
    .order('created_at', { ascending: false });

  if (threadsError) {
    console.error('❌ Error getting threads:', threadsError);
    return;
  }

  console.log(`✅ Found ${threads.length} threads`);

  // 3. For each user, analyze their unread counts
  for (const user of [ctorres, tilman]) {
    console.log('\n' + '='.repeat(80));
    console.log(`\n👤 ANALYZING: ${user.username} / ${user.full_name} (${user.email})`);
    console.log('='.repeat(80));

    // Get user's read status for all threads
    const { data: readStatuses, error: readError } = await supabase
      .from('thread_read_status')
      .select('thread_id, last_read_at')
      .eq('user_id', user.id);

    if (readError) {
      console.error('❌ Error getting read statuses:', readError);
      continue;
    }

    console.log(`\n📊 Read status records: ${readStatuses.length}`);

    // Create a map for quick lookup
    const readMap = new Map(readStatuses.map(r => [r.thread_id, r.last_read_at]));

    // Analyze each thread
    let totalUnread = 0;
    const unreadDetails = [];

    for (const thread of threads) {
      // Get all messages in this thread
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('id, user_id, created_at, content')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error(`❌ Error getting messages for thread ${thread.id}:`, msgError);
        continue;
      }

      if (messages.length === 0) continue;

      // Get last read timestamp
      const lastReadAt = readMap.get(thread.id);

      // Count unread messages (messages from OTHER users, after last_read_at)
      const unreadMessages = messages.filter(msg => {
        const isNotOwnMessage = msg.user_id !== user.id;
        const isAfterLastRead = !lastReadAt || new Date(msg.created_at) > new Date(lastReadAt);
        return isNotOwnMessage && isAfterLastRead;
      });

      if (unreadMessages.length > 0) {
        totalUnread += unreadMessages.length;

        const otherUserMessages = messages.filter(m => m.user_id !== user.id);
        const ownMessages = messages.filter(m => m.user_id === user.id);

        unreadDetails.push({
          thread_id: thread.id,
          total_messages: messages.length,
          other_user_messages: otherUserMessages.length,
          own_messages: ownMessages.length,
          unread_count: unreadMessages.length,
          last_read_at: lastReadAt || 'NEVER',
          latest_message_time: messages[messages.length - 1]?.created_at,
          latest_message_from: messages[messages.length - 1]?.user_id === user.id ? 'SELF' : 'OTHER',
          unread_message_details: unreadMessages.map(m => ({
            from: m.user_id === user.id ? 'SELF' : 'OTHER',
            time: m.created_at,
            preview: m.content?.substring(0, 50) || '(no content)'
          }))
        });
      }
    }

    console.log(`\n📬 TOTAL UNREAD MESSAGES: ${totalUnread}`);

    if (unreadDetails.length > 0) {
      console.log(`\n📝 THREADS WITH UNREAD MESSAGES (${unreadDetails.length}):`);
      unreadDetails.forEach((detail, idx) => {
        console.log(`\n  Thread ${idx + 1}: ${detail.thread_id.substring(0, 8)}...`);
        console.log(`    Total messages: ${detail.total_messages} (${detail.other_user_messages} from others, ${detail.own_messages} from self)`);
        console.log(`    Unread count: ${detail.unread_count}`);
        console.log(`    Last read at: ${detail.last_read_at}`);
        console.log(`    Latest message: ${detail.latest_message_time} (from ${detail.latest_message_from})`);
        console.log(`    Unread messages:`);
        detail.unread_message_details.forEach((msg, i) => {
          console.log(`      ${i + 1}. ${msg.time} (from ${msg.from}): ${msg.preview}`);
        });
      });
    } else {
      console.log('\n✅ No unread messages');
    }

    // 4. Now test the RPC function
    console.log(`\n4️⃣ TESTING get_unread_counts RPC (simulating as ${user.username})`);
    console.log('-'.repeat(80));

    const threadIds = threads.map(t => t.id);

    // We need to impersonate the user - create a client with their auth
    // Since we can't actually auth as them, we'll manually run the query logic
    console.log('\n📊 Manual simulation of get_unread_counts logic:');

    const simulatedResults = [];
    for (const thread of threads) {
      const lastRead = readMap.get(thread.id);

      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
        .neq('user_id', user.id);

      let unreadCount = 0;
      if (lastRead) {
        const { count: afterReadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
          .neq('user_id', user.id)
          .gt('created_at', lastRead);
        unreadCount = afterReadCount || 0;
      } else {
        unreadCount = count || 0;
      }

      if (unreadCount > 0) {
        simulatedResults.push({
          thread_id: thread.id.substring(0, 8) + '...',
          unread_count: unreadCount,
          last_read_at: lastRead || 'NEVER'
        });
      }
    }

    console.log('\n📊 Simulated RPC Results:');
    if (simulatedResults.length > 0) {
      console.table(simulatedResults);
      console.log(`\n🔢 TOTAL UNREAD (via simulation): ${simulatedResults.reduce((sum, r) => sum + r.unread_count, 0)}`);
    } else {
      console.log('✅ No unread messages');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n🎯 DIAGNOSIS:');
  console.log('='.repeat(80));
  console.log('Check the data above:');
  console.log('1. Does ctorres HAVE unread messages she should see?');
  console.log('2. Are the "unread" messages actually FROM her (not TO her)?');
  console.log('3. Is her last_read_at timestamp correct?');
  console.log('4. Compare with tilman - why does his work?');
  console.log('\n');
}

investigate().catch(console.error);
