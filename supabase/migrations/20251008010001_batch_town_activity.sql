-- Performance optimization: Batch check which threads have recent activity
-- Replaces N individual queries with 1 batch call

CREATE OR REPLACE FUNCTION get_threads_with_recent_activity(
  p_thread_ids UUID[],
  p_days_ago INTEGER DEFAULT 30
)
RETURNS TABLE (
  thread_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT cm.thread_id
  FROM chat_messages cm
  WHERE cm.thread_id = ANY(p_thread_ids)
    AND cm.created_at >= NOW() - (p_days_ago || ' days')::INTERVAL;
END;
$$;

GRANT EXECUTE ON FUNCTION get_threads_with_recent_activity TO authenticated;

COMMENT ON FUNCTION get_threads_with_recent_activity IS 'Batch check which threads have messages in the last N days - performance optimization';
