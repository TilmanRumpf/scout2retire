import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugWhoSeesWhat() {
  // Get users
  const { data: ctorres } = await supabase
    .from('users')
    .select('id, email, username')
    .eq('email', 'ctorres@asshole.com')
    .single();

  const { data: tilman } = await supabase
    .from('users')
    .select('id, email, username')
    .eq('email', 'tilman.rumpf@gmail.com')
    .single();

  console.log('CTORRES:', ctorres.id.substring(0, 8), '-', ctorres.email);
  console.log('TILMAN:', tilman.id.substring(0, 8), '-', tilman.email);
  console.log('');

  const threadId = '38a5fbfd-8a33-4bcd-8689-3acd08a1f44b';

  // Get recent messages
  const { data: msgs } = await supabase
    .from('chat_messages')
    .select('user_id, created_at, message')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('RECENT MESSAGES IN THREAD:');
  msgs.forEach(m => {
    const sender = m.user_id === ctorres.id ? 'CTORRES' : m.user_id === tilman.id ? 'TILMAN' : 'OTHER';
    console.log('  ', sender, ':', new Date(m.created_at).toISOString(), '-', m.message.substring(0, 30));
  });

  // Get read status
  const { data: ctorresRead } = await supabase
    .from('thread_read_status')
    .select('*')
    .eq('user_id', ctorres.id)
    .eq('thread_id', threadId)
    .single();

  const { data: tilmanRead } = await supabase
    .from('thread_read_status')
    .select('*')
    .eq('user_id', tilman.id)
    .eq('thread_id', threadId)
    .single();

  console.log('\nCTORRES LAST READ:', ctorresRead?.last_read_at || 'NEVER');
  console.log('TILMAN LAST READ:', tilmanRead?.last_read_at || 'NEVER');

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

  console.log('\n*** CTORRES SHOULD SEE:', ctorresUnread, 'UNREAD ***');
  console.log('*** TILMAN SHOULD SEE:', tilmanUnread, 'UNREAD ***');
}

debugWhoSeesWhat().catch(console.error);
