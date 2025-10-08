/**
 * useChatPermissions Hook
 * Centralized permission checking for chat moderation features
 *
 * Returns permission flags based on user's role in the group chat
 */

import { useMemo } from 'react';

/**
 * @param {Object} params
 * @param {string} params.userRole - Current user's role in the group ('creator', 'admin', 'admin_executive', 'moderator', 'member')
 * @param {string} params.messageAuthorId - ID of the message author (for message-specific permissions)
 * @param {string} params.currentUserId - ID of the current user
 * @param {string} params.chatType - Type of chat ('group', 'friends', 'towns')
 * @param {Date|string} params.messageCreatedAt - When the message was created (for time-window checks)
 * @returns {Object} Permission flags
 */
export function useChatPermissions({
  userRole = 'member',
  messageAuthorId = null,
  currentUserId = null,
  chatType = null,
  messageCreatedAt = null
}) {

  const permissions = useMemo(() => {
    // Non-group chats have no role-based permissions
    if (chatType !== 'group') {
      const isOwnMessage = messageAuthorId && currentUserId && messageAuthorId === currentUserId;
      const withinTimeWindow = messageCreatedAt && isWithin15Minutes(messageCreatedAt);

      return {
        canDeleteOwnMessage: isOwnMessage && withinTimeWindow,
        canDeleteAnyMessage: false,
        canRemoveMembers: false,
        canPromoteToModerator: false,
        canPromoteToAdmin: false,
        canDemoteFromModerator: false,
        canDemoteFromAdmin: false,
        canPinMessages: false,
        canEditGroupSettings: false,
        canInviteMembers: false,
        isCreator: false,
        isAdmin: false,
        isExecutiveAdmin: false,
        isModerator: false,
        roleRank: 0
      };
    }

    // Role hierarchy ranks (higher = more power)
    const roleRank = getRoleRank(userRole);

    // Base permissions by role
    const isCreator = userRole === 'creator';
    const isExecutiveAdmin = userRole === 'admin_executive';
    const isAdmin = userRole === 'admin';
    const isModerator = userRole === 'moderator';

    // Can delete messages
    const isOwnMessage = messageAuthorId && currentUserId && messageAuthorId === currentUserId;
    const withinTimeWindow = messageCreatedAt && isWithin15Minutes(messageCreatedAt);

    const canDeleteOwnMessage = isOwnMessage && withinTimeWindow;
    const canDeleteAnyMessage = roleRank >= 2; // Moderator or higher

    // Can remove members (based on hierarchy)
    const canRemoveMembers = roleRank >= 2; // Moderator or higher

    // Can promote to moderator (admins and creators only)
    const canPromoteToModerator = roleRank >= 3; // Admin or higher

    // Can promote to admin (creators and executive admins only)
    const canPromoteToAdmin = roleRank >= 4; // Executive admin or creator

    // Can demote from moderator (admins and creators only)
    const canDemoteFromModerator = roleRank >= 3; // Admin or higher

    // Can demote from admin (creators and executive admins only)
    const canDemoteFromAdmin = roleRank >= 4; // Executive admin or creator

    // Can pin messages (moderators and above)
    const canPinMessages = roleRank >= 2; // Moderator or higher

    // Can edit group settings (admins and above)
    const canEditGroupSettings = roleRank >= 3; // Admin or higher

    // Can invite members (everyone except in sensitive_private groups)
    const canInviteMembers = true; // Will be refined based on group settings

    return {
      canDeleteOwnMessage,
      canDeleteAnyMessage,
      canRemoveMembers,
      canPromoteToModerator,
      canPromoteToAdmin,
      canDemoteFromModerator,
      canDemoteFromAdmin,
      canPinMessages,
      canEditGroupSettings,
      canInviteMembers,
      isCreator,
      isAdmin,
      isExecutiveAdmin,
      isModerator,
      roleRank
    };
  }, [userRole, messageAuthorId, currentUserId, chatType, messageCreatedAt]);

  return permissions;
}

/**
 * Get numeric rank for a role
 * Higher rank = more permissions
 */
function getRoleRank(role) {
  const ranks = {
    'creator': 5,
    'admin_executive': 4,
    'admin': 3,
    'moderator': 2,
    'member': 1
  };
  return ranks[role] || 0;
}

/**
 * Check if a timestamp is within 15 minutes of now
 */
function isWithin15Minutes(timestamp) {
  if (!timestamp) return false;

  const messageTime = new Date(timestamp);
  const now = new Date();
  const diffMs = now - messageTime;
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= 15;
}

/**
 * Helper hook for checking if current user can perform action on target user
 * Used for member removal, promotion, demotion
 */
export function useCanActOnMember({
  actorRole,
  targetRole,
  action // 'remove', 'promote_to_moderator', 'promote_to_admin', 'demote'
}) {
  return useMemo(() => {
    const actorRank = getRoleRank(actorRole);
    const targetRank = getRoleRank(targetRole);

    // Can't act on yourself (use separate leave_group function)
    // Can't act on executive admins (system-assigned)
    if (targetRole === 'admin_executive') {
      return { canAct: false, reason: 'Executive admins cannot be removed (system-assigned role)' };
    }

    // Can't act on creator
    if (targetRole === 'creator') {
      return { canAct: false, reason: 'The group creator cannot be removed or demoted' };
    }

    // Must have higher rank to act on someone
    if (actorRank <= targetRank) {
      return { canAct: false, reason: `Only users with higher authority can ${action} a ${targetRole}` };
    }

    // Action-specific checks
    switch (action) {
      case 'remove':
        // Moderators can only remove regular members
        if (actorRole === 'moderator' && targetRole !== 'member') {
          return { canAct: false, reason: 'Moderators can only remove regular members' };
        }
        return { canAct: true };

      case 'promote_to_moderator':
        // Only admins and above can promote to moderator
        if (actorRank < 3) {
          return { canAct: false, reason: 'Only admins and creators can promote to moderator' };
        }
        // Can only promote regular members
        if (targetRole !== 'member') {
          return { canAct: false, reason: `User already has role: ${targetRole}` };
        }
        return { canAct: true };

      case 'promote_to_admin':
        // Only executive admins and creators can promote to admin
        if (actorRank < 4) {
          return { canAct: false, reason: 'Only executive admins and creators can promote to admin' };
        }
        // Can only promote moderators or members
        if (targetRole === 'admin' || targetRole === 'creator' || targetRole === 'admin_executive') {
          return { canAct: false, reason: `User already has role: ${targetRole}` };
        }
        return { canAct: true };

      case 'demote':
        // Admins can demote moderators
        if (actorRank >= 3 && targetRole === 'moderator') {
          return { canAct: true };
        }
        // Executive admins and creators can demote admins
        if (actorRank >= 4 && targetRole === 'admin') {
          return { canAct: true };
        }
        return { canAct: false, reason: 'Insufficient permissions to demote this user' };

      default:
        return { canAct: false, reason: 'Unknown action' };
    }
  }, [actorRole, targetRole, action]);
}
