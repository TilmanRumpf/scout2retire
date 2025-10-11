import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

/**
 * useUserActions - Handles user interactions (mute, block, like, delete, pin)
 * Extracted from Chat.jsx - all state managed by useChatState
 */
export function useUserActions({
  user,
  friends,
  mutedUsers,
  setMutedUsers,
  blockedUsers,
  setBlockedUsers,
  likedMembers,
  setMessages,
  setActiveFriend,
  setChatType,
  setUserToReport,
  setShowReportModal,
  selectedUser,
  navigate,
  loadLikedMembers,
  sendFriendRequest,
  deleteMsgAction,
  pinMessageAction
}) {
  // Toggle like/unlike member
  const toggleLikeMember = async (memberId) => {
    try {
      if (!user) return;

      const isLiked = likedMembers.some(m => m.id === memberId);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('liked_user_id', memberId);

        if (error) {
          console.error("Error unliking member:", error);
          toast.error("Failed to unlike member");
          return;
        }
      } else {
        // Like
        console.log('Attempting to like member:', { user_id: user.id, liked_user_id: memberId });
        const { error } = await supabase
          .from('user_likes')
          .insert({ user_id: user.id, liked_user_id: memberId });

        if (error) {
          console.error("Error liking member:", error);
          console.error("Error details:", error.message, error.details, error.hint);
          toast.error(`Failed to like member: ${error.message}`);
          return;
        }
      }

      await loadLikedMembers(user.id);
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("An error occurred");
    }
  };

  // Handle user action from UserActionSheet
  const handleUserAction = async (actionId, userId) => {
    switch (actionId) {
      case 'profile':
        navigate(`/profile/${userId}`);
        break;

      case 'message':
        // Find friend connection and open chat
        const friend = friends.find(f => f.friend_id === userId);
        if (friend) {
          setActiveFriend(friend);
          setChatType('friends');
        }
        break;

      case 'addFriend':
        await sendFriendRequest(userId);
        break;

      case 'follow':
        // Follow functionality (to be implemented)
        toast('Follow functionality coming soon', { icon: '🚧' });
        break;

      case 'mute':
        toggleMute(userId);
        break;

      case 'block':
        if (blockedUsers.includes(userId)) {
          await unblockUser(userId);
        } else {
          await blockUser(userId);
        }
        break;

      case 'report':
        setUserToReport({ id: userId, name: selectedUser?.name || 'Unknown' });
        setShowReportModal(true);
        break;

      // Removed: copy and share actions (disabled for now)

      default:
        console.warn('Unknown action:', actionId);
    }
  };

  // Toggle mute for a user
  const toggleMute = (userId) => {
    setMutedUsers(prev => {
      const newMuted = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      localStorage.setItem('mutedUsers', JSON.stringify(newMuted));
      return newMuted;
    });

    const isMuting = !mutedUsers.includes(userId);
    toast.success(isMuting ? 'User muted in this chat' : 'User unmuted');
  };

  // Block user
  const blockUser = async (userId) => {
    try {
      const { error } = await supabase.rpc('block_user', { p_user_id: userId });

      if (error) throw error;

      setBlockedUsers(prev => [...prev, userId]);
      toast.success('User blocked');
    } catch (err) {
      console.error('Error blocking user:', err);
      toast.error('Failed to block user');
    }
  };

  // Unblock user
  const unblockUser = async (userId) => {
    try {
      const { error } = await supabase.rpc('unblock_user', { p_user_id: userId });

      if (error) throw error;

      setBlockedUsers(prev => prev.filter(id => id !== userId));
      toast.success('User unblocked');
    } catch (err) {
      console.error('Error unblocking user:', err);
      toast.error('Failed to unblock user');
    }
  };

  // Delete a chat message (with role-based permissions)
  const deleteMessage = async (messageId) => {
    const result = await deleteMsgAction(messageId);

    if (result.success) {
      // Optimistically update the UI
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString(), deleted_by: user.id }
            : msg
        )
      );
    }
  };

  // Pin/Unpin a chat message (group chats only)
  const handlePinMessage = async (messageId, shouldPin) => {
    const result = await pinMessageAction(messageId, shouldPin);

    if (result.success) {
      // Optimistically update the UI
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                is_pinned: shouldPin,
                pinned_at: shouldPin ? new Date().toISOString() : null,
                pinned_by: shouldPin ? user.id : null
              }
            : msg
        )
      );
    }
  };

  return {
    toggleLikeMember,
    handleUserAction,
    toggleMute,
    blockUser,
    unblockUser,
    deleteMessage,
    handlePinMessage
  };
}
