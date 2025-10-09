-- Fix enforce_admin_ratio function - change sender_id to user_id
-- Bug: Line 125 referenced cm.sender_id but chat_messages table uses user_id

CREATE OR REPLACE FUNCTION enforce_admin_ratio(p_thread_id UUID)
RETURNS VOID AS $$
DECLARE
  v_member_count INTEGER;
  v_admin_count INTEGER;
  v_required_admins INTEGER;
  v_group_type TEXT;
  v_succession_enabled BOOLEAN;
  v_candidate_id UUID;
BEGIN
  -- Get group info
  SELECT member_count, group_type::text, succession_enabled
  INTO v_member_count, v_group_type, v_succession_enabled
  FROM chat_threads
  WHERE id = p_thread_id;

  -- Skip if succession disabled or sensitive_private
  IF NOT v_succession_enabled OR v_group_type = 'sensitive_private' THEN
    RETURN;
  END IF;

  -- Count current admins (excluding executive admin)
  SELECT COUNT(*)
  INTO v_admin_count
  FROM group_chat_members
  WHERE thread_id = p_thread_id
  AND role IN ('creator', 'admin');

  -- Calculate required admins (1 per 10 active members)
  v_required_admins := GREATEST(2, CEIL(v_member_count / 10.0)::INTEGER);

  -- If we have enough admins, exit
  IF v_admin_count >= v_required_admins THEN
    RETURN;
  END IF;

  -- Find most active member to promote (not already admin)
  -- Active = posted message in last 30 days
  -- FIX: Changed cm.sender_id to cm.user_id
  SELECT gcm.user_id
  INTO v_candidate_id
  FROM group_chat_members gcm
  LEFT JOIN chat_messages cm ON cm.user_id = gcm.user_id AND cm.thread_id = gcm.thread_id
  WHERE gcm.thread_id = p_thread_id
  AND gcm.role = 'member'
  AND cm.created_at > now() - INTERVAL '30 days'
  GROUP BY gcm.user_id, gcm.joined_at
  ORDER BY COUNT(cm.id) DESC, gcm.joined_at ASC
  LIMIT 1;

  -- If no active candidates, promote oldest member
  IF v_candidate_id IS NULL THEN
    SELECT user_id
    INTO v_candidate_id
    FROM group_chat_members
    WHERE thread_id = p_thread_id
    AND role = 'member'
    ORDER BY joined_at ASC
    LIMIT 1;
  END IF;

  -- Promote candidate to admin
  IF v_candidate_id IS NOT NULL THEN
    UPDATE group_chat_members
    SET role = 'admin'
    WHERE thread_id = p_thread_id
    AND user_id = v_candidate_id;

    -- Log the promotion
    INSERT INTO group_role_audit (
      thread_id, actor_id, action, target_user_id, old_role, new_role, reason
    )
    VALUES (
      p_thread_id,
      v_candidate_id, -- Self-promotion via system
      'auto_promote',
      v_candidate_id,
      'member',
      'admin',
      'Automatic promotion to maintain 1:10 admin ratio'
    );

    RAISE NOTICE 'Auto-promoted user % to admin in thread %', v_candidate_id, p_thread_id;
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION enforce_admin_ratio IS 'Auto-promotes members to admin to maintain 1:10 ratio (FIXED: sender_id -> user_id)';
