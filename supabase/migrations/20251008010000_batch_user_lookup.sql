-- Performance optimization: Batch user lookup function
-- Replaces N individual get_user_by_id calls with 1 batch call

CREATE OR REPLACE FUNCTION get_users_by_ids(p_user_ids UUID[])
RETURNS TABLE (
  id UUID,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username
  FROM users u
  WHERE u.id = ANY(p_user_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION get_users_by_ids TO authenticated;

COMMENT ON FUNCTION get_users_by_ids IS 'Batch fetch usernames for multiple user IDs - performance optimization to avoid N+1 queries';
