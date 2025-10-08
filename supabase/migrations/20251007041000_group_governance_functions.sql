-- 🧩 GROUP GOVERNANCE FUNCTIONS
-- Auto-succession, executive admin assignment, dormancy lifecycle

-- ============================================================================
-- 1. EXECUTIVE ADMIN AUTO-ASSIGNMENT (≥10 members)
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_executive_admin(p_thread_id UUID)
RETURNS VOID AS $$
DECLARE
  v_member_count INTEGER;
  v_group_type TEXT;
  v_exec_admin_id UUID;
  v_exec_exists BOOLEAN;
BEGIN
  -- Get group info
  SELECT member_count, group_type::text
  INTO v_member_count, v_group_type
  FROM chat_threads
  WHERE id = p_thread_id;

  -- Only apply to groups ≥10 members (excluding sensitive_private)
  IF v_member_count < 10 OR v_group_type = 'sensitive_private' THEN
    RETURN;
  END IF;

  -- Check if executive admin already assigned
  SELECT EXISTS (
    SELECT 1
    FROM group_chat_members
    WHERE thread_id = p_thread_id
    AND role = 'admin_executive'
  ) INTO v_exec_exists;

  IF v_exec_exists THEN
    RETURN;
  END IF;

  -- Get executive admin user ID from app metadata or config
  -- TODO: This should be set via environment variable or config table
  -- For now, we'll use a placeholder that you'll replace
  -- Option 1: Create dedicated executive@scout2retire.com account
  -- Option 2: Store in app_settings table

  -- Placeholder query (replace with actual logic):
  SELECT id INTO v_exec_admin_id
  FROM auth.users
  WHERE email = 'executive@scout2retire.com' -- Replace with actual account
  LIMIT 1;

  IF v_exec_admin_id IS NULL THEN
    RAISE NOTICE 'Executive admin account not found for thread %', p_thread_id;
    RETURN;
  END IF;

  -- Add executive admin to group
  INSERT INTO group_chat_members (thread_id, user_id, role, joined_at)
  VALUES (p_thread_id, v_exec_admin_id, 'admin_executive', now())
  ON CONFLICT (thread_id, user_id) DO UPDATE
  SET role = 'admin_executive';

  -- Log the action
  INSERT INTO group_role_audit (
    thread_id, actor_id, action, target_user_id, new_role, reason
  )
  VALUES (
    p_thread_id,
    v_exec_admin_id,
    'auto_assign_executive',
    v_exec_admin_id,
    'admin_executive',
    'Automatic assignment due to group reaching 10+ members'
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION ensure_executive_admin IS 'Automatically assigns executive admin to groups with ≥10 members (except sensitive_private)';

-- ============================================================================
-- 2. ADMIN SUCCESSION (Auto-promote at 1:10 ratio)
-- ============================================================================

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
  SELECT gcm.user_id
  INTO v_candidate_id
  FROM group_chat_members gcm
  LEFT JOIN chat_messages cm ON cm.sender_id = gcm.user_id AND cm.thread_id = gcm.thread_id
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

COMMENT ON FUNCTION enforce_admin_ratio IS 'Auto-promotes members to admin to maintain 1:10 ratio';

-- ============================================================================
-- 3. UPDATE MEMBER COUNT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_member_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update member count
  UPDATE chat_threads
  SET member_count = (
    SELECT COUNT(*)
    FROM group_chat_members
    WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id)
  )
  WHERE id = COALESCE(NEW.thread_id, OLD.thread_id);

  -- Check if we need to assign executive admin or enforce admin ratio
  IF TG_OP = 'INSERT' THEN
    PERFORM ensure_executive_admin(NEW.thread_id);
    PERFORM enforce_admin_ratio(NEW.thread_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_member_count ON group_chat_members;
CREATE TRIGGER trigger_update_member_count
AFTER INSERT OR DELETE ON group_chat_members
FOR EACH ROW
EXECUTE FUNCTION update_member_count();

-- ============================================================================
-- 4. UPDATE ACTIVITY TIMESTAMP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_group_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity_at when new message posted
  UPDATE chat_threads
  SET
    last_activity_at = NEW.created_at,
    dormancy_state = 'active' -- Reset to active
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_group_activity ON chat_messages;
CREATE TRIGGER trigger_update_group_activity
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_group_activity();

-- ============================================================================
-- 5. DORMANCY LIFECYCLE FUNCTION (Run via cron/scheduler)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_dormancy_states()
RETURNS TABLE (
  thread_id UUID,
  old_state dormancy_state,
  new_state dormancy_state,
  days_inactive INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH updates AS (
    UPDATE chat_threads
    SET dormancy_state = CASE
      -- Active: activity within 30 days
      WHEN last_activity_at > now() - INTERVAL '30 days' THEN 'active'::dormancy_state

      -- Dormant: 60 days inactive
      WHEN last_activity_at > now() - INTERVAL '60 days' THEN 'dormant'::dormancy_state

      -- Inactive: 90 days (recovery protocol)
      WHEN last_activity_at > now() - INTERVAL '90 days' THEN 'inactive'::dormancy_state

      -- Archived: 120 days (read-only)
      WHEN last_activity_at <= now() - INTERVAL '120 days' THEN 'archived'::dormancy_state

      ELSE dormancy_state
    END,
    archived = CASE
      WHEN last_activity_at <= now() - INTERVAL '120 days' THEN true
      ELSE archived
    END,
    archived_at = CASE
      WHEN last_activity_at <= now() - INTERVAL '120 days' AND archived_at IS NULL THEN now()
      ELSE archived_at
    END,
    archived_reason = CASE
      WHEN last_activity_at <= now() - INTERVAL '120 days' AND archived_reason IS NULL
        THEN 'Archived due to 120 days of inactivity'
      ELSE archived_reason
    END
    WHERE is_group = true
    AND dormancy_state != CASE
      WHEN last_activity_at > now() - INTERVAL '30 days' THEN 'active'::dormancy_state
      WHEN last_activity_at > now() - INTERVAL '60 days' THEN 'dormant'::dormancy_state
      WHEN last_activity_at > now() - INTERVAL '90 days' THEN 'inactive'::dormancy_state
      ELSE 'archived'::dormancy_state
    END
    RETURNING
      id,
      dormancy_state AS old_state,
      CASE
        WHEN last_activity_at > now() - INTERVAL '30 days' THEN 'active'::dormancy_state
        WHEN last_activity_at > now() - INTERVAL '60 days' THEN 'dormant'::dormancy_state
        WHEN last_activity_at > now() - INTERVAL '90 days' THEN 'inactive'::dormancy_state
        ELSE 'archived'::dormancy_state
      END AS new_state,
      EXTRACT(DAY FROM now() - last_activity_at)::INTEGER AS days_inactive
  )
  SELECT * FROM updates;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_dormancy_states IS 'Updates dormancy states based on inactivity periods (run via cron)';

-- ============================================================================
-- 6. HANDLE CREATOR DEPARTURE (Auto-succession or archive)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_creator_departure(p_thread_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_group_type TEXT;
  v_succession_enabled BOOLEAN;
  v_new_creator_id UUID;
BEGIN
  -- Get group info
  SELECT group_type::text, succession_enabled
  INTO v_group_type, v_succession_enabled
  FROM chat_threads
  WHERE id = p_thread_id;

  -- Sensitive private groups: ARCHIVE (read-only)
  IF v_group_type = 'sensitive_private' THEN
    UPDATE chat_threads
    SET
      archived = true,
      archived_reason = 'Creator left sensitive private group',
      archived_at = now()
    WHERE id = p_thread_id;

    -- Log archival
    INSERT INTO group_role_audit (
      thread_id, actor_id, action, reason
    )
    VALUES (
      p_thread_id,
      p_user_id,
      'archive_on_creator_leave',
      'Sensitive private group archived when creator left'
    );

    RETURN;
  END IF;

  -- Other groups: AUTO-SUCCESSION (if enabled)
  IF v_succession_enabled THEN
    -- Find oldest admin to promote to creator
    SELECT user_id
    INTO v_new_creator_id
    FROM group_chat_members
    WHERE thread_id = p_thread_id
    AND role = 'admin'
    AND user_id != p_user_id
    ORDER BY joined_at ASC
    LIMIT 1;

    -- If no admins, promote oldest member
    IF v_new_creator_id IS NULL THEN
      SELECT user_id
      INTO v_new_creator_id
      FROM group_chat_members
      WHERE thread_id = p_thread_id
      AND role = 'member'
      ORDER BY joined_at ASC
      LIMIT 1;
    END IF;

    -- Promote new creator
    IF v_new_creator_id IS NOT NULL THEN
      UPDATE group_chat_members
      SET role = 'creator'
      WHERE thread_id = p_thread_id
      AND user_id = v_new_creator_id;

      -- Log succession
      INSERT INTO group_role_audit (
        thread_id, actor_id, action, target_user_id, old_role, new_role, reason
      )
      VALUES (
        p_thread_id,
        v_new_creator_id,
        'auto_succession',
        v_new_creator_id,
        'admin', -- or 'member'
        'creator',
        'Automatic succession when previous creator left'
      );

      RAISE NOTICE 'Auto-promoted user % to creator in thread %', v_new_creator_id, p_thread_id;
    END IF;
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_creator_departure IS 'Handles creator leaving: archives sensitive groups, promotes successor for others';

-- ============================================================================
-- 7. TRIGGER: Handle member removal (check if creator left)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_creator_departure()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if removed member was creator
  IF OLD.role = 'creator' THEN
    PERFORM handle_creator_departure(OLD.thread_id, OLD.user_id);
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_creator_departure ON group_chat_members;
CREATE TRIGGER trigger_check_creator_departure
BEFORE DELETE ON group_chat_members
FOR EACH ROW
EXECUTE FUNCTION check_creator_departure();
