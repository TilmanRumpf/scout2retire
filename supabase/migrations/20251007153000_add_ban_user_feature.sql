-- Add Ban User Feature

-- Create group_bans table
CREATE TABLE IF NOT EXISTS group_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  UNIQUE(thread_id, user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_group_bans_thread ON group_bans(thread_id);
CREATE INDEX IF NOT EXISTS idx_group_bans_user ON group_bans(user_id);

-- RLS policies
ALTER TABLE group_bans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view bans in their groups" ON group_bans;
CREATE POLICY "Members can view bans in their groups"
ON group_bans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_chat_members
    WHERE thread_id = group_bans.thread_id
    AND user_id = auth.uid()
  )
);

-- Ban user function
CREATE OR REPLACE FUNCTION ban_user(
  p_thread_id UUID,
  p_user_id_to_ban UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id UUID;
  v_actor_role member_role;
  v_target_role member_role;
BEGIN
  v_actor_id := auth.uid();

  IF v_actor_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get roles
  SELECT role INTO v_actor_role FROM group_chat_members
  WHERE thread_id = p_thread_id AND user_id = v_actor_id;

  SELECT role INTO v_target_role FROM group_chat_members
  WHERE thread_id = p_thread_id AND user_id = p_user_id_to_ban;

  -- Check permissions (reuse role hierarchy)
  IF v_actor_role NOT IN ('admin', 'admin_executive', 'creator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can ban users');
  END IF;

  -- Can't ban creator or exec admin
  IF v_target_role IN ('creator', 'admin_executive') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot ban creator or executive admin');
  END IF;

  -- Remove from group
  DELETE FROM group_chat_members
  WHERE thread_id = p_thread_id AND user_id = p_user_id_to_ban;

  -- Add to ban list
  INSERT INTO group_bans (thread_id, user_id, banned_by, reason)
  VALUES (p_thread_id, p_user_id_to_ban, v_actor_id, p_reason);

  -- Log to audit
  INSERT INTO group_role_audit (thread_id, actor_id, action, target_user_id, old_role, new_role)
  VALUES (p_thread_id, v_actor_id, 'ban', p_user_id_to_ban, v_target_role, NULL);

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION ban_user TO authenticated;

-- Unban user function
CREATE OR REPLACE FUNCTION unban_user(
  p_thread_id UUID,
  p_user_id_to_unban UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id UUID;
  v_actor_role member_role;
BEGIN
  v_actor_id := auth.uid();

  IF v_actor_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT role INTO v_actor_role FROM group_chat_members
  WHERE thread_id = p_thread_id AND user_id = v_actor_id;

  IF v_actor_role NOT IN ('admin', 'admin_executive', 'creator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can unban users');
  END IF;

  -- Remove from ban list
  DELETE FROM group_bans
  WHERE thread_id = p_thread_id AND user_id = p_user_id_to_unban;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION unban_user TO authenticated;

COMMENT ON TABLE group_bans IS 'Users banned from group chats';
COMMENT ON FUNCTION ban_user IS 'Ban a user from a group chat (admins only)';
COMMENT ON FUNCTION unban_user IS 'Unban a user from a group chat (admins only)';
