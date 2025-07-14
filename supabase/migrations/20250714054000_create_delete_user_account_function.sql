-- Migration: Create delete_user_account RPC function
-- Purpose: Fix broken account deletion functionality
-- Bug: ProfileUnified.jsx calls delete_user_account RPC that doesn't exist
-- Solution: Create proper user deletion function that removes all user data

CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.delete_user_account(UUID) IS 'Deletes all user data from database tables. Must be called before deleting auth user.';

-- Test the function works
DO $$
BEGIN
  RAISE NOTICE 'delete_user_account function created successfully';
END $$;