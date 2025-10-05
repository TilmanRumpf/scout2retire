import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CTORRES_ID = '02600f37-06ab-4fa7-88e6-46caa3e1bf05';

console.log('=== MARKING ALL THREADS AS READ FOR CTORRES ===\n');

// Get all threads
const { data: allThreads } = await supabase
  .from('chat_threads')
  .select('id, topic');

console.log(`Total threads: ${allThreads.length}\n`);

for (const thread of allThreads) {
  // Upsert thread_read_status to NOW
  const { error } = await supabase
    .from('thread_read_status')
    .upsert({
      user_id: CTORRES_ID,
      thread_id: thread.id,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,thread_id'
    });

  if (error) {
    console.log(`  ERROR marking ${thread.topic} as read:`, error);
  } else {
    console.log(`  ✓ ${thread.topic}`);
  }
}

console.log('\n=== ALL THREADS MARKED AS READ ===');
process.exit(0);
