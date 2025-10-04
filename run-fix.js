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
  is_read BOOLEAN,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  link TEXT
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
    n.is_read,
    n.read_at,
    n.created_at,
    n.link
  FROM notifications n
  WHERE n.user_id = p_user_id
  ORDER BY n.created_at DESC;
END;
$$;
`;

const { error } = await supabase.rpc('exec', { sql });
console.log(error ? `Error: ${JSON.stringify(error)}` : 'Function updated successfully');
process.exit(0);
