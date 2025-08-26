-- Create delete_user_account RPC function for Scout2Retire
-- This allows users to delete their own accounts from the app

CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is deleting their own account
  IF auth.uid() != user_id_param THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You can only delete your own account'
    );
  END IF;

  -- Delete from user_preferences table
  DELETE FROM public.user_preferences WHERE user_id = user_id_param;
  
  -- Delete from favorites table
  DELETE FROM public.favorites WHERE user_id = user_id_param;
  
  -- Delete from notifications table (if exists)
  DELETE FROM public.notifications WHERE user_id = user_id_param;
  
  -- Delete from users table (profile data)
  DELETE FROM public.users WHERE id = user_id_param;
  
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
COMMENT ON FUNCTION public.delete_user_account(UUID) IS 'Allows users to delete their own account data. Must be called before auth account deletion.';