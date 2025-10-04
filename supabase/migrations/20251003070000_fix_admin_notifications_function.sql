-- Fix admin_get_user_notifications to match actual schema (data JSONB not link TEXT)
-- Drop first since we can't change return type
DROP FUNCTION IF EXISTS admin_get_user_notifications(UUID);

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
