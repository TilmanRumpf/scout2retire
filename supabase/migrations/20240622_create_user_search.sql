-- Create a function to search for users by email
-- This bypasses RLS to allow users to find each other by email
CREATE OR REPLACE FUNCTION search_user_by_email(search_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name
  FROM users u
  WHERE LOWER(u.email) = LOWER(search_email)
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_user_by_email TO authenticated;

-- Also create a function to get user by ID (for friend connections)
CREATE OR REPLACE FUNCTION get_user_by_id(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name
  FROM users u
  WHERE u.id = user_id
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_id TO authenticated;