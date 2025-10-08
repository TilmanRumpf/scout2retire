-- Leave Group Function
-- Allows a user to leave a group chat

CREATE OR REPLACE FUNCTION leave_group(
  p_thread_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role member_role;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if user is a member
  SELECT role INTO v_user_role
  FROM group_chat_members
  WHERE thread_id = p_thread_id
  AND user_id = v_user_id;

  IF v_user_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a member of this group');
  END IF;

  -- Creator must transfer ownership before leaving
  IF v_user_role = 'creator' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Creator must transfer ownership before leaving');
  END IF;

  -- Remove user from group
  DELETE FROM group_chat_members
  WHERE thread_id = p_thread_id
  AND user_id = v_user_id;

  -- Log to audit table
  INSERT INTO group_role_audit (
    thread_id,
    actor_id,
    action,
    target_user_id,
    old_role,
    new_role
  ) VALUES (
    p_thread_id,
    v_user_id,
    'leave',
    v_user_id,
    v_user_role,
    NULL
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION leave_group TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION leave_group IS 'Allows a user to leave a group chat. Creator must transfer ownership first.';
