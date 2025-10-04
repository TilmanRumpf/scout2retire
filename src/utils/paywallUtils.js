import supabase from './supabaseClient';

/**
 * Check if user can perform an action based on their subscription tier
 * @param {string} featureCode - Feature code (e.g., 'chat_partners', 'town_favorites')
 * @param {number} currentUsage - Current usage count
 * @returns {Promise<Object>} Result object with allowed, reason, limit, remaining, upgrade_to
 */
export async function canUserPerform(featureCode, currentUsage = 0) {
  try {
    const { data, error } = await supabase.rpc('can_user_perform', {
      p_feature_code: featureCode,
      p_current_usage: currentUsage
    });

    if (error) {
      console.error('Error checking user limit:', error);
      // Fail open - allow action if check fails
      return {
        allowed: true,
        reason: 'Limit check unavailable',
        error: error.message
      };
    }

    return data;
  } catch (err) {
    console.error('Exception checking user limit:', err);
    return {
      allowed: true,
      reason: 'Limit check unavailable',
      error: err.message
    };
  }
}

/**
 * Get all feature limits for current user
 * @returns {Promise<Array>} Array of feature limit objects
 */
export async function getUserLimits() {
  try {
    const { data, error } = await supabase.rpc('get_user_limits');

    if (error) {
      console.error('Error getting user limits:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception getting user limits:', err);
    return [];
  }
}

/**
 * Get current user's subscription category
 * @returns {Promise<Object>} User category object with display_name, color_hex, badge_icon
 */
export async function getUserCategory() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select(`
        category_id,
        category:user_categories (
          category_code,
          display_name,
          color_hex,
          badge_icon,
          price_monthly,
          price_yearly
        )
      `)
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error getting user category:', error);
      return null;
    }

    return data?.category || null;
  } catch (err) {
    console.error('Exception getting user category:', err);
    return null;
  }
}

/**
 * Check if current user has required admin role
 * @param {string} requiredRole - Required role (user/moderator/admin/executive_admin/auditor)
 * @returns {Promise<boolean>}
 */
export async function checkAdminAccess(requiredRole = 'admin') {
  try {
    const { data, error } = await supabase.rpc('check_admin_access', {
      p_required_role: requiredRole
    });

    if (error) {
      console.error('Error checking admin access:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('Exception checking admin access:', err);
    return false;
  }
}

/**
 * Get feature limit value for current user
 * @param {string} featureCode - Feature code
 * @returns {Promise<number|null>} Limit value (null = unlimited)
 */
export async function getFeatureLimit(featureCode) {
  const limits = await getUserLimits();
  const feature = limits.find(f => f.feature_code === featureCode);
  return feature?.limit_value ?? null;
}

/**
 * Format limit for display (handles unlimited)
 * @param {number|null} limit - Limit value
 * @returns {string} Formatted string
 */
export function formatLimit(limit) {
  if (limit === null) return 'Unlimited';
  if (limit === 0) return 'Not available';
  return limit.toString();
}

/**
 * Get upgrade CTA text based on current tier
 * @param {string} upgradeTo - Suggested upgrade tier
 * @returns {string} CTA text
 */
export function getUpgradeCTA(upgradeTo) {
  const ctas = {
    premium: 'Upgrade to Premium',
    enterprise: 'Upgrade to Enterprise',
    freemium: 'Unlock More Features'
  };
  return ctas[upgradeTo] || 'Upgrade Now';
}
