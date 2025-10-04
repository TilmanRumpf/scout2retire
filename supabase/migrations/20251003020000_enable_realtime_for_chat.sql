-- Enable realtime for chat tables
-- Required for Supabase realtime subscriptions to work

-- Add chat_messages to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Add thread_read_status to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE thread_read_status;

-- Verify tables are in publication
COMMENT ON PUBLICATION supabase_realtime IS 'Realtime publication includes: chat_messages, thread_read_status';
