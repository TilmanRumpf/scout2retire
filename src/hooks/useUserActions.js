import { useState } from 'react';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

/**
 * useUserActions - Handles user interactions (mute, block, like)
 * Extracted from Chat.jsx
 */
export function useUserActions({ user, friends }) {
  const [mutedUsers, setMutedUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [likedMembers, setLikedMembers] = useState([]);

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

  // Toggle like/unlike member
  const toggleLikeMember = async (memberId) => {
    try {
      if (!user) return;

      const isLiked = likedMembers.some(m => m.id === memberId);

      if (isLiked) {
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
        const { error } = await supabase
          .from('user_likes')
          .insert({ user_id: user.id, liked_user_id: memberId });

        if (error) {
          console.error("Error liking member:", error);
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

  // Load liked members
  const loadLikedMembers = async (userId) => {
    try {
      const { data: likes, error } = await supabase
        .from('user_likes')
        .select('liked_user_id')
        .eq('user_id', userId);

      if (error) {
        console.error("Error loading likes:", error);
        return;
      }

      if (!likes || likes.length === 0) {
        setLikedMembers([]);
        return;
      }

      const userIds = likes.map(l => l.liked_user_id);
      const { data: users, error: usersError } = await supabase.rpc('get_users_by_ids', {
        p_user_ids: userIds
      });

      if (usersError) {
        console.error("Error fetching liked users batch:", usersError);
        return;
      }

      setLikedMembers(users || []);
    } catch (err) {
      console.error("Error loading liked members:", err);
    }
  };

  // Load blocked users
  const loadBlockedUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_blocked_users');

      if (error) {
        console.error("Error loading blocked users:", error);
        return;
      }

      const blockedIds = (data || []).map(item => item.blocked_user_id);
      setBlockedUsers(blockedIds);
    } catch (err) {
      console.error("Error loading blocked users:", err);
    }
  };

  // Handle user action from UserActionSheet
  const handleUserAction = async (actionId, userId, selectedUser, navigate, setActiveFriend, setChatType, setUserToReport, setShowReportModal) => {
    switch (actionId) {
      case 'profile':
        navigate(`/profile/${userId}`);
        break;

      case 'message':
        const friend = friends.find(f => f.friend_id === userId);
        if (friend) {
          setActiveFriend(friend);
          setChatType('friends');
        }
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

      default:
        console.warn('Unknown action:', actionId);
    }
  };

  return {
    mutedUsers,
    setMutedUsers,
    blockedUsers,
    setBlockedUsers,
    likedMembers,
    setLikedMembers,
    toggleMute,
    blockUser,
    unblockUser,
    toggleLikeMember,
    loadLikedMembers,
    loadBlockedUsers,
    handleUserAction
  };
}
