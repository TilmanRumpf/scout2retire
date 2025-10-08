-- Add access control fields to chat_threads

-- Create invite_policy enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE invite_policy AS ENUM ('everyone', 'admins_only', 'creator_only');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add invite_policy column
ALTER TABLE chat_threads
ADD COLUMN IF NOT EXISTS invite_policy invite_policy DEFAULT 'everyone';

-- Add admins_only_messaging column
ALTER TABLE chat_threads
ADD COLUMN IF NOT EXISTS admins_only_messaging BOOLEAN DEFAULT FALSE;

-- Add comments
COMMENT ON COLUMN chat_threads.invite_policy IS 'Who can invite new members to the group';
COMMENT ON COLUMN chat_threads.admins_only_messaging IS 'If true, only admins/creators can send messages';
