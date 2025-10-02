-- PRIVACY FIX: Return USERNAME not email from get_user_by_id
-- Users should see "activejetsetter" NOT "tilman.rumpf"

DROP FUNCTION IF EXISTS get_user_by_id(UUID);

CREATE OR REPLACE FUNCTION get_user_by_id(user_id UUID)
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
  WHERE u.id = user_id
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_by_id TO authenticated;

COMMENT ON FUNCTION get_user_by_id IS 'Returns username ONLY - never email or full_name';
