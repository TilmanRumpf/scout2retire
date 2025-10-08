-- Add description column to chat_threads
ALTER TABLE chat_threads
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN chat_threads.description IS 'Longer description of the group chat purpose';
