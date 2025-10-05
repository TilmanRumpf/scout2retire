import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUnreadSystem() {
  console.log('🔍 Testing Unread Message System\n');

  // 1. Check thread_read_status table
  console.log('1. Checking thread_read_status table...');
  const { data: readStatus, error: readError } = await supabase
    .from('thread_read_status')
    .select('*')
    .limit(5);

  if (readError) {
    console.error('❌ Error:', readError.message);
  } else {
    console.log(`✅ Table exists. ${readStatus.length} read status records found\n`);
  }

  // 2. Get threads
  console.log('2. Getting chat threads...');
  const { data: threads, error: threadsError } = await supabase
    .from('chat_threads')
    .select('id, town_id')
    .limit(10);

  if (threadsError) {
    console.error('❌ Error:', threadsError.message);
    return;
  }
  console.log(`✅ Found ${threads.length} threads\n`);

  if (threads.length === 0) {
    console.log('⚠️  No threads to test with');
    return;
  }

  // 3. Test get_unread_counts function
  console.log('3. Testing get_unread_counts RPC function...');
  const threadIds = threads.map(t => t.id);
  const { data: counts, error: countError } = await supabase.rpc('get_unread_counts', {
    p_thread_ids: threadIds
  });

  if (countError) {
    console.error('❌ RPC Error:', countError.message);
    console.error('Code:', countError.code);
    console.error('Details:', countError.details);
    console.error('Hint:', countError.hint);
  } else {
    console.log(`✅ Function works! Returned ${counts?.length || 0} results`);
    console.log('Sample results:', JSON.stringify(counts?.slice(0, 3), null, 2));

    const total = counts?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0;
    console.log(`Total unread: ${total}\n`);
  }

  // 4. Test mark_thread_read function
  if (threads.length > 0) {
    console.log('4. Testing mark_thread_read RPC function...');
    const { error: markError } = await supabase.rpc('mark_thread_read', {
      p_thread_id: threads[0].id
    });

    if (markError) {
      console.error('❌ RPC Error:', markError.message);
    } else {
      console.log('✅ Function works!\n');
    }
  }

  console.log('✅ All tests complete!');
}

testUnreadSystem().catch(err => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});
