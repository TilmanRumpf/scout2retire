-- =====================================================
-- MIGRATION: Cumulative Tier Privileges
-- Date: October 4, 2025 14:00
-- Description: Higher tiers inherit ALL privileges from lower tiers
--              Users get MAX(all_lower_tier_limits, current_tier_limit)
-- =====================================================

-- Drop existing function to change return type
DROP FUNCTION IF EXISTS get_user_limits();

-- =====================================================
-- FUNCTION: can_user_perform (Updated with cumulative privileges)
-- =====================================================
CREATE OR REPLACE FUNCTION can_user_perform(
  p_feature_code TEXT,
  p_current_usage INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  v_limit INTEGER;
  v_category_code TEXT;
  v_category_sort_order INTEGER;
  v_feature_name TEXT;
  v_next_tier TEXT;
  v_max_limit INTEGER;
  v_result JSONB;
BEGIN
  -- Get user's current tier and sort_order
  SELECT
    uc.category_code,
    uc.sort_order
  INTO v_category_code, v_category_sort_order
  FROM users u
  JOIN user_categories uc ON u.category_id = uc.id
  WHERE u.id = auth.uid();

  -- If no category found, deny
  IF v_category_code IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'User tier not found',
      'current_usage', p_current_usage,
      'limit', 0
    );
  END IF;

  -- Get the MAXIMUM limit across current tier AND all lower tiers (cumulative privileges)
  -- NULL (unlimited) > any number, so use GREATEST with COALESCE
  SELECT
    fd.display_name,
    CASE
      -- If ANY tier (current or below) has unlimited (NULL), user gets unlimited
      WHEN COUNT(*) FILTER (WHERE cl.limit_value IS NULL) > 0 THEN NULL
      -- Otherwise, take the maximum limit value across all tiers at or below user's tier
      ELSE GREATEST(COALESCE(MAX(cl.limit_value), 0))
    END
  INTO v_feature_name, v_max_limit
  FROM feature_definitions fd
  LEFT JOIN category_limits cl ON cl.feature_id = fd.id
  LEFT JOIN user_categories uc ON uc.id = cl.category_id
  WHERE fd.feature_code = p_feature_code
    AND fd.is_active = true
    -- Include current tier AND all tiers with lower sort_order (lower ranks)
    AND (uc.sort_order IS NULL OR uc.sort_order <= v_category_sort_order)
  GROUP BY fd.display_name;

  -- If feature not found
  IF v_feature_name IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Feature not found or not available',
      'current_usage', p_current_usage,
      'limit', 0
    );
  END IF;

  -- NULL limit = unlimited (inherited from any lower tier or current tier)
  IF v_max_limit IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'Unlimited (cumulative privilege)',
      'current_usage', p_current_usage,
      'limit', NULL,
      'is_unlimited', true
    );
  END IF;

  -- 0 = disabled across all tiers (user has no access)
  IF v_max_limit = 0 THEN
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

  -- Check if usage exceeds the maximum cumulative limit
  IF p_current_usage >= v_max_limit THEN
    v_next_tier := CASE v_category_code
      WHEN 'free' THEN 'premium'
      WHEN 'freemium' THEN 'premium'
      WHEN 'premium' THEN 'enterprise'
      ELSE 'premium'
    END;

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('You have reached your limit for %s (%s/%s)', v_feature_name, p_current_usage, v_max_limit),
      'current_usage', p_current_usage,
      'limit', v_max_limit,
      'upgrade_to', v_next_tier,
      'feature_name', v_feature_name
    );
  END IF;

  -- User is within limit
  RETURN jsonb_build_object(
    'allowed', true,
    'reason', 'Within limit',
    'current_usage', p_current_usage,
    'limit', v_max_limit,
    'remaining', v_max_limit - p_current_usage,
    'is_unlimited', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_user_perform IS 'Check if user can perform action - uses CUMULATIVE privileges from all lower tiers';

-- =====================================================
-- FUNCTION: get_user_limits (Updated to show cumulative limits)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_limits()
RETURNS TABLE (
  feature_code TEXT,
  feature_name TEXT,
  feature_group TEXT,
  limit_value INTEGER,
  reset_period TEXT,
  is_unlimited BOOLEAN,
  icon TEXT,
  inherited_from TEXT
) AS $$
DECLARE
  v_user_sort_order INTEGER;
BEGIN
  -- Get user's tier sort_order
  SELECT uc.sort_order INTO v_user_sort_order
  FROM users u
  JOIN user_categories uc ON u.category_id = uc.id
  WHERE u.id = auth.uid();

  -- Return cumulative limits (MAX across current + lower tiers)
  RETURN QUERY
  SELECT
    fd.feature_code,
    fd.display_name AS feature_name,
    fd.feature_group,
    CASE
      -- If ANY tier has unlimited, show unlimited
      WHEN COUNT(*) FILTER (WHERE cl.limit_value IS NULL) > 0 THEN NULL
      -- Otherwise show max limit
      ELSE GREATEST(COALESCE(MAX(cl.limit_value), 0))
    END AS limit_value,
    COALESCE(MAX(cl.reset_period_override), fd.reset_behavior) AS reset_period,
    (COUNT(*) FILTER (WHERE cl.limit_value IS NULL) > 0) AS is_unlimited,
    fd.icon,
    CASE
      -- Show which tier provided the max limit
      WHEN COUNT(*) FILTER (WHERE cl.limit_value IS NULL) > 0 THEN
        (SELECT uc.display_name FROM user_categories uc
         JOIN category_limits cl2 ON cl2.category_id = uc.id
         WHERE cl2.feature_id = fd.id AND cl2.limit_value IS NULL
         AND uc.sort_order <= v_user_sort_order
         ORDER BY uc.sort_order DESC LIMIT 1)
      ELSE
        (SELECT uc.display_name FROM user_categories uc
         JOIN category_limits cl2 ON cl2.category_id = uc.id
         WHERE cl2.feature_id = fd.id
         AND uc.sort_order <= v_user_sort_order
         AND cl2.limit_value = GREATEST(COALESCE(MAX(cl.limit_value), 0))
         ORDER BY uc.sort_order DESC LIMIT 1)
    END AS inherited_from
  FROM feature_definitions fd
  LEFT JOIN category_limits cl ON cl.feature_id = fd.id
  LEFT JOIN user_categories uc ON uc.id = cl.category_id
  WHERE fd.is_active = true
    AND (uc.sort_order IS NULL OR uc.sort_order <= v_user_sort_order)
  GROUP BY fd.feature_code, fd.display_name, fd.feature_group, fd.reset_behavior, fd.icon, fd.sort_order, fd.id
  ORDER BY fd.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_limits IS 'Get all CUMULATIVE feature limits for the current user (inherits from lower tiers)';
