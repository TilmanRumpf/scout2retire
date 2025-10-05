import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyProductionRPC() {
  console.log('🔍 Verifying RPC in production as authenticated user\n');

  // Sign in as ctorres
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'ctorres@asshole.com',
    password: '9m3GjY7mHwm93SN'
  });

  if (authError) {
    console.log('❌ Auth failed:', authError.message);
    return;
  }

  console.log('✅ Authenticated as:', auth.user.email);
  console.log('User ID:', auth.user.id);
  console.log('');

  // Try calling the RPC
  const { data: threads } = await supabase
    .from('chat_threads')
    .select('id')
    .limit(5);

  console.log('Fetched', threads?.length || 0, 'threads');

  if (!threads || threads.length === 0) {
    console.log('No threads to test with');
    return;
  }

  const threadIds = threads.map(t => t.id);

  console.log('Calling get_unread_counts...');
  const { data, error } = await supabase.rpc('get_unread_counts', {
    p_thread_ids: threadIds
  });

  if (error) {
    console.log('❌ RPC ERROR:', error.message);
    console.log('Code:', error.code);
    console.log('Details:', error.details);
    console.log('Hint:', error.hint);
  } else {
    const total = data.reduce((sum, item) => sum + item.unread_count, 0);
    console.log('✅ RPC SUCCESS!');
    console.log('Total unread:', total);
    console.log('Sample:', data.slice(0, 3));
  }
}

verifyProductionRPC().catch(console.error);
