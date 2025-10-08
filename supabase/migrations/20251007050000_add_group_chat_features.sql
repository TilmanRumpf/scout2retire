-- 🧩 ADD GROUP CHAT FEATURES TO PAYWALL SYSTEM
-- Adds group chat related features to feature_definitions and sets limits per tier

-- ============================================================================
-- 1. ADD GROUP CHAT FEATURES
-- ============================================================================

INSERT INTO feature_definitions (feature_code, display_name, description, feature_group, limit_type, reset_behavior, icon, sort_order, is_active)
VALUES
  -- Group Chat Features
  ('group_chats_create', 'Create Group Chats', 'Number of group chats you can create', 'social', 'count', 'none', '💬', 13, true),
  ('group_chats_join', 'Join Group Chats', 'Number of group chats you can join', 'social', 'count', 'none', '🚪', 14, true),
  ('group_chat_members_max', 'Max Members per Group', 'Maximum members allowed in your group chats', 'social', 'count', 'none', '👥', 15, true),
  ('sensitive_private_groups', 'Sensitive Private Groups', 'Can create ultra-private groups (Premium+)', 'social', 'boolean', 'none', '🔒', 16, true)
ON CONFLICT (feature_code) DO NOTHING;

-- ============================================================================
-- 2. SET LIMITS FOR EACH TIER
-- ============================================================================

DO $$
DECLARE
  v_free_id UUID;
  v_freemium_id UUID;
  v_premium_id UUID;
  v_enterprise_id UUID;
  v_town_manager_id UUID;
  v_assistant_admin_id UUID;
  v_exec_admin_id UUID;

  v_group_create_id UUID;
  v_group_join_id UUID;
  v_group_members_id UUID;
  v_sensitive_groups_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO v_free_id FROM user_categories WHERE category_code = 'free';
  SELECT id INTO v_freemium_id FROM user_categories WHERE category_code = 'freemium';
  SELECT id INTO v_premium_id FROM user_categories WHERE category_code = 'premium';
  SELECT id INTO v_enterprise_id FROM user_categories WHERE category_code = 'enterprise';
  SELECT id INTO v_town_manager_id FROM user_categories WHERE category_code = 'town_manager';
  SELECT id INTO v_assistant_admin_id FROM user_categories WHERE category_code = 'assistant_admin';
  SELECT id INTO v_exec_admin_id FROM user_categories WHERE category_code = 'execadmin';

  -- Get feature IDs
  SELECT id INTO v_group_create_id FROM feature_definitions WHERE feature_code = 'group_chats_create';
  SELECT id INTO v_group_join_id FROM feature_definitions WHERE feature_code = 'group_chats_join';
  SELECT id INTO v_group_members_id FROM feature_definitions WHERE feature_code = 'group_chat_members_max';
  SELECT id INTO v_sensitive_groups_id FROM feature_definitions WHERE feature_code = 'sensitive_private_groups';

  -- FREE TIER
  -- Can create 2 groups, join 5, max 10 members, no sensitive groups
  INSERT INTO category_limits (category_id, feature_id, limit_value)
  VALUES
    (v_free_id, v_group_create_id, 2),
    (v_free_id, v_group_join_id, 5),
    (v_free_id, v_group_members_id, 10),
    (v_free_id, v_sensitive_groups_id, 0)  -- 0 = disabled/false
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- FREEMIUM TIER
  -- Can create 5 groups, join 10, max 25 members, no sensitive groups
  INSERT INTO category_limits (category_id, feature_id, limit_value)
  VALUES
    (v_freemium_id, v_group_create_id, 5),
    (v_freemium_id, v_group_join_id, 10),
    (v_freemium_id, v_group_members_id, 25),
    (v_freemium_id, v_sensitive_groups_id, 0)  -- 0 = disabled/false
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- PREMIUM TIER
  -- Unlimited groups, max 50 members, CAN create sensitive groups
  INSERT INTO category_limits (category_id, feature_id, limit_value)
  VALUES
    (v_premium_id, v_group_create_id, NULL),  -- NULL = unlimited
    (v_premium_id, v_group_join_id, NULL),
    (v_premium_id, v_group_members_id, 50),
    (v_premium_id, v_sensitive_groups_id, 1)  -- 1 = enabled/true
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- ENTERPRISE TIER
  -- Unlimited groups, max 100 members, CAN create sensitive groups
  INSERT INTO category_limits (category_id, feature_id, limit_value)
  VALUES
    (v_enterprise_id, v_group_create_id, NULL),
    (v_enterprise_id, v_group_join_id, NULL),
    (v_enterprise_id, v_group_members_id, 100),
    (v_enterprise_id, v_sensitive_groups_id, 1)  -- 1 = enabled/true
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- TOWN MANAGER TIER
  -- Unlimited groups, max 100 members, CAN create sensitive groups
  INSERT INTO category_limits (category_id, feature_id, limit_value)
  VALUES
    (v_town_manager_id, v_group_create_id, NULL),
    (v_town_manager_id, v_group_join_id, NULL),
    (v_town_manager_id, v_group_members_id, 100),
    (v_town_manager_id, v_sensitive_groups_id, 1)  -- 1 = enabled/true
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- ASSISTANT ADMIN TIER
  -- Unlimited everything
  INSERT INTO category_limits (category_id, feature_id, limit_value)
  VALUES
    (v_assistant_admin_id, v_group_create_id, NULL),
    (v_assistant_admin_id, v_group_join_id, NULL),
    (v_assistant_admin_id, v_group_members_id, NULL),
    (v_assistant_admin_id, v_sensitive_groups_id, 1)  -- 1 = enabled/true
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- EXEC ADMIN TIER
  -- Unlimited everything
  INSERT INTO category_limits (category_id, feature_id, limit_value)
  VALUES
    (v_exec_admin_id, v_group_create_id, NULL),
    (v_exec_admin_id, v_group_join_id, NULL),
    (v_exec_admin_id, v_group_members_id, NULL),
    (v_exec_admin_id, v_sensitive_groups_id, 1)  -- 1 = enabled/true
  ON CONFLICT (category_id, feature_id) DO NOTHING;

END $$;

-- ============================================================================
-- 3. VERIFY INSERTIONS
-- ============================================================================

-- Show newly added features
SELECT
  fd.feature_code,
  fd.display_name,
  uc.category_code,
  cl.limit_value
FROM category_limits cl
JOIN feature_definitions fd ON fd.id = cl.feature_id
JOIN user_categories uc ON uc.id = cl.category_id
WHERE fd.feature_code IN ('group_chats_create', 'group_chats_join', 'group_chat_members_max', 'sensitive_private_groups')
ORDER BY uc.sort_order, fd.sort_order;
