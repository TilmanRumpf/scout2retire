import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== CLEANING UP DUPLICATE FRIEND THREADS ===\n');

// Get all threads, filter friend threads in JS
const { data: allThreadsRaw } = await supabase
  .from('chat_threads')
  .select('*');

const allThreads = allThreadsRaw?.filter(t =>
  t.topic &&
  t.topic.startsWith('friend-') &&
  !t.town_id &&
  !t.retirement_lounge_id
);

console.log(`Found ${allThreads?.length || 0} friend threads`);

// Group by topic to find duplicates
const byTopic = {};
allThreads?.forEach(thread => {
  if (!byTopic[thread.topic]) {
    byTopic[thread.topic] = [];
  }
  byTopic[thread.topic].push(thread);
});

// Find duplicates (topic appears more than once)
const duplicates = Object.entries(byTopic).filter(([topic, threads]) => threads.length > 1);

console.log(`Found ${duplicates.length} topics with duplicates:`);
duplicates.forEach(([topic, threads]) => {
  console.log(`  ${topic}: ${threads.length} copies`);
});

// For each duplicate, keep the oldest one (earliest created_at), delete the rest
let totalDeleted = 0;
for (const [topic, threads] of duplicates) {
  // Sort by created_at ascending (oldest first)
  threads.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  const keepThread = threads[0];
  const deleteThreads = threads.slice(1);
  
  console.log(`\n${topic}:`);
  console.log(`  KEEPING: ${keepThread.id} (created ${keepThread.created_at})`);
  
  for (const thread of deleteThreads) {
    console.log(`  DELETING: ${thread.id} (created ${thread.created_at})`);
    
    const { error } = await supabase
      .from('chat_threads')
      .delete()
      .eq('id', thread.id);
    
    if (error) {
      console.log(`    ERROR: ${error.message}`);
    } else {
      console.log(`    ✓ Deleted`);
      totalDeleted++;
    }
  }
}

console.log(`\n=== CLEANUP COMPLETE ===`);
console.log(`Deleted ${totalDeleted} duplicate threads`);
console.log(`Kept ${duplicates.length} unique threads`);

process.exit(0);
