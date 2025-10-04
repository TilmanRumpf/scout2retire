import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkNotifications() {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('username', 'ctorres')
    .single();

  console.log('=== CTORRES USER ID ===');
  console.log(user?.id);

  const { data: notifs } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n=== NOTIFICATIONS ===');
  console.log(JSON.stringify(notifs, null, 2));

  const { data: invites } = await supabase
    .from('user_connections')
    .select('*')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'pending');

  console.log('\n=== PENDING INVITATIONS ===');
  console.log(JSON.stringify(invites, null, 2));

  process.exit(0);
}

checkNotifications();
