-- =====================================================
-- USER ROLES & PAYWALL SYSTEM - COMPLETE MIGRATION
-- Created: October 4, 2025
-- Purpose: Implement dynamic subscription tiers, admin roles,
--          community roles, feature limits, and audit logging
-- =====================================================

-- =====================================================
-- TABLE 1: user_categories (Subscription Tiers)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  color_hex TEXT DEFAULT '#6B7280',
  badge_icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_category_code CHECK (category_code ~ '^[a-z_]+$'),
  CONSTRAINT valid_color CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_user_categories_active ON user_categories(is_active);
CREATE INDEX idx_user_categories_visible ON user_categories(is_visible);

COMMENT ON TABLE user_categories IS 'Dynamic subscription tiers (free, freemium, premium, enterprise)';

-- =====================================================
-- TABLE 2: feature_definitions (Master Feature List)
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  feature_group TEXT,
  limit_type TEXT DEFAULT 'count',
  reset_behavior TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_feature_code CHECK (feature_code ~ '^[a-z_]+$'),
  CONSTRAINT valid_limit_type CHECK (limit_type IN ('count', 'boolean', 'bytes', 'custom')),
  CONSTRAINT valid_reset_behavior CHECK (reset_behavior IN ('none', 'daily', 'weekly', 'monthly', 'yearly') OR reset_behavior IS NULL)
);

CREATE INDEX idx_feature_definitions_active ON feature_definitions(is_active);
CREATE INDEX idx_feature_definitions_group ON feature_definitions(feature_group);

COMMENT ON TABLE feature_definitions IS 'Master list of all features that can be limited by subscription tier';

-- =====================================================
-- TABLE 3: category_limits (Feature Flags)
-- =====================================================
CREATE TABLE IF NOT EXISTS category_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES user_categories(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES feature_definitions(id) ON DELETE CASCADE,
  limit_value INTEGER,
  reset_period_override TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, feature_id),
  CONSTRAINT valid_reset_override CHECK (reset_period_override IN ('none', 'daily', 'weekly', 'monthly', 'yearly') OR reset_period_override IS NULL)
);

CREATE INDEX idx_category_limits_category ON category_limits(category_id);
CREATE INDEX idx_category_limits_feature ON category_limits(feature_id);

COMMENT ON TABLE category_limits IS 'Dynamic feature limits per subscription tier (NULL = unlimited)';
COMMENT ON COLUMN category_limits.limit_value IS 'NULL means unlimited, 0 means disabled, >0 is the limit';

-- =====================================================
-- TABLE 4: audit_log (GDPR-Compliant Immutable Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (id, performed_at),
  CONSTRAINT valid_action_type CHECK (action_type IN ('create', 'update', 'delete', 'access', 'login', 'logout', 'verify', 'revoke'))
) PARTITION BY RANGE (performed_at);

-- Create monthly partitions for performance (create first 3 months)
CREATE TABLE IF NOT EXISTS audit_log_2025_10 PARTITION OF audit_log
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE IF NOT EXISTS audit_log_2025_11 PARTITION OF audit_log
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE IF NOT EXISTS audit_log_2025_12 PARTITION OF audit_log
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE INDEX idx_audit_log_user ON audit_log(user_id, performed_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id, performed_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action_type, performed_at DESC);
CREATE INDEX idx_audit_log_performer ON audit_log(performed_by_user_id, performed_at DESC);

COMMENT ON TABLE audit_log IS 'Immutable audit trail for GDPR compliance - partitioned by month';

-- =====================================================
-- TABLE 5: Alter users table (Add subscription & role columns)
-- =====================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES user_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_joined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS community_role TEXT DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS community_role_town_id UUID REFERENCES towns(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS community_role_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS roles_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS roles_updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add constraints for valid values
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS valid_admin_role,
  ADD CONSTRAINT valid_admin_role CHECK (admin_role IN ('user', 'moderator', 'admin', 'executive_admin', 'auditor'));

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS valid_community_role,
  ADD CONSTRAINT valid_community_role CHECK (community_role IN ('regular', 'scout', 'service_provider', 'town_ambassador'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_category ON users(category_id);
CREATE INDEX IF NOT EXISTS idx_users_admin_role ON users(admin_role);
CREATE INDEX IF NOT EXISTS idx_users_community_role ON users(community_role);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

COMMENT ON COLUMN users.category_id IS 'Current subscription tier (free/freemium/premium/enterprise)';
COMMENT ON COLUMN users.admin_role IS 'Admin access level (user/moderator/admin/executive_admin/auditor)';
COMMENT ON COLUMN users.community_role IS 'Special community privileges (regular/scout/service_provider/town_ambassador)';

-- =====================================================
-- POPULATE: Initial Data - User Categories (Tiers)
-- =====================================================
INSERT INTO user_categories (category_code, display_name, description, price_monthly, price_yearly, is_active, is_visible, sort_order, color_hex, badge_icon)
VALUES
  ('free', 'Free', 'Basic access to Scout2Retire features', 0.00, 0.00, true, true, 1, '#6B7280', '🆓'),
  ('freemium', 'Freemium', 'Enhanced free tier (hidden initially)', 0.00, 0.00, true, false, 2, '#10B981', '⭐'),
  ('premium', 'Premium', 'Full access for serious retirement planners', 49.00, 490.00, true, true, 3, '#3B82F6', '💎'),
  ('enterprise', 'Enterprise', 'For service providers and town ambassadors', 200.00, 2000.00, true, true, 4, '#8B5CF6', '🏆')
ON CONFLICT (category_code) DO NOTHING;

-- =====================================================
-- POPULATE: Initial Data - Feature Definitions
-- =====================================================
INSERT INTO feature_definitions (feature_code, display_name, description, feature_group, limit_type, reset_behavior, icon, sort_order, is_active)
VALUES
  -- Social Features
  ('chat_partners', 'Chat Partners', 'Maximum number of friend connections', 'social', 'count', 'none', '👥', 1, true),
  ('town_favorites', 'Town Favorites', 'Number of towns you can save as favorites', 'discovery', 'count', 'none', '⭐', 2, true),

  -- Discovery Features
  ('regions', 'Regions in Preferences', 'Number of regions you can select in preferences', 'discovery', 'count', 'none', '🗺️', 3, true),
  ('town_displays', 'Town Search Results', 'Maximum towns shown in search results', 'discovery', 'count', 'none', '🔍', 4, true),
  ('fresh_discoveries', 'Fresh Town Discoveries', 'New towns recommended daily', 'discovery', 'count', 'daily', '✨', 5, true),
  ('top_matches', 'Top Matches', 'Number of top matches shown on Today page', 'discovery', 'count', 'none', '🎯', 6, true),
  ('compare_towns', 'Compare Towns', 'Number of towns you can compare side-by-side', 'discovery', 'count', 'none', '⚖️', 7, true),

  -- AI Features
  ('scotty_chats', 'Scotty AI Conversations', 'AI-powered retirement planning chats', 'ai', 'count', 'monthly', '🤖', 8, true),

  -- Enterprise Features (hidden from free/premium)
  ('pdf_exports', 'PDF Exports', 'Export town comparisons and reports to PDF', 'enterprise', 'count', 'monthly', '📄', 9, true),
  ('white_label_reports', 'White Label Reports', 'Custom branded reports for service providers', 'enterprise', 'boolean', 'none', '🏷️', 10, true),
  ('api_access', 'API Access', 'Programmatic access to Scout2Retire data', 'enterprise', 'boolean', 'none', '🔌', 11, true),
  ('team_seats', 'Team Seats', 'Number of team members for collaborative planning', 'enterprise', 'count', 'none', '👨‍👩‍👧‍👦', 12, true)
ON CONFLICT (feature_code) DO NOTHING;

-- =====================================================
-- POPULATE: Initial Data - Category Limits
-- =====================================================
DO $$
DECLARE
  v_free_id UUID;
  v_freemium_id UUID;
  v_premium_id UUID;
  v_enterprise_id UUID;

  v_chat_partners_id UUID;
  v_town_favorites_id UUID;
  v_regions_id UUID;
  v_town_displays_id UUID;
  v_scotty_chats_id UUID;
  v_top_matches_id UUID;
  v_compare_towns_id UUID;
  v_fresh_discoveries_id UUID;
  v_pdf_exports_id UUID;
  v_white_label_id UUID;
  v_api_access_id UUID;
  v_team_seats_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO v_free_id FROM user_categories WHERE category_code = 'free';
  SELECT id INTO v_freemium_id FROM user_categories WHERE category_code = 'freemium';
  SELECT id INTO v_premium_id FROM user_categories WHERE category_code = 'premium';
  SELECT id INTO v_enterprise_id FROM user_categories WHERE category_code = 'enterprise';

  -- Get feature IDs
  SELECT id INTO v_chat_partners_id FROM feature_definitions WHERE feature_code = 'chat_partners';
  SELECT id INTO v_town_favorites_id FROM feature_definitions WHERE feature_code = 'town_favorites';
  SELECT id INTO v_regions_id FROM feature_definitions WHERE feature_code = 'regions';
  SELECT id INTO v_town_displays_id FROM feature_definitions WHERE feature_code = 'town_displays';
  SELECT id INTO v_scotty_chats_id FROM feature_definitions WHERE feature_code = 'scotty_chats';
  SELECT id INTO v_top_matches_id FROM feature_definitions WHERE feature_code = 'top_matches';
  SELECT id INTO v_compare_towns_id FROM feature_definitions WHERE feature_code = 'compare_towns';
  SELECT id INTO v_fresh_discoveries_id FROM feature_definitions WHERE feature_code = 'fresh_discoveries';
  SELECT id INTO v_pdf_exports_id FROM feature_definitions WHERE feature_code = 'pdf_exports';
  SELECT id INTO v_white_label_id FROM feature_definitions WHERE feature_code = 'white_label_reports';
  SELECT id INTO v_api_access_id FROM feature_definitions WHERE feature_code = 'api_access';
  SELECT id INTO v_team_seats_id FROM feature_definitions WHERE feature_code = 'team_seats';

  -- FREE TIER LIMITS
  INSERT INTO category_limits (category_id, feature_id, limit_value) VALUES
    (v_free_id, v_chat_partners_id, 3),
    (v_free_id, v_town_favorites_id, 5),
    (v_free_id, v_regions_id, 2),
    (v_free_id, v_town_displays_id, 50),
    (v_free_id, v_scotty_chats_id, 3),
    (v_free_id, v_top_matches_id, 3),
    (v_free_id, v_compare_towns_id, 2),
    (v_free_id, v_fresh_discoveries_id, 3),
    (v_free_id, v_pdf_exports_id, 0),        -- Disabled for free
    (v_free_id, v_white_label_id, 0),        -- Disabled
    (v_free_id, v_api_access_id, 0),         -- Disabled
    (v_free_id, v_team_seats_id, 1)          -- Solo only
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- FREEMIUM TIER LIMITS (slightly better than free)
  INSERT INTO category_limits (category_id, feature_id, limit_value) VALUES
    (v_freemium_id, v_chat_partners_id, 5),
    (v_freemium_id, v_town_favorites_id, 10),
    (v_freemium_id, v_regions_id, 3),
    (v_freemium_id, v_town_displays_id, 100),
    (v_freemium_id, v_scotty_chats_id, 10),
    (v_freemium_id, v_top_matches_id, 5),
    (v_freemium_id, v_compare_towns_id, 3),
    (v_freemium_id, v_fresh_discoveries_id, 5),
    (v_freemium_id, v_pdf_exports_id, 1),    -- 1 per month
    (v_freemium_id, v_white_label_id, 0),    -- Disabled
    (v_freemium_id, v_api_access_id, 0),     -- Disabled
    (v_freemium_id, v_team_seats_id, 1)      -- Solo only
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- PREMIUM TIER LIMITS (generous limits, not unlimited)
  INSERT INTO category_limits (category_id, feature_id, limit_value) VALUES
    (v_premium_id, v_chat_partners_id, NULL),      -- Unlimited
    (v_premium_id, v_town_favorites_id, NULL),     -- Unlimited
    (v_premium_id, v_regions_id, NULL),            -- Unlimited
    (v_premium_id, v_town_displays_id, NULL),      -- Unlimited
    (v_premium_id, v_scotty_chats_id, 50),         -- 50 per month
    (v_premium_id, v_top_matches_id, 10),
    (v_premium_id, v_compare_towns_id, 5),
    (v_premium_id, v_fresh_discoveries_id, 10),
    (v_premium_id, v_pdf_exports_id, 10),          -- 10 per month
    (v_premium_id, v_white_label_id, 0),           -- Disabled
    (v_premium_id, v_api_access_id, 0),            -- Disabled
    (v_premium_id, v_team_seats_id, 2)             -- 2 people
  ON CONFLICT (category_id, feature_id) DO NOTHING;

  -- ENTERPRISE TIER LIMITS (truly unlimited)
  INSERT INTO category_limits (category_id, feature_id, limit_value) VALUES
    (v_enterprise_id, v_chat_partners_id, NULL),      -- Unlimited
    (v_enterprise_id, v_town_favorites_id, NULL),     -- Unlimited
    (v_enterprise_id, v_regions_id, NULL),            -- Unlimited
    (v_enterprise_id, v_town_displays_id, NULL),      -- Unlimited
    (v_enterprise_id, v_scotty_chats_id, NULL),       -- Unlimited
    (v_enterprise_id, v_top_matches_id, 20),
    (v_enterprise_id, v_compare_towns_id, 10),
    (v_enterprise_id, v_fresh_discoveries_id, NULL),  -- Unlimited
    (v_enterprise_id, v_pdf_exports_id, NULL),        -- Unlimited
    (v_enterprise_id, v_white_label_id, 1),           -- Enabled
    (v_enterprise_id, v_api_access_id, 1),            -- Enabled
    (v_enterprise_id, v_team_seats_id, NULL)          -- Unlimited
  ON CONFLICT (category_id, feature_id) DO NOTHING;
END $$;

-- =====================================================
-- FUNCTION: set_category_limits (Helper for admin UI)
-- =====================================================
CREATE OR REPLACE FUNCTION set_category_limits(
  p_category_code TEXT,
  p_limits JSONB
) RETURNS VOID AS $$
DECLARE
  v_category_id UUID;
  v_feature_id UUID;
  v_feature_code TEXT;
  v_limit_value INTEGER;
BEGIN
  -- Get category ID
  SELECT id INTO v_category_id
  FROM user_categories
  WHERE category_code = p_category_code;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'Category % not found', p_category_code;
  END IF;

  -- Iterate through JSONB keys
  FOR v_feature_code, v_limit_value IN
    SELECT key, value::text::integer
    FROM jsonb_each_text(p_limits)
  LOOP
    -- Get feature ID
    SELECT id INTO v_feature_id
    FROM feature_definitions
    WHERE feature_code = v_feature_code;

    IF v_feature_id IS NOT NULL THEN
      -- Upsert limit
      INSERT INTO category_limits (category_id, feature_id, limit_value)
      VALUES (v_category_id, v_feature_id, v_limit_value)
      ON CONFLICT (category_id, feature_id)
      DO UPDATE SET
        limit_value = EXCLUDED.limit_value,
        updated_at = NOW();
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_category_limits IS 'Helper function to bulk-set limits for a category using JSONB input';

-- =====================================================
-- FUNCTION: check_admin_access (Role Verification)
-- =====================================================
CREATE OR REPLACE FUNCTION check_admin_access(
  p_required_role TEXT DEFAULT 'admin'
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_role TEXT;
  v_role_hierarchy INTEGER;
  v_required_hierarchy INTEGER;
BEGIN
  -- Get current user's admin role
  SELECT admin_role INTO v_user_role
  FROM users
  WHERE id = auth.uid();

  IF v_user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Define role hierarchy (higher = more power)
  v_role_hierarchy := CASE v_user_role
    WHEN 'executive_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    WHEN 'auditor' THEN 2  -- Same level as moderator but read-only
    WHEN 'user' THEN 1
    ELSE 0
  END;

  v_required_hierarchy := CASE p_required_role
    WHEN 'executive_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    WHEN 'auditor' THEN 2
    WHEN 'user' THEN 1
    ELSE 0
  END;

  RETURN v_role_hierarchy >= v_required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_admin_access IS 'Check if current user has required admin role';

-- =====================================================
-- FUNCTION: get_user_limits (Fetch User's Feature Limits)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_limits()
RETURNS TABLE (
  feature_code TEXT,
  feature_name TEXT,
  feature_group TEXT,
  limit_value INTEGER,
  reset_period TEXT,
  is_unlimited BOOLEAN,
  icon TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fd.feature_code,
    fd.display_name AS feature_name,
    fd.feature_group,
    cl.limit_value,
    COALESCE(cl.reset_period_override, fd.reset_behavior) AS reset_period,
    (cl.limit_value IS NULL) AS is_unlimited,
    fd.icon
  FROM users u
  JOIN user_categories uc ON u.category_id = uc.id
  JOIN category_limits cl ON cl.category_id = uc.id
  JOIN feature_definitions fd ON cl.feature_id = fd.id
  WHERE u.id = auth.uid()
    AND fd.is_active = true
  ORDER BY fd.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_limits IS 'Get all feature limits for the current user';

-- =====================================================
-- FUNCTION: can_user_perform (Check Action Permission)
-- =====================================================
CREATE OR REPLACE FUNCTION can_user_perform(
  p_feature_code TEXT,
  p_current_usage INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  v_limit INTEGER;
  v_category_code TEXT;
  v_feature_name TEXT;
  v_next_tier TEXT;
  v_result JSONB;
BEGIN
  -- Get user's limit for this feature
  SELECT
    cl.limit_value,
    uc.category_code,
    fd.display_name
  INTO v_limit, v_category_code, v_feature_name
  FROM users u
  JOIN user_categories uc ON u.category_id = uc.id
  JOIN category_limits cl ON cl.category_id = uc.id
  JOIN feature_definitions fd ON cl.feature_id = fd.id
  WHERE u.id = auth.uid()
    AND fd.feature_code = p_feature_code;

  -- If no limit found, deny by default
  IF v_limit IS NULL AND v_category_code IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Feature not found or not available for your tier',
      'current_usage', p_current_usage,
      'limit', 0
    );
  END IF;

  -- NULL limit = unlimited
  IF v_limit IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'Unlimited',
      'current_usage', p_current_usage,
      'limit', NULL,
      'is_unlimited', true
    );
  END IF;

  -- 0 = disabled
  IF v_limit = 0 THEN
    -- Suggest upgrade tier
    v_next_tier := CASE v_category_code
      WHEN 'free' THEN 'premium'
      WHEN 'freemium' THEN 'premium'
      WHEN 'premium' THEN 'enterprise'
      ELSE NULL
    END;

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Feature not available in ' || v_category_code || ' tier',
      'current_usage', p_current_usage,
      'limit', 0,
      'upgrade_to', v_next_tier,
      'feature_name', v_feature_name
    );
  END IF;

  -- Check if under limit
  IF p_current_usage < v_limit THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'Within limit',
      'current_usage', p_current_usage,
      'limit', v_limit,
      'remaining', v_limit - p_current_usage
    );
  ELSE
    -- At or over limit - suggest upgrade
    v_next_tier := CASE v_category_code
      WHEN 'free' THEN 'premium'
      WHEN 'freemium' THEN 'premium'
      WHEN 'premium' THEN 'enterprise'
      ELSE NULL
    END;

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Limit reached',
      'current_usage', p_current_usage,
      'limit', v_limit,
      'remaining', 0,
      'upgrade_to', v_next_tier,
      'feature_name', v_feature_name
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_user_perform IS 'Check if user can perform action given current usage - returns JSONB with allowed status and upgrade suggestions';

-- =====================================================
-- FUNCTION: verify_service_provider (Admin Verification)
-- =====================================================
CREATE OR REPLACE FUNCTION verify_service_provider(
  p_user_id UUID,
  p_town_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_enterprise_id UUID;
  v_admin_user_id UUID;
  v_result JSONB;
BEGIN
  -- Check if caller is admin
  IF NOT check_admin_access('admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized - admin access required'
    );
  END IF;

  v_admin_user_id := auth.uid();

  -- Get enterprise category ID
  SELECT id INTO v_enterprise_id
  FROM user_categories
  WHERE category_code = 'enterprise';

  -- Update user with service_provider role and enterprise tier
  UPDATE users
  SET
    community_role = 'service_provider',
    community_role_town_id = p_town_id,
    community_role_verified_at = NOW(),
    category_id = v_enterprise_id,
    category_joined_at = NOW(),
    roles_updated_at = NOW(),
    roles_updated_by = v_admin_user_id
  WHERE id = p_user_id;

  -- Log to audit trail
  INSERT INTO audit_log (
    user_id,
    action_type,
    entity_type,
    entity_id,
    new_value,
    performed_by_user_id,
    metadata
  ) VALUES (
    p_user_id,
    'verify',
    'service_provider',
    p_user_id,
    jsonb_build_object(
      'community_role', 'service_provider',
      'category_code', 'enterprise',
      'town_id', p_town_id
    ),
    v_admin_user_id,
    jsonb_build_object('verified_at', NOW())
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Service provider verified and upgraded to Enterprise tier'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_service_provider IS 'Admin function to verify service provider and auto-upgrade to Enterprise';

-- =====================================================
-- TRIGGER: audit_user_changes (Auto-log user changes)
-- =====================================================
CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log changes to subscription/role columns
  IF (TG_OP = 'UPDATE' AND (
    OLD.category_id IS DISTINCT FROM NEW.category_id OR
    OLD.admin_role IS DISTINCT FROM NEW.admin_role OR
    OLD.community_role IS DISTINCT FROM NEW.community_role
  )) THEN
    INSERT INTO audit_log (
      user_id,
      action_type,
      entity_type,
      entity_id,
      old_value,
      new_value,
      performed_by_user_id
    ) VALUES (
      NEW.id,
      'update',
      'user_roles',
      NEW.id,
      jsonb_build_object(
        'category_id', OLD.category_id,
        'admin_role', OLD.admin_role,
        'community_role', OLD.community_role,
        'community_role_town_id', OLD.community_role_town_id
      ),
      jsonb_build_object(
        'category_id', NEW.category_id,
        'admin_role', NEW.admin_role,
        'community_role', NEW.community_role,
        'community_role_town_id', NEW.community_role_town_id
      ),
      COALESCE(NEW.roles_updated_by, auth.uid())
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_user_changes ON users;
CREATE TRIGGER trigger_audit_user_changes
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_user_changes();

COMMENT ON FUNCTION audit_user_changes IS 'Automatically log changes to user subscription tier and roles';

-- =====================================================
-- RLS POLICIES: Row Level Security
-- =====================================================

-- user_categories: Public read, admin write
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_categories_select_all" ON user_categories
  FOR SELECT USING (is_visible = true OR check_admin_access('moderator'));

CREATE POLICY "user_categories_admin_all" ON user_categories
  FOR ALL USING (check_admin_access('executive_admin'));

-- feature_definitions: Public read active features, admin write
ALTER TABLE feature_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_definitions_select_active" ON feature_definitions
  FOR SELECT USING (is_active = true OR check_admin_access('moderator'));

CREATE POLICY "feature_definitions_admin_all" ON feature_definitions
  FOR ALL USING (check_admin_access('executive_admin'));

-- category_limits: Users can read their own limits, admin can edit
ALTER TABLE category_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "category_limits_select_own" ON category_limits
  FOR SELECT USING (
    category_id IN (
      SELECT category_id FROM users WHERE id = auth.uid()
    ) OR check_admin_access('moderator')
  );

CREATE POLICY "category_limits_admin_all" ON category_limits
  FOR ALL USING (check_admin_access('executive_admin'));

-- audit_log: Immutable, only auditors/executive_admins can read
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_auditors" ON audit_log
  FOR SELECT USING (
    check_admin_access('auditor') OR check_admin_access('executive_admin')
  );

CREATE POLICY "audit_log_insert_only" ON audit_log
  FOR INSERT WITH CHECK (true);  -- Allow inserts from triggers

CREATE POLICY "audit_log_no_update" ON audit_log
  FOR UPDATE USING (false);  -- Prevent updates (immutable)

CREATE POLICY "audit_log_no_delete" ON audit_log
  FOR DELETE USING (false);  -- Prevent deletes (immutable)

-- =====================================================
-- DEFAULT DATA: Set all existing users to 'free' tier
-- =====================================================
DO $$
DECLARE
  v_free_id UUID;
BEGIN
  SELECT id INTO v_free_id FROM user_categories WHERE category_code = 'free';

  UPDATE users
  SET
    category_id = v_free_id,
    category_joined_at = COALESCE(created_at, NOW()),
    admin_role = COALESCE(admin_role, 'user'),
    community_role = COALESCE(community_role, 'regular')
  WHERE category_id IS NULL;
END $$;

-- =====================================================
-- VERIFICATION QUERIES (for testing)
-- =====================================================
COMMENT ON SCHEMA public IS 'User Roles & Paywall System installed - October 4, 2025';

-- Test queries (comment out before production):
-- SELECT * FROM user_categories ORDER BY sort_order;
-- SELECT * FROM feature_definitions ORDER BY sort_order;
-- SELECT * FROM category_limits;
-- SELECT get_user_limits();
-- SELECT can_user_perform('chat_partners', 2);
-- SELECT check_admin_access('admin');
