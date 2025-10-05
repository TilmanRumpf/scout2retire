import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CTORRES_ID = '02600f37-06ab-4fa7-88e6-46caa3e1bf05';

console.log('=== DEBUGGING RPC FOR ROME THREAD ===\n');

// Get Rome thread
const { data: rome } = await supabase
  .from('chat_threads')
  .select('*')
  .eq('topic', 'Rome')
  .single();

console.log('Rome thread:', rome.id);

// Check thread_read_status
const { data: readStatus } = await supabase
  .from('thread_read_status')
  .select('*')
  .eq('user_id', CTORRES_ID)
  .eq('thread_id', rome.id);

console.log('\nthread_read_status for ctorres + Rome:');
console.log(readStatus.length === 0 ? '  NONE (never read)' : `  last_read_at: ${readStatus[0].last_read_at}`);

// Get messages in Rome thread
const { data: messages } = await supabase
  .from('chat_messages')
  .select('*')
  .eq('thread_id', rome.id)
  .order('created_at', { ascending: true });

console.log(`\nMessages in Rome thread: ${messages.length}`);
messages.forEach(m => {
  const fromCtorres = m.user_id === CTORRES_ID ? ' (FROM CTORRES)' : '';
  console.log(`  ${m.created_at} - ${m.message.substring(0, 50)}${fromCtorres}`);
});

// Manually calculate what unread count SHOULD be
const messagesFromOthers = messages.filter(m => m.user_id !== CTORRES_ID);
console.log(`\nMessages from others: ${messagesFromOthers.length}`);
console.log('Expected unread count: 1 (ctorres never read this thread)');

// Now call the RPC function
const { data: rpcResult } = await supabase.rpc('get_unread_counts', {
  p_thread_ids: [rome.id]
});

console.log('\nRPC result:');
console.log(`  unread_count: ${rpcResult[0].unread_count}`);

if (rpcResult[0].unread_count === 0) {
  console.log('\n❌ BUG: RPC returns 0 but should return 1');
  console.log('The RPC function is broken when called with service_role key');
  console.log('It uses auth.uid() which is NULL with service_role');
} else {
  console.log('\n✓ RPC is correct');
}

process.exit(0);
