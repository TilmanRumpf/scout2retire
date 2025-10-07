import { useState, useEffect } from 'react';
import { UserPlus, MessageSquare, Eye, VolumeX, Volume2, Ban, Flag, Copy, Share2, X, UserCheck } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

/**
 * UserActionSheet - Mobile-first bottom sheet / desktop popover for user actions
 * Supreme UX with large tap targets, smooth animations, and haptic feedback
 */
export default function UserActionSheet({
  userId,
  username,
  currentUserId,
  isFriend = false,
  isBlocked = false,
  isMuted = false,
  isOpen,
  onClose,
  onAction
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      // Delay unmount for exit animation
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Get relationship status text
  const getRelationshipStatus = () => {
    if (isBlocked) return 'Blocked';
    if (isFriend) return 'Friend';
    return 'Member';
  };

  // Define actions based on context
  const actions = [
    // View Profile - DISABLED for privacy review
    // {
    //   id: 'profile',
    //   icon: Eye,
    //   label: 'View Profile',
    //   hint: 'See retirement preferences',
    //   show: userId !== currentUserId
    // },
    // Message (friends only) or Add Friend (strangers)
    isFriend ? {
      id: 'message',
      icon: MessageSquare,
      label: 'Send Message',
      hint: 'Start private chat',
      show: !isBlocked && userId !== currentUserId
    } : {
      id: 'addFriend',
      icon: UserPlus,
      label: 'Add Friend',
      hint: 'Send friend request',
      show: !isBlocked && !isFriend && userId !== currentUserId
    },
    // Follow User (non-friends only)
    {
      id: 'follow',
      icon: UserCheck,
      label: 'Follow User',
      hint: 'Get notified of their activity',
      show: !isBlocked && !isFriend && userId !== currentUserId
    },
    // Mute/Unmute
    {
      id: 'mute',
      icon: isMuted ? Volume2 : VolumeX,
      label: isMuted ? 'Unmute in Chat' : 'Mute in Chat',
      hint: isMuted ? 'Show messages again' : 'Hide messages from this user',
      show: !isBlocked && userId !== currentUserId
    },
    // Block/Unblock
    {
      id: 'block',
      icon: Ban,
      label: isBlocked ? 'Unblock User' : 'Block User',
      hint: isBlocked ? 'Allow contact again' : 'Prevent all interactions',
      destructive: !isBlocked,
      show: userId !== currentUserId
    },
    // Report
    {
      id: 'report',
      icon: Flag,
      label: 'Report User',
      hint: 'Flag inappropriate behavior',
      destructive: true,
      show: userId !== currentUserId
    }
    // Copy Username - DISABLED for now
    // {
    //   id: 'copy',
    //   icon: Copy,
    //   label: 'Copy Username',
    //   hint: 'Copy to clipboard',
    //   show: userId !== currentUserId
    // },
    // Share Profile - DISABLED for now
    // {
    //   id: 'share',
    //   icon: Share2,
    //   label: 'Share Profile',
    //   hint: 'Generate shareable link',
    //   show: userId !== currentUserId
    // }
  ].filter(action => action.show);

  const handleActionClick = (actionId) => {
    // Haptic feedback on iOS
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }

    onAction?.(actionId, userId);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isAnimating && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Bottom Sheet (Mobile) / Centered Modal (Desktop) */}
      <div
        className={`absolute md:max-w-sm md:w-96 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                    bottom-0 left-0 right-0 md:rounded-2xl rounded-t-3xl
                    ${uiConfig.colors.card} shadow-2xl
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-y-0 md:translate-x-[-50%] md:translate-y-[-50%]' : 'translate-y-full md:translate-x-[-50%] md:translate-y-[-50%] md:scale-95 md:opacity-0'}
                    pb-safe`}
        style={{
          // Spring animation for mobile
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Handle Bar (Mobile only - visual affordance for swipe) */}
        <div className="md:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-4" />

        {/* Close Button (Desktop only) */}
        <button
          onClick={onClose}
          className={`hidden md:block absolute top-4 right-4 p-2 rounded-lg hover:${uiConfig.colors.secondary} transition-colors`}
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* User Header */}
        <div className={`px-6 pb-4 md:pt-4 border-b ${uiConfig.colors.border}`}>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-scout-accent-500 to-scout-accent-600
                          flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
              {username?.[0]?.toUpperCase() || '?'}
            </div>
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className={`font-semibold ${uiConfig.colors.heading} truncate`}>
                {username || 'Unknown User'}
              </div>
              <div className={`text-sm ${uiConfig.colors.hint}`}>
                {getRelationshipStatus()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Large, thumb-friendly */}
        <div className="p-4 md:p-6 space-y-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl
                          hover:${uiConfig.colors.secondary}
                          active:scale-[0.98] transition-all
                          ${action.destructive ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${
                  action.destructive
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
                <div className="flex-1 text-left min-w-0">
                  <div className={`font-medium ${
                    action.destructive
                      ? 'text-red-600 dark:text-red-400'
                      : uiConfig.colors.heading
                  }`}>
                    {action.label}
                  </div>
                  {action.hint && (
                    <div className={`text-sm ${uiConfig.colors.hint} truncate`}>
                      {action.hint}
                    </div>
                  )}
                </div>
                {action.badge && (
                  <span className={`px-2 py-1 ${uiConfig.colors.badge} text-xs rounded-full flex-shrink-0`}>
                    {action.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
