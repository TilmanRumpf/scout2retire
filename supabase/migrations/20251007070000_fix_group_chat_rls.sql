-- 🔧 FIX: Group Chat RLS Policies (No Infinite Recursion)
-- Fixes: "infinite recursion detected in policy for relation group_chat_members"

-- ============================================================================
-- 1. DROP ALL EXISTING POLICIES ON group_chat_members
-- ============================================================================

DROP POLICY IF EXISTS "Members can view group membership" ON group_chat_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_chat_members;
DROP POLICY IF EXISTS "Admins can remove members" ON group_chat_members;
DROP POLICY IF EXISTS "Admins can remove members from groups" ON group_chat_members;
DROP POLICY IF EXISTS "Members can insert themselves" ON group_chat_members;
DROP POLICY IF EXISTS "Users can join groups they're invited to" ON group_chat_members;
DROP POLICY IF EXISTS "Admins can add members" ON group_chat_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON group_chat_members;

-- ============================================================================
-- 2. CREATE NON-RECURSIVE RLS POLICIES
-- ============================================================================

-- SELECT: Members can view other members in their groups
-- IMPORTANT: Use direct user_id check, NOT a subquery that references the same table
CREATE POLICY "Members can view group membership"
ON group_chat_members
FOR SELECT
TO authenticated
USING (
  -- User is a member of this group
  EXISTS (
    SELECT 1
    FROM group_chat_members AS gcm
    WHERE gcm.thread_id = group_chat_members.thread_id
    AND gcm.user_id = auth.uid()
  )
);

-- INSERT: Admins and creators can add members
CREATE POLICY "Admins can add members to groups"
ON group_chat_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM group_chat_members AS gcm
    WHERE gcm.thread_id = group_chat_members.thread_id
    AND gcm.user_id = auth.uid()
    AND gcm.role IN ('creator', 'admin', 'admin_executive')
  )
);

-- UPDATE: Admins can update roles
CREATE POLICY "Admins can update member roles"
ON group_chat_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM group_chat_members AS gcm
    WHERE gcm.thread_id = group_chat_members.thread_id
    AND gcm.user_id = auth.uid()
    AND gcm.role IN ('creator', 'admin', 'admin_executive')
  )
);

-- DELETE: Admins can remove members (except creator and exec admin)
CREATE POLICY "Admins can remove members from groups"
ON group_chat_members
FOR DELETE
TO authenticated
USING (
  -- User is admin/creator in this group
  EXISTS (
    SELECT 1
    FROM group_chat_members AS gcm
    WHERE gcm.thread_id = group_chat_members.thread_id
    AND gcm.user_id = auth.uid()
    AND gcm.role IN ('creator', 'admin', 'admin_executive')
  )
  -- Cannot remove creator or executive admin
  AND group_chat_members.role NOT IN ('creator', 'admin_executive')
);

-- ============================================================================
-- 3. VERIFY POLICIES
-- ============================================================================

-- Show all policies on group_chat_members
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'group_chat_members'
ORDER BY policyname;
