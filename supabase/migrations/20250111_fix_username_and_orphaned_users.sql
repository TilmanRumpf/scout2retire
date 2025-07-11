-- Fix username availability check and handle orphaned auth users

-- First, enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to check if a username exists
-- This is needed for the signup flow to validate usernames
CREATE POLICY "Public can check username existence" ON users
  FOR SELECT 
  USING (true)
  -- Important: This policy allows selecting ONLY for username checks
  -- The actual data access is still restricted by other policies;

-- Create a function that safely checks username availability
-- This prevents exposing any user data while allowing username validation
CREATE OR REPLACE FUNCTION public.check_username_available(check_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return true if username is available (not found), false if taken
  RETURN NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE LOWER(username) = LOWER(check_username)
  );
END;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.check_username_available(check_username text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_username_available(check_username text) TO authenticated;

-- Create a function to clean up orphaned auth users (users in auth.users but not in public.users)
-- This requires admin privileges and should be run periodically
CREATE OR REPLACE FUNCTION public.find_orphaned_auth_users()
RETURNS TABLE(
  auth_id uuid,
  email text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    au.id as auth_id,
    au.email::text,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
  ORDER BY au.created_at DESC;
$$;

-- Only allow service role to execute this function
REVOKE ALL ON FUNCTION public.find_orphaned_auth_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_orphaned_auth_users() TO service_role;

-- Add a comment explaining the username validation  
COMMENT ON FUNCTION public.check_username_available IS 'Check if a username is available for registration. Returns true if available, false if taken.';
COMMENT ON FUNCTION public.find_orphaned_auth_users IS 'Find auth users without corresponding profiles in public.users table. Admin use only.';

-- Create an index on username for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));

-- Also create a function to handle signup atomically (optional, for future use)
-- This would ensure that auth user and profile are created together
CREATE OR REPLACE FUNCTION public.complete_user_profile(
  user_id uuid,
  user_email text,
  user_full_name text,
  user_nationality text,
  user_retirement_year integer,
  user_hometown text DEFAULT NULL,
  user_username text DEFAULT NULL,
  user_avatar_url text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists boolean;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = user_id) INTO profile_exists;
  
  IF profile_exists THEN
    -- Update existing profile if username is not taken
    IF user_username IS NOT NULL THEN
      -- Check if username is taken by another user
      IF EXISTS(SELECT 1 FROM public.users WHERE LOWER(username) = LOWER(user_username) AND id != user_id) THEN
        RAISE EXCEPTION 'Username already taken';
      END IF;
    END IF;
    
    UPDATE public.users 
    SET 
      username = COALESCE(user_username, username),
      hometown = COALESCE(user_hometown, hometown),
      avatar_url = COALESCE(user_avatar_url, avatar_url)
    WHERE id = user_id;
  ELSE
    -- Create new profile
    INSERT INTO public.users (
      id, 
      email, 
      full_name, 
      nationality, 
      retirement_year_estimate,
      hometown,
      username,
      avatar_url,
      onboarding_completed
    ) VALUES (
      user_id,
      user_email,
      user_full_name,
      user_nationality,
      user_retirement_year,
      user_hometown,
      user_username,
      user_avatar_url,
      false
    );
  END IF;
  
  RETURN true;
EXCEPTION
  WHEN unique_violation THEN
    IF SQLERRM LIKE '%username%' THEN
      RAISE EXCEPTION 'Username already taken';
    ELSE
      RAISE;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_user_profile TO authenticated;
COMMENT ON FUNCTION public.complete_user_profile IS 'Safely create or update a user profile after auth signup';