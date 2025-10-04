import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: allThreads } = await supabase
  .from('chat_threads')
  .select('id, topic, created_at')
  .order('created_at', { ascending: false });

console.log('=== ALL THREADS ===');
allThreads.forEach(t => {
  console.log(`${t.id} - ${t.topic}`);
});

console.log(`\nTotal: ${allThreads.length} threads`);

// Check if the orphaned thread IDs exist
const orphanedIds = [
  '38a5fbfd-8a33-4bcd-8689-3acd08a1f44b',
  'ac5c3ec0-625c-4c3b-95c2-7ddc8dc244bf',
  '821cada3-a3ae-4aaa-9173-acf953367881'
];

console.log('\n=== CHECKING ORPHANED IDs ===');
for (const id of orphanedIds) {
  const thread = allThreads.find(t => t.id === id);
  if (thread) {
    console.log(`${id} - EXISTS: ${thread.topic}`);
  } else {
    console.log(`${id} - DOES NOT EXIST (orphaned)`);
  }
}

process.exit(0);
