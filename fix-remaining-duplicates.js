import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== FIXING REMAINING DUPLICATES ===\n');

const duplicates = [
  {
    topic: 'friend-3b1212f1-e30a-4ae1-8520-a69d02b0da78-83d285b2-b21b-4d13-a1a1-6d51b6733d52',
    keepId: 'b2efc03f-0109-40fe-af39-d358ef4e78be',
    deleteId: 'cf32663f-fa02-4599-9a4c-b89a917e0d29'
  },
  {
    topic: 'friend-d1039857-71e2-4562-86aa-1f0b4a0c17c8-dad3aadb-4256-40f6-b05a-4d6bdf3ec3bc',
    keepId: 'ffb1dd6c-13c7-418f-aa97-d9d2b89a642c',
    deleteId: '4723f522-497c-4ce5-89c8-2f9e6d6352d3'
  }
];

for (const dup of duplicates) {
  console.log(`\n${dup.topic}:`);
  console.log(`  Moving messages from ${dup.deleteId} to ${dup.keepId}`);
  
  const { error: updateError } = await supabase
    .from('chat_messages')
    .update({ thread_id: dup.keepId })
    .eq('thread_id', dup.deleteId);
  
  if (updateError) {
    console.log(`  ERROR moving messages: ${updateError.message}`);
    continue;
  }
  
  console.log(`  ✓ Messages moved`);
  
  const { error: deleteError } = await supabase
    .from('chat_threads')
    .delete()
    .eq('id', dup.deleteId);
  
  if (deleteError) {
    console.log(`  ERROR deleting thread: ${deleteError.message}`);
  } else {
    console.log(`  ✓ Thread deleted`);
  }
}

console.log('\n=== DONE ===');
process.exit(0);
