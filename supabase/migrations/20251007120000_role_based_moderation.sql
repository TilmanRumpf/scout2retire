-- =====================================================
-- ROLE-BASED MODERATION SYSTEM
-- Created: 2025-10-07
-- Purpose: Complete implementation of moderator role and role-based permissions
-- =====================================================

-- =====================================================
-- 1. ADD MESSAGE PINNING COLUMNS
-- =====================================================

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_pinned
ON chat_messages(thread_id, is_pinned, created_at DESC)
WHERE is_pinned = TRUE;

COMMENT ON COLUMN chat_messages.is_pinned IS 'Whether this message is pinned in the chat';
COMMENT ON COLUMN chat_messages.pinned_at IS 'Timestamp when message was pinned';
COMMENT ON COLUMN chat_messages.pinned_by IS 'User ID who pinned the message';

-- =====================================================
-- 2. DELETE MESSAGE AS MODERATOR
-- Purpose: Allow moderators/admins to delete any message in their group
-- Role hierarchy: creator > admin_executive > admin > moderator
-- =====================================================

CREATE OR REPLACE FUNCTION delete_message_as_moderator(p_message_id BIGINT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message RECORD;
  v_thread RECORD;
  v_user_role member_role;
  v_deleting_user_id UUID;
  v_is_group_chat BOOLEAN;
BEGIN
  v_deleting_user_id := auth.uid();

  IF v_deleting_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get message details
  SELECT m.*, ct.id as thread_id, ct.group_type
  INTO v_message
  FROM chat_messages m
  JOIN chat_threads ct ON ct.id = m.thread_id
  WHERE m.id = p_message_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message not found');
  END IF;

  -- Check if already deleted
  IF v_message.deleted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message already deleted');
  END IF;

  -- Determine if this is a group chat
  v_is_group_chat := v_message.group_type IS NOT NULL;

  -- If not a group chat, only allow self-delete within 15 minutes (existing behavior)
  IF NOT v_is_group_chat THEN
    IF v_message.user_id != v_deleting_user_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'You can only delete your own messages');
    END IF;

    IF (NOW() - v_message.created_at) > INTERVAL '15 minutes' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Messages can only be deleted within 15 minutes');
    END IF;
  ELSE
    -- Group chat: Check if user has moderator or higher role
    SELECT role INTO v_user_role
    FROM group_chat_members
    WHERE thread_id = v_message.thread_id
      AND user_id = v_deleting_user_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'You are not a member of this group');
    END IF;

    -- Allow deletion if:
    -- 1. User is the message author (within 15 minutes)
    -- 2. User has moderator, admin, admin_executive, or creator role
    IF v_message.user_id = v_deleting_user_id THEN
      -- Self-delete: 15 minute window
      IF (NOW() - v_message.created_at) > INTERVAL '15 minutes' THEN
        RETURN jsonb_build_object('success', false, 'error', 'You can only delete your own messages within 15 minutes');
      END IF;
    ELSIF v_user_role NOT IN ('creator', 'admin', 'admin_executive', 'moderator') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Only moderators and admins can delete other users'' messages');
    END IF;
  END IF;

  -- Soft delete the message
  UPDATE chat_messages
  SET
    deleted_at = NOW(),
    deleted_by = v_deleting_user_id
  WHERE id = p_message_id;

  -- Log to audit table if it was a moderation action (not self-delete)
  IF v_is_group_chat AND v_message.user_id != v_deleting_user_id THEN
    INSERT INTO group_role_audit (
      thread_id,
      action_by,
      action_type,
      target_user_id,
      details
    ) VALUES (
      v_message.thread_id,
      v_deleting_user_id,
      'message_deleted',
      v_message.user_id,
      jsonb_build_object(
        'message_id', p_message_id,
        'moderator_role', v_user_role
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Message deleted successfully',
    'was_moderation_action', v_is_group_chat AND v_message.user_id != v_deleting_user_id
  );
END;
$$;

COMMENT ON FUNCTION delete_message_as_moderator IS 'Delete a message with role-based permissions. Moderators+ can delete any message in their groups. Regular users can only delete their own messages within 15 minutes.';

-- =====================================================
-- 3. REMOVE MEMBER WITH ROLE HIERARCHY
-- Purpose: Unified member removal with proper role hierarchy enforcement
-- =====================================================

CREATE OR REPLACE FUNCTION remove_member(
  p_thread_id UUID,
  p_user_id_to_remove UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_removing_user_id UUID;
  v_removing_user_role member_role;
  v_target_user_role member_role;
  v_thread RECORD;
  v_role_rank_remover INT;
  v_role_rank_target INT;
BEGIN
  v_removing_user_id := auth.uid();

  IF v_removing_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get thread details
  SELECT * INTO v_thread
  FROM chat_threads
  WHERE id = p_thread_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Thread not found');
  END IF;

  -- Must be a group chat
  IF v_thread.group_type IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'This operation is only for group chats');
  END IF;

  -- Get the role of the user doing the removal
  SELECT role INTO v_removing_user_role
  FROM group_chat_members
  WHERE thread_id = p_thread_id
    AND user_id = v_removing_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a member of this group');
  END IF;

  -- Get the role of the user being removed
  SELECT role INTO v_target_user_role
  FROM group_chat_members
  WHERE thread_id = p_thread_id
    AND user_id = p_user_id_to_remove;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target user is not a member of this group');
  END IF;

  -- Can't remove yourself (use leave_group for that)
  IF v_removing_user_id = p_user_id_to_remove THEN
    RETURN jsonb_build_object('success', false, 'error', 'Use leave_group to remove yourself');
  END IF;

  -- Define role hierarchy ranks (higher = more power)
  -- creator: 5, admin_executive: 4, admin: 3, moderator: 2, member: 1
  v_role_rank_remover := CASE v_removing_user_role
    WHEN 'creator' THEN 5
    WHEN 'admin_executive' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    ELSE 1
  END;

  v_role_rank_target := CASE v_target_user_role
    WHEN 'creator' THEN 5
    WHEN 'admin_executive' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    ELSE 1
  END;

  -- Check permissions:
  -- - Moderators can only remove regular members
  -- - Admins can remove members and moderators
  -- - Executive admins can remove members, moderators, and admins
  -- - Creators can remove anyone except executive admins
  -- - No one can remove creators or executive admins (except themselves via leave_group)

  -- Can't remove executive admins (system-assigned)
  IF v_target_user_role = 'admin_executive' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Executive admins cannot be removed (system-assigned role)');
  END IF;

  -- Can't remove creator
  IF v_target_user_role = 'creator' THEN
    RETURN jsonb_build_object('success', false, 'error', 'The group creator cannot be removed');
  END IF;

  -- Enforce hierarchy: you can't remove someone of equal or higher rank
  IF v_role_rank_remover <= v_role_rank_target THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Only users with higher authority can remove a %s', v_target_user_role)
    );
  END IF;

  -- Minimum permission: moderator
  IF v_removing_user_role NOT IN ('creator', 'admin', 'admin_executive', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only moderators and admins can remove members');
  END IF;

  -- Perform the removal
  DELETE FROM group_chat_members
  WHERE thread_id = p_thread_id
    AND user_id = p_user_id_to_remove;

  -- Log the action
  INSERT INTO group_role_audit (
    thread_id,
    action_by,
    action_type,
    target_user_id,
    details
  ) VALUES (
    p_thread_id,
    v_removing_user_id,
    'member_removed',
    p_user_id_to_remove,
    jsonb_build_object(
      'removed_role', v_target_user_role,
      'remover_role', v_removing_user_role
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', format('User removed from group by %s', v_removing_user_role)
  );
END;
$$;

COMMENT ON FUNCTION remove_member IS 'Remove a member from a group chat with role hierarchy enforcement. Moderators can remove members, admins can remove members/moderators, etc.';

-- =====================================================
-- 4. PROMOTE TO MODERATOR
-- Purpose: Allow creators/admins to promote members to moderator role
-- =====================================================

CREATE OR REPLACE FUNCTION promote_to_moderator(
  p_thread_id UUID,
  p_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promoting_user_id UUID;
  v_promoting_user_role member_role;
  v_current_role member_role;
  v_thread RECORD;
BEGIN
  v_promoting_user_id := auth.uid();

  IF v_promoting_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get thread details
  SELECT * INTO v_thread
  FROM chat_threads
  WHERE id = p_thread_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Thread not found');
  END IF;

  -- Must be a group chat
  IF v_thread.group_type IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'This operation is only for group chats');
  END IF;

  -- Get the role of the user doing the promotion
  SELECT role INTO v_promoting_user_role
  FROM group_chat_members
  WHERE thread_id = p_thread_id
    AND user_id = v_promoting_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a member of this group');
  END IF;

  -- Only creators, executive admins, and admins can promote to moderator
  IF v_promoting_user_role NOT IN ('creator', 'admin', 'admin_executive') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins and creators can promote members to moderator');
  END IF;

  -- Get current role of target user
  SELECT role INTO v_current_role
  FROM group_chat_members
  WHERE thread_id = p_thread_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target user is not a member of this group');
  END IF;

  -- Can only promote regular members
  IF v_current_role != 'member' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('User already has role: %s', v_current_role)
    );
  END IF;

  -- Perform the promotion
  UPDATE group_chat_members
  SET
    role = 'moderator',
    updated_at = NOW()
  WHERE thread_id = p_thread_id
    AND user_id = p_user_id;

  -- Log the action
  INSERT INTO group_role_audit (
    thread_id,
    action_by,
    action_type,
    target_user_id,
    old_role,
    new_role,
    details
  ) VALUES (
    p_thread_id,
    v_promoting_user_id,
    'role_changed',
    p_user_id,
    'member',
    'moderator',
    jsonb_build_object(
      'promoted_by_role', v_promoting_user_role
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User promoted to moderator successfully'
  );
END;
$$;

COMMENT ON FUNCTION promote_to_moderator IS 'Promote a regular member to moderator role. Only admins and creators can perform this action.';

-- =====================================================
-- 5. PIN MESSAGE
-- Purpose: Allow admins and moderators to pin important messages
-- =====================================================

CREATE OR REPLACE FUNCTION pin_message(
  p_message_id BIGINT,
  p_should_pin BOOLEAN DEFAULT TRUE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role member_role;
  v_message RECORD;
  v_pinned_count INT;
  v_max_pins INT := 15; -- Maximum pinned messages per group
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get message details
  SELECT m.*, ct.group_type
  INTO v_message
  FROM chat_messages m
  JOIN chat_threads ct ON ct.id = m.thread_id
  WHERE m.id = p_message_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message not found');
  END IF;

  -- Must be a group chat
  IF v_message.group_type IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only group chat messages can be pinned');
  END IF;

  -- Get user's role in the group
  SELECT role INTO v_user_role
  FROM group_chat_members
  WHERE thread_id = v_message.thread_id
    AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a member of this group');
  END IF;

  -- Only moderators and above can pin messages
  IF v_user_role NOT IN ('creator', 'admin', 'admin_executive', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only moderators and admins can pin messages');
  END IF;

  -- If pinning, check we haven't exceeded max pins
  IF p_should_pin THEN
    SELECT COUNT(*) INTO v_pinned_count
    FROM chat_messages
    WHERE thread_id = v_message.thread_id
      AND is_pinned = TRUE
      AND deleted_at IS NULL;

    IF v_pinned_count >= v_max_pins THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('Maximum of %s pinned messages reached. Unpin a message first.', v_max_pins)
      );
    END IF;
  END IF;

  -- Update the message
  UPDATE chat_messages
  SET
    is_pinned = p_should_pin,
    pinned_at = CASE WHEN p_should_pin THEN NOW() ELSE NULL END,
    pinned_by = CASE WHEN p_should_pin THEN v_user_id ELSE NULL END
  WHERE id = p_message_id;

  -- Log the action
  INSERT INTO group_role_audit (
    thread_id,
    action_by,
    action_type,
    details
  ) VALUES (
    v_message.thread_id,
    v_user_id,
    CASE WHEN p_should_pin THEN 'message_pinned' ELSE 'message_unpinned' END,
    jsonb_build_object(
      'message_id', p_message_id,
      'moderator_role', v_user_role
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', CASE WHEN p_should_pin THEN 'Message pinned successfully' ELSE 'Message unpinned successfully' END
  );
END;
$$;

COMMENT ON FUNCTION pin_message IS 'Pin or unpin a message in a group chat. Only moderators and admins can pin messages. Maximum 15 pins per group.';

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION delete_message_as_moderator TO authenticated;
GRANT EXECUTE ON FUNCTION remove_member TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_moderator TO authenticated;
GRANT EXECUTE ON FUNCTION pin_message TO authenticated;

-- =====================================================
-- 7. UPDATE RLS POLICIES FOR MESSAGE PINNING
-- =====================================================

-- Allow authenticated users to view pinned status
-- (Already covered by existing SELECT policy on chat_messages)

-- Ensure pinned messages are visible in queries
COMMENT ON INDEX idx_chat_messages_pinned IS 'Optimize queries for pinned messages in group chats';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
