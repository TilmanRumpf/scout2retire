-- ADD: Thread read tracking for unread message counts
-- Allows users to see unread message badges on town chats

-- Create table to track when users last read each thread
CREATE TABLE IF NOT EXISTS thread_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one read status per user per thread
  UNIQUE(user_id, thread_id)
);

-- Index for fast lookups
CREATE INDEX idx_thread_read_status_user ON thread_read_status(user_id);
CREATE INDEX idx_thread_read_status_thread ON thread_read_status(thread_id);

-- RLS Policies
ALTER TABLE thread_read_status ENABLE ROW LEVEL SECURITY;

-- Users can view their own read status
CREATE POLICY "Users can view own read status"
  ON thread_read_status
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own read status
CREATE POLICY "Users can insert own read status"
  ON thread_read_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own read status
CREATE POLICY "Users can update own read status"
  ON thread_read_status
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to mark thread as read (upsert)
CREATE OR REPLACE FUNCTION mark_thread_read(p_thread_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO thread_read_status (user_id, thread_id, last_read_at)
  VALUES (auth.uid(), p_thread_id, NOW())
  ON CONFLICT (user_id, thread_id)
  DO UPDATE SET
    last_read_at = NOW(),
    updated_at = NOW();
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION mark_thread_read TO authenticated;

-- Function to get unread count for a thread
CREATE OR REPLACE FUNCTION get_unread_count(p_thread_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_read TIMESTAMPTZ;
  v_unread_count INTEGER;
BEGIN
  -- Get when user last read this thread
  SELECT last_read_at INTO v_last_read
  FROM thread_read_status
  WHERE user_id = auth.uid()
    AND thread_id = p_thread_id;

  -- If never read, count all messages
  IF v_last_read IS NULL THEN
    SELECT COUNT(*) INTO v_unread_count
    FROM chat_messages
    WHERE thread_id = p_thread_id
      AND user_id != auth.uid(); -- Don't count own messages
  ELSE
    -- Count messages since last read
    SELECT COUNT(*) INTO v_unread_count
    FROM chat_messages
    WHERE thread_id = p_thread_id
      AND created_at > v_last_read
      AND user_id != auth.uid(); -- Don't count own messages
  END IF;

  RETURN COALESCE(v_unread_count, 0);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;

-- Function to get unread counts for multiple threads (more efficient)
CREATE OR REPLACE FUNCTION get_unread_counts(p_thread_ids UUID[])
RETURNS TABLE(thread_id UUID, unread_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS thread_id,
    COUNT(m.id)::INTEGER AS unread_count
  FROM unnest(p_thread_ids) AS t(id)
  LEFT JOIN thread_read_status trs ON trs.thread_id = t.id AND trs.user_id = auth.uid()
  LEFT JOIN chat_messages m ON m.thread_id = t.id
    AND (trs.last_read_at IS NULL OR m.created_at > trs.last_read_at)
    AND m.user_id != auth.uid()  -- Don't count own messages
  GROUP BY t.id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_counts TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE thread_read_status IS 'Tracks when users last read each chat thread for unread counts';
COMMENT ON FUNCTION mark_thread_read IS 'Marks a thread as read by current user (updates last_read_at timestamp)';
COMMENT ON FUNCTION get_unread_count IS 'Returns count of unread messages in a thread for current user';
COMMENT ON FUNCTION get_unread_counts IS 'Returns unread counts for multiple threads (batch operation)';
