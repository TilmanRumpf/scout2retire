import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUnreadThreads() {
  const threadIds = [
    '85ebd18a-2e97-4eca-ac47-fa1a40e170e9',
    'cf32663f-4e6c-4530-a1b2-0e8b9c8e7f5a',
    '4723f522-8b3c-4d9e-9f1a-2c3d4e5f6a7b'
  ];

  console.log('THREADS WITH UNREAD FOR CTORRES:\n');

  for (const id of threadIds) {
    const { data: thread } = await supabase
      .from('chat_threads')
      .select('id, town_id, retirement_lounge_id')
      .eq('id', id)
      .single();

    if (!thread) {
      console.log('Thread', id.substring(0, 8), 'NOT FOUND\n');
      continue;
    }

    let type = 'FRIEND CHAT';
    let details = '';

    if (thread.town_id) {
      type = 'TOWN CHAT';
      const { data: town } = await supabase
        .from('towns')
        .select('name')
        .eq('id', thread.town_id)
        .single();
      details = `Town: ${town?.name || 'Unknown'}`;
    } else if (thread.retirement_lounge_id) {
      type = 'RETIREMENT LOUNGE';
    }

    console.log(`${type} - ${thread.id.substring(0, 8)}`);
    if (details) console.log(`  ${details}`);

    // Get the unread messages
    const { data: ctorres } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'ctorres@asshole.com')
      .single();

    const { data: readStatus } = await supabase
      .from('thread_read_status')
      .select('last_read_at')
      .eq('user_id', ctorres.id)
      .eq('thread_id', thread.id)
      .single();

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('created_at, message, user_id')
      .eq('thread_id', thread.id)
      .neq('user_id', ctorres.id)
      .order('created_at', { ascending: false });

    const unread = messages?.filter(m => {
      return !readStatus || new Date(m.created_at) > new Date(readStatus.last_read_at);
    });

    console.log(`  Unread messages: ${unread?.length || 0}`);
    unread?.forEach(m => {
      console.log(`    - ${new Date(m.created_at).toLocaleString()}: "${m.message.substring(0, 40)}"`);
    });
    console.log('');
  }
}

checkUnreadThreads().catch(console.error);
