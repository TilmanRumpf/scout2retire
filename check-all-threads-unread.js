import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllThreads() {
  // Get users
  const { data: ctorres } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'ctorres@asshole.com')
    .single();

  const { data: tilman } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'tilman.rumpf@gmail.com')
    .single();

  // Get all threads
  const { data: threads } = await supabase
    .from('chat_threads')
    .select('id');

  let ctorresTotal = 0;
  let tilmanTotal = 0;

  console.log('CHECKING ALL THREADS:\n');

  for (const thread of threads) {
    // Get messages
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('user_id, created_at')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: false });

    if (!msgs || msgs.length === 0) continue;

    // Get read status
    const { data: ctorresRead } = await supabase
      .from('thread_read_status')
      .select('last_read_at')
      .eq('user_id', ctorres.id)
      .eq('thread_id', thread.id)
      .single();

    const { data: tilmanRead } = await supabase
      .from('thread_read_status')
      .select('last_read_at')
      .eq('user_id', tilman.id)
      .eq('thread_id', thread.id)
      .single();

    // Calculate unread
    const ctorresUnread = msgs.filter(m => {
      const isFromOthers = m.user_id !== ctorres.id;
      const isAfterLastRead = !ctorresRead || new Date(m.created_at) > new Date(ctorresRead.last_read_at);
      return isFromOthers && isAfterLastRead;
    }).length;

    const tilmanUnread = msgs.filter(m => {
      const isFromOthers = m.user_id !== tilman.id;
      const isAfterLastRead = !tilmanRead || new Date(m.created_at) > new Date(tilmanRead.last_read_at);
      return isFromOthers && isAfterLastRead;
    }).length;

    if (ctorresUnread > 0 || tilmanUnread > 0) {
      console.log(`Thread ${thread.id.substring(0, 8)}:`);
      console.log(`  Ctorres unread: ${ctorresUnread}`);
      console.log(`  Tilman unread: ${tilmanUnread}\n`);
    }

    ctorresTotal += ctorresUnread;
    tilmanTotal += tilmanUnread;
  }

  console.log('='.repeat(50));
  console.log(`TOTAL FOR CTORRES: ${ctorresTotal} unread`);
  console.log(`TOTAL FOR TILMAN: ${tilmanTotal} unread`);
  console.log('='.repeat(50));
}

checkAllThreads().catch(console.error);
