-- PRIVACY FIX: Remove full_name from get_user_by_id function
-- We should NEVER return full_name - only email username prefix for privacy

DROP FUNCTION IF EXISTS get_user_by_id(UUID);

CREATE OR REPLACE FUNCTION get_user_by_id(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email
  FROM users u
  WHERE u.id = user_id
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_id TO authenticated;

COMMENT ON FUNCTION get_user_by_id IS 'Returns user ID and email only - NEVER returns full_name for privacy';
