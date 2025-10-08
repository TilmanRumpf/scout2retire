// 🎯 ACCOUNT TIER UTILITIES
// Helper functions for checking user permissions based on account tier

/**
 * Account tier definitions matching User Manager & Paywall
 */
export const ACCOUNT_TIERS = {
  FREE: 'free',              // Rank 1: Free tier (default)
  FREEMIUM: 'freemium',      // Rank 2: Freemium (hidden)
  PREMIUM: 'premium',        // Rank 3: Premium ($49/month, $490/year)
  ENTERPRISE: 'enterprise',  // Rank 4: Enterprise ($200/month, $2000/year)
  TOWN_MANAGER: 'town_manager', // Rank 5: Town Manager (manages town content)
  ASSISTANT_ADMIN: 'assistant_admin', // Rank 6: Assistant Admin (free, staff)
  EXEC_ADMIN: 'execadmin'    // Rank 7: Executive Admin (free, platform oversight)
};

/**
 * Tier ranks for comparison (higher = more privileges)
 */
const TIER_RANKS = {
  [ACCOUNT_TIERS.FREE]: 1,
  [ACCOUNT_TIERS.FREEMIUM]: 2,
  [ACCOUNT_TIERS.PREMIUM]: 3,
  [ACCOUNT_TIERS.ENTERPRISE]: 4,
  [ACCOUNT_TIERS.TOWN_MANAGER]: 5,
  [ACCOUNT_TIERS.ASSISTANT_ADMIN]: 6,
  [ACCOUNT_TIERS.EXEC_ADMIN]: 7
};

/**
 * Display names for each tier
 */
export const TIER_DISPLAY_NAMES = {
  [ACCOUNT_TIERS.FREE]: 'Free',
  [ACCOUNT_TIERS.FREEMIUM]: 'Freemium',
  [ACCOUNT_TIERS.PREMIUM]: 'Premium',
  [ACCOUNT_TIERS.ENTERPRISE]: 'Enterprise',
  [ACCOUNT_TIERS.TOWN_MANAGER]: 'Town Manager',
  [ACCOUNT_TIERS.ASSISTANT_ADMIN]: 'Assistant Admin',
  [ACCOUNT_TIERS.EXEC_ADMIN]: 'Executive Admin'
};

/**
 * Tiers that can create Sensitive Private groups
 */
const SENSITIVE_GROUP_TIERS = [
  ACCOUNT_TIERS.PREMIUM,
  ACCOUNT_TIERS.ENTERPRISE,
  ACCOUNT_TIERS.TOWN_MANAGER,
  ACCOUNT_TIERS.ASSISTANT_ADMIN,
  ACCOUNT_TIERS.EXEC_ADMIN
];

/**
 * Check if user can create Sensitive Private groups
 * @param {Object} user - User object with account_tier property
 * @returns {boolean}
 */
export function canCreateSensitiveGroups(user) {
  if (!user || !user.account_tier) {
    return false;
  }
  return SENSITIVE_GROUP_TIERS.includes(user.account_tier);
}

/**
 * Check if user has elevated privileges (Premium or higher)
 * @param {Object} user - User object with account_tier property
 * @returns {boolean}
 */
export function hasElevatedAccess(user) {
  if (!user || !user.account_tier) {
    return false;
  }
  const rank = TIER_RANKS[user.account_tier] || 0;
  return rank >= TIER_RANKS[ACCOUNT_TIERS.PREMIUM];
}

/**
 * Check if user is admin tier (Assistant Admin or Executive Admin)
 * @param {Object} user - User object with account_tier property
 * @returns {boolean}
 */
export function isAdminTier(user) {
  if (!user || !user.account_tier) {
    return false;
  }
  return [ACCOUNT_TIERS.TOWN_MANAGER, ACCOUNT_TIERS.ASSISTANT_ADMIN, ACCOUNT_TIERS.EXEC_ADMIN].includes(user.account_tier);
}

/**
 * Get display name for tier
 * @param {string} tier - Account tier enum value
 * @returns {string}
 */
export function getTierDisplayName(tier) {
  return TIER_DISPLAY_NAMES[tier] || 'Unknown';
}

/**
 * Get tier rank (for comparison)
 * @param {string} tier - Account tier enum value
 * @returns {number}
 */
export function getTierRank(tier) {
  return TIER_RANKS[tier] || 0;
}

/**
 * Compare two tiers
 * @param {string} tier1
 * @param {string} tier2
 * @returns {number} - Positive if tier1 > tier2, negative if tier1 < tier2, 0 if equal
 */
export function compareTiers(tier1, tier2) {
  return getTierRank(tier1) - getTierRank(tier2);
}

/**
 * Get tier badge/icon
 * @param {string} tier
 * @returns {string} - Emoji icon for tier
 */
export function getTierIcon(tier) {
  switch (tier) {
    case ACCOUNT_TIERS.FREE:
      return '👤';
    case ACCOUNT_TIERS.FREEMIUM:
      return '🔓';
    case ACCOUNT_TIERS.PREMIUM:
      return '👑';
    case ACCOUNT_TIERS.ENTERPRISE:
      return '🏢';
    case ACCOUNT_TIERS.TOWN_MANAGER:
      return '🏛️';
    case ACCOUNT_TIERS.ASSISTANT_ADMIN:
      return '🛡️';
    case ACCOUNT_TIERS.EXEC_ADMIN:
      return '⚡';
    default:
      return '❓';
  }
}

/**
 * Get tier color class (for badges/UI)
 * @param {string} tier
 * @returns {string} - Tailwind color classes
 */
export function getTierColorClass(tier) {
  switch (tier) {
    case ACCOUNT_TIERS.FREE:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    case ACCOUNT_TIERS.FREEMIUM:
      return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
    case ACCOUNT_TIERS.PREMIUM:
      return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
    case ACCOUNT_TIERS.ENTERPRISE:
      return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400';
    case ACCOUNT_TIERS.TOWN_MANAGER:
      return 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400';
    case ACCOUNT_TIERS.ASSISTANT_ADMIN:
      return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
    case ACCOUNT_TIERS.EXEC_ADMIN:
      return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  }
}

/**
 * Check if user needs upgrade prompt for feature
 * @param {Object} user
 * @param {string} requiredTier - Minimum tier required
 * @returns {boolean}
 */
export function needsUpgrade(user, requiredTier) {
  if (!user || !user.account_tier) {
    return true;
  }
  return compareTiers(user.account_tier, requiredTier) < 0;
}

/**
 * Get upgrade message for feature
 * @param {string} feature - Feature name
 * @returns {string}
 */
export function getUpgradeMessage(feature) {
  return `Upgrade to Premium or higher to create ${feature}`;
}
