-- =====================================================
-- ROLLBACK: Cumulative Tier Privileges
-- Date: October 4, 2025 14:10
-- Description: Revert to original non-cumulative behavior
--              The cumulative logic was fundamentally broken
-- =====================================================

-- Drop broken function
DROP FUNCTION IF EXISTS get_user_limits();

-- =====================================================
-- RESTORE ORIGINAL: can_user_perform
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
  -- Get user's limit for this feature (ONLY their current tier, no cumulative)
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
      ELSE 'premium'
    END;

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Feature "%s" is not available in your current tier', v_feature_name),
      'current_usage', p_current_usage,
      'limit', 0,
      'upgrade_to', v_next_tier,
      'feature_name', v_feature_name
    );
  END IF;

  -- Check if usage exceeds limit
  IF p_current_usage >= v_limit THEN
    v_next_tier := CASE v_category_code
      WHEN 'free' THEN 'premium'
      WHEN 'freemium' THEN 'premium'
      WHEN 'premium' THEN 'enterprise'
      ELSE 'premium'
    END;

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('You have reached your limit for %s (%s/%s)', v_feature_name, p_current_usage, v_limit),
      'current_usage', p_current_usage,
      'limit', v_limit,
      'upgrade_to', v_next_tier,
      'feature_name', v_feature_name
    );
  END IF;

  -- User is within limit
  RETURN jsonb_build_object(
    'allowed', true,
    'reason', 'Within limit',
    'current_usage', p_current_usage,
    'limit', v_limit,
    'remaining', v_limit - p_current_usage,
    'is_unlimited', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_user_perform IS 'Check if user can perform action based on their tier limits (RESTORED - no cumulative)';

-- =====================================================
-- RESTORE ORIGINAL: get_user_limits
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

COMMENT ON FUNCTION get_user_limits IS 'Get all feature limits for the current user (RESTORED - no cumulative)';
