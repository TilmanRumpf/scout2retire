-- Admin/Debug functions to access data bypassing RLS
-- These should ONLY be used for debugging and admin tools
-- SECURITY DEFINER means they run with elevated privileges

-- Get user by username (for debugging)
CREATE OR REPLACE FUNCTION admin_get_user_by_username(p_username TEXT)
RETURNS TABLE(id UUID, username TEXT, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.email
  FROM users u
  WHERE u.username = p_username;
END;
$$;

-- Get all notifications for a user (for debugging)
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

-- Get pending invitations for a user (for debugging)
CREATE OR REPLACE FUNCTION admin_get_pending_invitations(p_user_id UUID)
RETURNS SETOF user_connections
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_connections
  WHERE (user_id = p_user_id OR friend_id = p_user_id)
  AND status = 'pending';
END;
$$;

-- Get all users (for debugging - limit 100)
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE(id UUID, username TEXT, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.email, u.created_at
  FROM users u
  ORDER BY u.created_at DESC
  LIMIT 100;
END;
$$;

COMMENT ON FUNCTION admin_get_user_by_username IS 'Debug function: Get user by username (bypasses RLS)';
COMMENT ON FUNCTION admin_get_user_notifications IS 'Debug function: Get all notifications for a user (bypasses RLS)';
COMMENT ON FUNCTION admin_get_pending_invitations IS 'Debug function: Get pending invitations (bypasses RLS)';
COMMENT ON FUNCTION admin_get_all_users IS 'Debug function: List all users (bypasses RLS)';
