import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzkyMDgsImV4cCI6MjAyNTM3OTIwOH0.rCwLxNMgfvJKLPQFx5fpVfm3wGnELV5XvVjQHMJi-po'
);

// Get users
const { data, error } = await supabase
  .from('users')
  .select('id, email, created_at')
  .limit(5);

if (error) {
  console.error('Error fetching users:', error);
} else {
  console.log('Users found:', data);
}
