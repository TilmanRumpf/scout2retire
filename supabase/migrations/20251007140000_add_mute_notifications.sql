-- Add Mute Notifications Feature
-- Allows users to mute notifications for specific group chats

-- Add is_muted column to group_chat_members
ALTER TABLE group_chat_members
ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT FALSE;

-- Add helpful comment
COMMENT ON COLUMN group_chat_members.is_muted IS 'If true, user will not receive notifications for this group chat';

-- Create function to toggle mute status
CREATE OR REPLACE FUNCTION toggle_group_mute(
  p_thread_id UUID,
  p_is_muted BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if user is a member
  IF NOT EXISTS (
    SELECT 1 FROM group_chat_members
    WHERE thread_id = p_thread_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a member of this group');
  END IF;

  -- Update mute status
  UPDATE group_chat_members
  SET is_muted = p_is_muted
  WHERE thread_id = p_thread_id AND user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'is_muted', p_is_muted);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION toggle_group_mute TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION toggle_group_mute IS 'Allows a user to mute or unmute notifications for a group chat';
