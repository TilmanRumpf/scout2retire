import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use service_role to bypass RLS for debugging
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // Get ctorres
  const { data: user } = await supabase
    .from('users')
    .select('id, username, email')
    .eq('username', 'ctorres')
    .single();

  console.log('=== CTORRES ===');
  console.log(user);

  // Get notifications
  const { data: notifs, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('\n=== NOTIFICATIONS (last 10) ===');
  if (error) console.error('Error:', error);
  else console.log(JSON.stringify(notifs, null, 2));

  // Get pending invitations
  const { data: invites } = await supabase
    .from('user_connections')
    .select('*')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'pending');

  console.log('\n=== PENDING INVITATIONS ===');
  console.log(JSON.stringify(invites, null, 2));

  process.exit(0);
}

check();
