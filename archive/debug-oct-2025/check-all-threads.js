import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: threads } = await supabase.from('chat_threads').select('id, topic, town_id, retirement_lounge_id, created_at');
console.log('Total threads:', threads?.length);
console.log('\nAll threads:');
threads?.forEach(t => {
  console.log(`  ${t.topic || 'NO TOPIC'} - town:${t.town_id || 'null'} lounge:${t.retirement_lounge_id || 'null'}`);
});

process.exit(0);
