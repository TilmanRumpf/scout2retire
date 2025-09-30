-- Fix SECURITY DEFINER functions to validate user ownership
-- CRITICAL: These functions run with elevated privileges and MUST check auth.uid()

-- Fix delete_user_account: Only allow users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- CRITICAL SECURITY CHECK: User can only delete their own account
  IF user_id_param != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;

  -- Delete from user_preferences table
  DELETE FROM public.user_preferences WHERE user_id = user_id_param;

  -- Delete from onboarding_responses table
  DELETE FROM public.onboarding_responses WHERE user_id = user_id_param;

  -- Delete from favorites table
  DELETE FROM public.favorites WHERE user_id = user_id_param;

  -- Delete from users table (profile data)
  DELETE FROM public.users WHERE id = user_id_param;

  -- Note: auth.users is managed by Supabase auth service
  -- The frontend should call supabase.auth.admin.deleteUser() separately

  RETURN json_build_object(
    'success', true,
    'message', 'User data deleted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION public.delete_user_account(UUID) IS 'Deletes all user data from database tables. Users can only delete their own account.';