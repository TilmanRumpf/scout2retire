import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .limit(1);

console.log('Notification columns:', data && data[0] ? Object.keys(data[0]) : 'No data');
console.log('Sample notification:', JSON.stringify(data, null, 2));
process.exit(0);
