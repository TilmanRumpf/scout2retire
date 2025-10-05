import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== DELETING ORPHANED FRIEND REQUESTS ===\n');

// Get all notifications
const { data: allNotifications } = await supabase
  .from('notifications')
  .select('*')
  .in('type', ['friend_invitation', 'friend_request', 'new_friend_request', 'invitation_received']);

console.log(`Total friend request notifications: ${allNotifications?.length || 0}`);

// Get all valid user_connection IDs
const { data: allConnections } = await supabase
  .from('user_connections')
  .select('id');

const validConnectionIds = new Set(allConnections.map(c => c.id));
console.log(`Total valid user_connections: ${validConnectionIds.size}`);

// Find orphaned notifications (where data.connection_id doesn't exist)
const orphaned = (allNotifications || []).filter(n => {
  const connectionId = n.data?.connection_id;
  return connectionId && !validConnectionIds.has(connectionId);
});

console.log(`\nOrphaned notifications: ${orphaned.length}`);

if (orphaned.length > 0) {
  console.log('\nOrphaned friend request notifications:');
  orphaned.forEach(n => {
    console.log(`  ID: ${n.id}, User: ${n.user_id.substring(0, 8)}..., Connection: ${n.data?.connection_id}, Type: ${n.type}`);
  });

  console.log('\nDeleting...');
  const orphanedIds = orphaned.map(n => n.id);

  const { error } = await supabase
    .from('notifications')
    .delete()
    .in('id', orphanedIds);

  if (error) {
    console.log('ERROR:', error);
  } else {
    console.log(`✓ Deleted ${orphaned.length} orphaned friend request notifications`);
  }
} else {
  console.log('\n✓ No orphaned notifications found');
}

console.log('\n=== DONE ===');
process.exit(0);
