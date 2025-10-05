import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUnreadLogic() {
  const threadId = '38a5fbfd-8a33-4bcd-8689-3acd08a1f44b';
  const userId = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';

  console.log('Checking unread for ctorres\n');

  const { data: readStatus } = await supabase
    .from('thread_read_status')
    .select('*')
    .eq('user_id', userId)
    .eq('thread_id', threadId)
    .single();

  console.log('Read status:', readStatus);
  console.log('Last read:', readStatus?.last_read_at || 'NEVER\n');

  const { data: allMessages } = await supabase
    .from('chat_messages')
    .select('id, user_id, created_at, message')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: false });

  console.log(`\nTotal messages: ${allMessages.length}\n`);

  const unreadMessages = allMessages.filter(m => {
    const isFromOthers = m.user_id !== userId;
    const isAfterLastRead = !readStatus?.last_read_at || new Date(m.created_at) > new Date(readStatus.last_read_at);
    return isFromOthers && isAfterLastRead;
  });

  console.log(`Unread for ctorres: ${unreadMessages.length}`);
  unreadMessages.forEach(m => {
    console.log(`  ${new Date(m.created_at).toLocaleString()}: ${m.message.substring(0, 40)}`);
  });
}

checkUnreadLogic().catch(console.error);
