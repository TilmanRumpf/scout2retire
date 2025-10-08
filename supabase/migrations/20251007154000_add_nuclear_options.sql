-- Nuclear Options: Transfer Ownership & Delete Group

-- Transfer Ownership function
CREATE OR REPLACE FUNCTION transfer_ownership(
  p_thread_id UUID,
  p_new_creator_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_creator_id UUID;
  v_new_user_role member_role;
BEGIN
  -- Get current creator
  SELECT user_id INTO v_current_creator_id
  FROM group_chat_members
  WHERE thread_id = p_thread_id AND role = 'creator';

  -- Verify caller is the creator
  IF auth.uid() != v_current_creator_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the creator can transfer ownership');
  END IF;

  -- Verify new creator is a member
  SELECT role INTO v_new_user_role
  FROM group_chat_members
  WHERE thread_id = p_thread_id AND user_id = p_new_creator_id;

  IF v_new_user_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is not a member of this group');
  END IF;

  -- Demote current creator to admin
  UPDATE group_chat_members
  SET role = 'admin'
  WHERE thread_id = p_thread_id AND user_id = v_current_creator_id;

  -- Promote new creator
  UPDATE group_chat_members
  SET role = 'creator'
  WHERE thread_id = p_thread_id AND user_id = p_new_creator_id;

  -- Update chat_threads.created_by
  UPDATE chat_threads
  SET created_by = p_new_creator_id
  WHERE id = p_thread_id;

  -- Log to audit
  INSERT INTO group_role_audit (thread_id, actor_id, action, target_user_id, old_role, new_role)
  VALUES
    (p_thread_id, v_current_creator_id, 'transfer_ownership', v_current_creator_id, 'creator', 'admin'),
    (p_thread_id, v_current_creator_id, 'transfer_ownership', p_new_creator_id, v_new_user_role, 'creator');

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION transfer_ownership TO authenticated;

-- Delete Group function
CREATE OR REPLACE FUNCTION delete_group(
  p_thread_id UUID,
  p_confirmation_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_creator_id UUID;
  v_group_name TEXT;
BEGIN
  -- Get current creator and group name
  SELECT created_by, topic INTO v_current_creator_id, v_group_name
  FROM chat_threads
  WHERE id = p_thread_id;

  -- Verify caller is the creator
  IF auth.uid() != v_current_creator_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the creator can delete the group');
  END IF;

  -- Verify confirmation name matches
  IF LOWER(TRIM(p_confirmation_name)) != LOWER(TRIM(v_group_name)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Group name does not match');
  END IF;

  -- Delete the group (cascades to members and messages)
  DELETE FROM chat_threads WHERE id = p_thread_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION delete_group TO authenticated;

COMMENT ON FUNCTION transfer_ownership IS 'Transfer group ownership to another member (creator only)';
COMMENT ON FUNCTION delete_group IS 'Permanently delete a group chat (creator only)';
