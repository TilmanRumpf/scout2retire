-- 🎯 USER ACCOUNT TIERS
-- Tracks subscription level for each user

-- ============================================================================
-- 1. CREATE ACCOUNT TIER ENUM
-- ============================================================================

CREATE TYPE account_tier AS ENUM (
  'free',              -- Rank 1: Free tier (default)
  'freemium',          -- Rank 2: Freemium (hidden)
  'premium',           -- Rank 3: Premium ($49/month, $490/year)
  'enterprise',        -- Rank 4: Enterprise ($200/month, $2000/year)
  'town_manager',      -- Rank 5: Town Manager (manages town content)
  'assistant_admin',   -- Rank 6: Assistant Admin (free, staff)
  'execadmin'          -- Rank 7: Executive Admin (free, platform oversight)
);

COMMENT ON TYPE account_tier IS 'User subscription/role tiers: free, freemium, premium, enterprise, town_manager, assistant_admin, execadmin';

-- ============================================================================
-- 2. ADD COLUMN TO USERS TABLE
-- ============================================================================

-- Add account_tier column to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_tier account_tier DEFAULT 'free';

CREATE INDEX IF NOT EXISTS idx_users_account_tier ON users(account_tier);

COMMENT ON COLUMN users.account_tier IS 'Current subscription/role tier: free, freemium, premium, enterprise, town_manager, assistant_admin, execadmin';

-- ============================================================================
-- 3. SET DEFAULT VALUES FOR EXISTING USERS
-- ============================================================================

-- All existing users default to 'free' (already set by DEFAULT)
-- You can manually update specific users:
-- UPDATE users SET account_tier = 'premium' WHERE id = '...';

-- ============================================================================
-- 4. HELPER FUNCTION: Can user create Sensitive Private groups?
-- ============================================================================

CREATE OR REPLACE FUNCTION can_create_sensitive_groups(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier account_tier;
BEGIN
  -- Get user's account tier
  SELECT account_tier INTO user_tier
  FROM users
  WHERE id = user_id;

  -- Elevated tiers can create Sensitive Private groups:
  -- premium, enterprise, town_manager, assistant_admin, execadmin
  RETURN user_tier IN ('premium', 'enterprise', 'town_manager', 'assistant_admin', 'execadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION can_create_sensitive_groups IS 'Returns true if user can create Sensitive Private groups (premium+)';

-- ============================================================================
-- 5. HELPER FUNCTION: Get tier display name
-- ============================================================================

CREATE OR REPLACE FUNCTION get_tier_display_name(tier account_tier)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE tier
    WHEN 'free' THEN 'Free'
    WHEN 'freemium' THEN 'Freemium'
    WHEN 'premium' THEN 'Premium'
    WHEN 'enterprise' THEN 'Enterprise'
    WHEN 'town_manager' THEN 'Town Manager'
    WHEN 'assistant_admin' THEN 'Assistant Admin'
    WHEN 'execadmin' THEN 'Executive Admin'
    ELSE 'Unknown'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 6. HELPER FUNCTION: Get tier rank (for comparisons)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_tier_rank(tier account_tier)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE tier
    WHEN 'free' THEN 1
    WHEN 'freemium' THEN 2
    WHEN 'premium' THEN 3
    WHEN 'enterprise' THEN 4
    WHEN 'town_manager' THEN 5
    WHEN 'assistant_admin' THEN 6
    WHEN 'execadmin' THEN 7
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_tier_rank IS 'Returns numeric rank for tier comparison (higher = more privileges)';

-- ============================================================================
-- 7. UPDATE EXECUTIVE ADMIN FUNCTION
-- ============================================================================

-- Update the ensure_executive_admin function to use account_tier
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

  -- Get an execadmin tier user
  -- Pick first available execadmin account
  SELECT id INTO v_exec_admin_id
  FROM users
  WHERE account_tier = 'execadmin'
  ORDER BY created_at ASC -- Use oldest/primary exec admin account
  LIMIT 1;

  IF v_exec_admin_id IS NULL THEN
    RAISE NOTICE 'No executive admin account found for thread %. Please create an exec_admin tier user.', p_thread_id;
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

  RAISE NOTICE 'Assigned exec admin % to thread %', v_exec_admin_id, p_thread_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. CREATE EXEC ADMIN ACCOUNT (If not exists)
-- ============================================================================

-- This is a placeholder - you'll need to either:
-- Option A: Sign up executive@scout2retire.com via normal Auth flow, then update tier
-- Option B: Create directly here (requires auth.users access)

-- Example for Option A (run after creating account via UI):
-- UPDATE users SET account_tier = 'execadmin' WHERE email = 'executive@scout2retire.com';

COMMENT ON COLUMN users.account_tier IS 'Account tier determines group creation privileges and feature access';
