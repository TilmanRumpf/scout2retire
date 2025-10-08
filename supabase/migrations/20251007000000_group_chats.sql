-- Add is_group column to chat_threads table
ALTER TABLE chat_threads
ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE;

-- Create group_chat_members table
CREATE TABLE IF NOT EXISTS group_chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member', -- 'admin' or 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_chat_members_thread_id ON group_chat_members(thread_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_members_user_id ON group_chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_is_group ON chat_threads(is_group);

-- Enable RLS on group_chat_members
ALTER TABLE group_chat_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_chat_members

-- Users can view members of groups they belong to
CREATE POLICY "Users can view members of their groups"
  ON group_chat_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_chat_members gcm
      WHERE gcm.thread_id = group_chat_members.thread_id
      AND gcm.user_id = auth.uid()
    )
  );

-- Users can insert members when creating a group (if they're the creator or a member)
CREATE POLICY "Users can add members to their groups"
  ON group_chat_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_threads ct
      WHERE ct.id = thread_id
      AND (ct.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM group_chat_members gcm
        WHERE gcm.thread_id = thread_id
        AND gcm.user_id = auth.uid()
        AND gcm.role = 'admin'
      ))
    )
  );

-- Only admins can remove members from groups
CREATE POLICY "Admins can remove members from groups"
  ON group_chat_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_chat_members gcm
      WHERE gcm.thread_id = group_chat_members.thread_id
      AND gcm.user_id = auth.uid()
      AND gcm.role = 'admin'
    )
  );

-- Users can leave groups themselves
CREATE POLICY "Users can leave groups themselves"
  ON group_chat_members
  FOR DELETE
  USING (user_id = auth.uid());

-- Members can update their own membership (not role)
CREATE POLICY "Members can update their own membership"
  ON group_chat_members
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comment for documentation
COMMENT ON TABLE group_chat_members IS 'Members of group chats';
COMMENT ON COLUMN group_chat_members.thread_id IS 'Reference to the chat thread (group)';
COMMENT ON COLUMN group_chat_members.user_id IS 'Reference to the user who is a member';
COMMENT ON COLUMN group_chat_members.joined_at IS 'When the user joined the group';
COMMENT ON COLUMN group_chat_members.role IS 'Role in the group: admin or member';
COMMENT ON COLUMN chat_threads.is_group IS 'Whether this thread is a group chat (true) or direct/town chat (false)';
