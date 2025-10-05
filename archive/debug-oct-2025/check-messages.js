import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMessages() {
  // Get threads with messages
  const { data: threads } = await supabase
    .from('chat_threads')
    .select('id, town_id')
    .limit(5);

  for (const thread of threads) {
    const { data: messages, count } = await supabase
      .from('chat_messages')
      .select('id, user_id, created_at', { count: 'exact' })
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: false })
      .limit(5);

    console.log(`Thread ${thread.id}:`);
    console.log(`  Total messages: ${count}`);
    console.log(`  Recent messages:`, messages?.map(m => ({
      user: m.user_id.substring(0, 8),
      time: new Date(m.created_at).toLocaleString()
    })));
    console.log('');
  }

  // Check read status
  const { data: readStatuses } = await supabase
    .from('thread_read_status')
    .select('*');

  console.log('Read Statuses:');
  console.log(JSON.stringify(readStatuses, null, 2));
}

checkMessages().catch(console.error);
