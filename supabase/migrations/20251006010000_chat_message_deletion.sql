-- Chat Message Deletion Feature
-- Created: 2025-10-06
-- Purpose: Allow users to soft-delete their own messages within 15 minutes

-- =====================================================
-- ALTER TABLE: Add deletion tracking columns
-- =====================================================
ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create index for performance when filtering out deleted messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted_at ON chat_messages(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN chat_messages.deleted_at IS 'Timestamp when message was deleted (soft delete)';
COMMENT ON COLUMN chat_messages.deleted_by IS 'User who deleted the message (should match user_id)';

-- =====================================================
-- RPC FUNCTION: Delete Chat Message
-- =====================================================
CREATE OR REPLACE FUNCTION delete_chat_message(
  p_message_id BIGINT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message RECORD;
  v_time_diff INTERVAL;
BEGIN
  -- Get the message
  SELECT *
  INTO v_message
  FROM chat_messages
  WHERE id = p_message_id;

  -- Check if message exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Message not found'
    );
  END IF;

  -- Check if user owns the message
  IF v_message.user_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You can only delete your own messages'
    );
  END IF;

  -- Check if message is already deleted
  IF v_message.deleted_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Message is already deleted'
    );
  END IF;

  -- Check if message is within 15 minute window
  v_time_diff := NOW() - v_message.created_at;
  IF v_time_diff > INTERVAL '15 minutes' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Messages can only be deleted within 15 minutes of posting'
    );
  END IF;

  -- Soft delete the message
  UPDATE chat_messages
  SET
    deleted_at = NOW(),
    deleted_by = auth.uid()
  WHERE id = p_message_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Message deleted successfully'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_chat_message TO authenticated;

COMMENT ON FUNCTION delete_chat_message IS 'Soft-delete a chat message if owned by user and within 15 minute window';

-- =====================================================
-- HELPER FUNCTION: Check if message can be deleted
-- =====================================================
CREATE OR REPLACE FUNCTION can_delete_message(
  p_message_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message RECORD;
  v_time_diff INTERVAL;
BEGIN
  SELECT *
  INTO v_message
  FROM chat_messages
  WHERE id = p_message_id;

  -- Message doesn't exist
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Not the owner
  IF v_message.user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;

  -- Already deleted
  IF v_message.deleted_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  -- Check time window (15 minutes)
  v_time_diff := NOW() - v_message.created_at;
  IF v_time_diff > INTERVAL '15 minutes' THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION can_delete_message TO authenticated;

COMMENT ON FUNCTION can_delete_message IS 'Check if a message can be deleted by the current user';
