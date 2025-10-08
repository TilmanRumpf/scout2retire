-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can add members to their groups" ON group_chat_members;

-- Create a simpler INSERT policy that doesn't cause recursion
-- Allow users to insert members if they created the thread
CREATE POLICY "Users can add members to their groups"
  ON group_chat_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_threads ct
      WHERE ct.id = thread_id
      AND ct.created_by = auth.uid()
    )
  );

-- Also allow admins to add members (checked separately to avoid recursion)
CREATE POLICY "Admins can add members to groups"
  ON group_chat_members
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM group_chat_members
      WHERE thread_id = group_chat_members.thread_id
      AND role = 'admin'
    )
  );
