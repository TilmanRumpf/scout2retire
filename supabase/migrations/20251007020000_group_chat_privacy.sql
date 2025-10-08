-- Add is_public column to chat_threads for group chat privacy
ALTER TABLE chat_threads
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add index for public/private filtering
CREATE INDEX IF NOT EXISTS idx_chat_threads_is_public ON chat_threads(is_public);

-- Comment for documentation
COMMENT ON COLUMN chat_threads.is_public IS 'Whether this group chat is public (discoverable by anyone) or private (invite-only)';
