-- 🧩 GROUP CHAT RLS POLICIES
-- Role-based permissions (NOT creator-based) to survive creator departure

-- ============================================================================
-- 1. DROP OLD POLICIES (creator-based)
-- ============================================================================

DROP POLICY IF EXISTS "Thread creator can add members" ON group_chat_members;
DROP POLICY IF EXISTS "Users can add members to their groups" ON group_chat_members;
DROP POLICY IF EXISTS "Admins can add members to groups" ON group_chat_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_chat_members;

-- ============================================================================
-- 2. group_chat_members - SELECT POLICIES
-- ============================================================================

-- Members can view other members in groups they belong to
CREATE POLICY "Members can view group membership"
  ON group_chat_members
  FOR SELECT
  USING (
    -- User is a member of this group
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      WHERE gcm.thread_id = group_chat_members.thread_id
      AND gcm.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Members can view group membership" ON group_chat_members
  IS 'Members can see other members in groups they belong to';

-- ============================================================================
-- 3. group_chat_members - INSERT POLICIES (Role-based)
-- ============================================================================

-- Admins and creators can add members
CREATE POLICY "Admins can add members"
  ON group_chat_members
  FOR INSERT
  WITH CHECK (
    -- User must be admin, creator, or executive admin in this group
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      WHERE gcm.thread_id = group_chat_members.thread_id
      AND gcm.user_id = auth.uid()
      AND gcm.role IN ('creator', 'admin', 'admin_executive')
    )
    -- AND check invite policy constraints (will add via application logic)
  );

COMMENT ON POLICY "Admins can add members" ON group_chat_members
  IS 'Admins, creators, and executive admins can add members (subject to invite_policy)';

-- Members can add if group allows it
CREATE POLICY "Members can invite if policy allows"
  ON group_chat_members
  FOR INSERT
  WITH CHECK (
    -- User is a member
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      INNER JOIN chat_threads ct ON ct.id = gcm.thread_id
      WHERE gcm.thread_id = group_chat_members.thread_id
      AND gcm.user_id = auth.uid()
      -- And invite policy allows members to invite
      AND ct.invite_policy IN ('all_members', 'members_with_approval', 'vouch_plus_approval')
    )
  );

COMMENT ON POLICY "Members can invite if policy allows" ON group_chat_members
  IS 'Regular members can invite if group invite_policy permits';

-- ============================================================================
-- 4. group_chat_members - DELETE POLICIES
-- ============================================================================

-- Users can remove themselves (leave group)
CREATE POLICY "Users can leave groups"
  ON group_chat_members
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins can remove other members
CREATE POLICY "Admins can remove members"
  ON group_chat_members
  FOR DELETE
  USING (
    -- User must be admin, creator, or executive admin in this group
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      WHERE gcm.thread_id = group_chat_members.thread_id
      AND gcm.user_id = auth.uid()
      AND gcm.role IN ('creator', 'admin', 'admin_executive')
    )
    -- Can't remove yourself (use "Users can leave groups" policy instead)
    AND group_chat_members.user_id != auth.uid()
  );

COMMENT ON POLICY "Admins can remove members" ON group_chat_members
  IS 'Admins can remove other members (but not themselves)';

-- ============================================================================
-- 5. group_chat_members - UPDATE POLICIES (Role changes)
-- ============================================================================

-- Admins and creators can promote/demote members
CREATE POLICY "Admins can change member roles"
  ON group_chat_members
  FOR UPDATE
  USING (
    -- User must be creator or admin (NOT moderator)
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      WHERE gcm.thread_id = group_chat_members.thread_id
      AND gcm.user_id = auth.uid()
      AND gcm.role IN ('creator', 'admin', 'admin_executive')
    )
  )
  WITH CHECK (
    -- Can't demote yourself to non-admin if you're the only admin
    -- (This check will be enforced in application logic for complexity)
    true
  );

COMMENT ON POLICY "Admins can change member roles" ON group_chat_members
  IS 'Admins and creators can promote/demote members';

-- ============================================================================
-- 6. chat_threads - UPDATE POLICIES (Edit group settings)
-- ============================================================================

DROP POLICY IF EXISTS "Users can update their threads" ON chat_threads;

-- Only admins and creators can edit group settings
CREATE POLICY "Admins can edit group settings"
  ON chat_threads
  FOR UPDATE
  USING (
    -- User must be admin or creator in this group
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      WHERE gcm.thread_id = chat_threads.id
      AND gcm.user_id = auth.uid()
      AND gcm.role IN ('creator', 'admin', 'admin_executive')
    )
  )
  WITH CHECK (
    -- Same condition for check
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      WHERE gcm.thread_id = chat_threads.id
      AND gcm.user_id = auth.uid()
      AND gcm.role IN ('creator', 'admin', 'admin_executive')
    )
  );

COMMENT ON POLICY "Admins can edit group settings" ON chat_threads
  IS 'Only admins, creators, and executive admins can edit group settings';

-- ============================================================================
-- 7. chat_messages - Archived groups are read-only
-- ============================================================================

DROP POLICY IF EXISTS "Users can send messages to their threads" ON chat_messages;

-- Users can send messages if they're members AND group not archived
CREATE POLICY "Members can send messages if not archived"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    -- User is a member of this group
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      INNER JOIN chat_threads ct ON ct.id = gcm.thread_id
      WHERE gcm.thread_id = chat_messages.thread_id
      AND gcm.user_id = auth.uid()
      -- Group must not be archived
      AND ct.archived = false
    )
  );

COMMENT ON POLICY "Members can send messages if not archived" ON chat_messages
  IS 'Members can post messages only if group is not archived';

-- ============================================================================
-- 8. group_role_audit - Audit log policies
-- ============================================================================

-- Everyone can read audit logs for groups they're in
CREATE POLICY "Members can view audit logs"
  ON group_role_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM group_chat_members gcm
      WHERE gcm.thread_id = group_role_audit.thread_id
      AND gcm.user_id = auth.uid()
    )
  );

-- Only system can insert audit logs (via SECURITY DEFINER functions)
-- No INSERT policy needed (handled by functions with SECURITY DEFINER)

COMMENT ON POLICY "Members can view audit logs" ON group_role_audit
  IS 'Members can view audit logs for groups they belong to';

-- ============================================================================
-- 9. Enable RLS on all tables
-- ============================================================================

ALTER TABLE group_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_role_audit ENABLE ROW LEVEL SECURITY;
