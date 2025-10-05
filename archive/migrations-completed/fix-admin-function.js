import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
CREATE OR REPLACE FUNCTION admin_get_user_notifications(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  data JSONB,
  is_read BOOLEAN,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.message,
    n.data,
    n.is_read,
    n.read_at,
    n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
  ORDER BY n.created_at DESC;
END;
$$;
`;

const { data, error } = await supabase.rpc('query', { query: sql }).single();
if (error) {
  console.error('Error:', error);
  process.exit(1);
}
console.log('Function updated successfully');
process.exit(0);
