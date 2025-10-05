import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use ANON key - safe for scripts, complies with RLS via SECURITY DEFINER functions
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugNotifications() {
  console.log('=== DEBUGGING NOTIFICATION SYSTEM ===\n');

  // Get ctorres user via RPC (bypasses RLS via SECURITY DEFINER)
  const { data: users, error: userError } = await supabase.rpc('admin_get_user_by_username', {
    p_username: 'ctorres'
  });

  if (userError) {
    console.error('Error getting user:', userError);
    process.exit(1);
  }

  const user = users[0];
  console.log('=== USER: ctorres ===');
  console.log(`ID: ${user.id}`);
  console.log(`Email: ${user.email}\n`);

  // Get notifications via RPC
  const { data: notifs, error: notifsError } = await supabase.rpc('admin_get_user_notifications', {
    p_user_id: user.id
  });

  if (notifsError) {
    console.error('Error getting notifications:', notifsError);
  } else {
    console.log(`=== NOTIFICATIONS (${notifs.length} total) ===`);
    notifs.forEach((n, i) => {
      console.log(`\n[${i + 1}] ${n.title}`);
      console.log(`    Type: ${n.type}`);
      console.log(`    Message: ${n.message}`);
      console.log(`    Is Read: ${n.is_read}`);
      console.log(`    Read At: ${n.read_at || 'Not read'}`);
      console.log(`    Data: ${n.data ? JSON.stringify(n.data) : 'No data'}`);
      console.log(`    Created: ${n.created_at}`);
    });
  }

  // Get pending invitations via RPC
  const { data: invites, error: invitesError } = await supabase.rpc('admin_get_pending_invitations', {
    p_user_id: user.id
  });

  if (invitesError) {
    console.error('\nError getting invitations:', invitesError);
  } else {
    console.log(`\n\n=== PENDING INVITATIONS (${invites.length} total) ===`);
    if (invites.length === 0) {
      console.log('No pending invitations');
    } else {
      invites.forEach((inv, i) => {
        console.log(`\n[${i + 1}] Connection ID: ${inv.id}`);
        console.log(`    From User: ${inv.user_id}`);
        console.log(`    To User: ${inv.friend_id}`);
        console.log(`    Status: ${inv.status}`);
        console.log(`    Message: ${inv.message || 'No message'}`);
        console.log(`    Created: ${inv.created_at}`);
      });
    }
  }

  console.log('\n=== END DEBUG ===');
  process.exit(0);
}

debugNotifications();
