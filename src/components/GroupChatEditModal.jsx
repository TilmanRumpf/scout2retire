import React, { useState, useEffect } from 'react';
import { uiConfig } from '../styles/uiConfig';
import { X, Users, Upload, Trash2, UserPlus, Crown, Star, Shield, Gavel, Ban } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';
import { useModerationActions } from '../hooks/useModerationActions';

const GroupChatEditModal = React.memo(function GroupChatEditModal({
  isOpen,
  onClose,
  groupChat,
  currentUser,
  friends = [],
  onUpdate
}) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [geoRegion, setGeoRegion] = useState('');
  const [geoCountry, setGeoCountry] = useState('');
  const [geoProvince, setGeoProvince] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [invitePolicy, setInvitePolicy] = useState('all_members');
  const [adminsOnlyMessaging, setAdminsOnlyMessaging] = useState(false);
  const [groupImage, setGroupImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [members, setMembers] = useState([]);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [transferTarget, setTransferTarget] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Use moderation actions hook
  const { removeMember: removeMemberAction, promoteToModerator: promoteToModeratorAction, unpinMessage: unpinMessageAction } = useModerationActions();

  console.log('GroupChatEditModal render:', { isOpen, groupChat, currentUser });

  // Load group members when modal opens
  useEffect(() => {
    if (isOpen && groupChat) {
      loadGroupMembers();
      loadPinnedMessages();
      loadBannedUsers();
      setGroupName(groupChat.topic || '');
      setGroupDescription(groupChat.description || '');
      setCategory(groupChat.category || 'General');
      setGeoRegion(groupChat.geo_region || '');
      setGeoCountry(groupChat.geo_country || '');
      setGeoProvince(groupChat.geo_province || '');
      setIsPublic(groupChat.is_public || false);
      setInvitePolicy(groupChat.invite_policy || 'all_members');
      setAdminsOnlyMessaging(groupChat.admins_only_messaging || false);
    }
  }, [isOpen, groupChat]);

  const loadGroupMembers = async () => {
    if (!groupChat) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_chat_members')
        .select(`
          user_id,
          role,
          joined_at,
          is_muted
        `)
        .eq('thread_id', groupChat.id);

      if (error) {
        console.error('Error loading members:', error);
        toast.error('Failed to load members');
        return;
      }

      // Fetch user details for each member
      const membersWithDetails = await Promise.all(
        (data || []).map(async (member) => {
          const { data: userData } = await supabase.rpc('get_user_by_id', { user_id: member.user_id });
          return {
            ...member,
            user: userData?.[0] || { id: member.user_id, username: 'Unknown' }
          };
        })
      );

      setMembers(membersWithDetails);

      // Set mute status for current user
      const currentUserMember = membersWithDetails.find(m => m.user_id === currentUser?.id);
      if (currentUserMember) {
        setIsMuted(currentUserMember.is_muted || false);
      }

      // Filter out friends who are already members
      const memberIds = membersWithDetails.map(m => m.user_id);
      const available = friends.filter(f => !memberIds.includes(f.friend_id));
      setAvailableFriends(available);

    } catch (err) {
      console.error('Error loading members:', err);
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPinnedMessages = async () => {
    if (!groupChat) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          message,
          created_at,
          pinned_at,
          pinned_by,
          user_id
        `)
        .eq('thread_id', groupChat.id)
        .eq('is_pinned', true)
        .order('pinned_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Error loading pinned messages:', error);
        return;
      }

      // Fetch user details for each pinned message
      const messagesWithUsers = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: userData } = await supabase.rpc('get_user_by_id', { user_id: msg.user_id });
          return {
            ...msg,
            user: userData?.[0] || { id: msg.user_id, username: 'Unknown' }
          };
        })
      );

      setPinnedMessages(messagesWithUsers);
    } catch (err) {
      console.error('Error loading pinned messages:', err);
    }
  };

  const loadBannedUsers = async () => {
    if (!groupChat) return;

    try {
      const { data, error } = await supabase
        .from('group_bans')
        .select('user_id, banned_by, banned_at, reason')
        .eq('thread_id', groupChat.id);

      if (error) {
        console.error('Error loading banned users:', error);
        return;
      }

      // Fetch user details
      const usersWithDetails = await Promise.all(
        (data || []).map(async (ban) => {
          const { data: userData } = await supabase.rpc('get_user_by_id', { user_id: ban.user_id });
          return { ...ban, user: userData?.[0] };
        })
      );
      setBannedUsers(usersWithDetails);
    } catch (err) {
      console.error('Error loading banned users:', err);
    }
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Reason for ban (optional):');

    if (!window.confirm('Are you sure you want to ban this user? They will not be able to rejoin.')) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('ban_user', {
        p_thread_id: groupChat.id,
        p_user_id_to_ban: userId,
        p_reason: reason || null
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Failed to ban user');
        return;
      }

      toast.success('User banned from group');
      await loadGroupMembers();
      await loadBannedUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const { data, error } = await supabase.rpc('unban_user', {
        p_thread_id: groupChat.id,
        p_user_id_to_unban: userId
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Failed to unban user');
        return;
      }

      toast.success('User unbanned');
      await loadBannedUsers();
    } catch (err) {
      console.error('Error unbanning user:', err);
      toast.error('Failed to unban user');
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTarget) return;

    const targetMember = members.find(m => m.user_id === transferTarget);

    if (!window.confirm(`Transfer ownership to ${targetMember?.user?.username}? You will become a regular admin. This cannot be undone.`)) {
      return;
    }

    if (!window.confirm('Are you ABSOLUTELY SURE? This is permanent!')) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('transfer_ownership', {
        p_thread_id: groupChat.id,
        p_new_creator_id: transferTarget
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Failed to transfer ownership');
        return;
      }

      toast.success('Ownership transferred successfully');
      onClose();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error transferring ownership:', err);
      toast.error('Failed to transfer ownership');
    }
  };

  const handleDeleteGroup = async () => {
    if (deleteConfirmation.trim().toLowerCase() !== groupChat.topic.toLowerCase()) {
      return;
    }

    if (!window.confirm('This will PERMANENTLY delete the group and ALL messages. Continue?')) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('delete_group', {
        p_thread_id: groupChat.id,
        p_confirmation_name: deleteConfirmation
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Failed to delete group');
        return;
      }

      toast.success('Group deleted permanently');
      window.location.href = '/chat';
    } catch (err) {
      console.error('Error deleting group:', err);
      toast.error('Failed to delete group');
    }
  };

  const handleAddMember = async (friendId) => {
    try {
      const { error } = await supabase
        .from('group_chat_members')
        .insert([{
          thread_id: groupChat.id,
          user_id: friendId,
          role: 'member'
        }]);

      if (error) {
        console.error('Error adding member:', error);
        toast.error('Failed to add member');
        return;
      }

      toast.success('Member added!');

      // Check if we need to assign executive admin (at 10 members)
      const { count } = await supabase
        .from('group_chat_members')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', groupChat.id);

      if (count === 10) {
        // Trigger executive admin assignment
        await supabase.rpc('ensure_executive_admin', { p_thread_id: groupChat.id });
      }

      await loadGroupMembers();
    } catch (err) {
      console.error('Error adding member:', err);
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    // Can't remove yourself
    if (userId === currentUser.id) {
      toast.error("You can't remove yourself from the group");
      return;
    }

    // Use the moderation hook which enforces role hierarchy
    const result = await removeMemberAction(groupChat.id, userId);

    if (result.success) {
      await loadGroupMembers();
    }
  };

  const handlePromoteToModerator = async (userId) => {
    // Use the moderation hook
    const result = await promoteToModeratorAction(groupChat.id, userId);

    if (result.success) {
      await loadGroupMembers();
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    try {
      const { error } = await supabase
        .from('group_chat_members')
        .update({ role: 'admin' })
        .eq('thread_id', groupChat.id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error promoting member:', error);
        toast.error('Failed to promote member');
        return;
      }

      // Log to audit table
      await supabase.from('group_role_audit').insert([{
        thread_id: groupChat.id,
        actor_id: currentUser.id,
        action: 'promote',
        target_user_id: userId,
        old_role: 'member',
        new_role: 'admin'
      }]);

      toast.success('Member promoted to admin');
      await loadGroupMembers();
    } catch (err) {
      console.error('Error promoting member:', err);
      toast.error('Failed to promote member');
    }
  };

  const handleDemoteToMember = async (userId) => {
    try {
      const { error } = await supabase
        .from('group_chat_members')
        .update({ role: 'member' })
        .eq('thread_id', groupChat.id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error demoting admin:', error);
        toast.error('Failed to demote admin');
        return;
      }

      // Log to audit table
      await supabase.from('group_role_audit').insert([{
        thread_id: groupChat.id,
        actor_id: currentUser.id,
        action: 'demote',
        target_user_id: userId,
        old_role: 'admin',
        new_role: 'member'
      }]);

      toast.success('Admin demoted to member');
      await loadGroupMembers();
    } catch (err) {
      console.error('Error demoting admin:', err);
      toast.error('Failed to demote admin');
    }
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('chat_threads')
        .update({
          topic: groupName,
          description: groupDescription,
          category: category,
          geo_region: geoRegion,
          geo_country: geoCountry,
          geo_province: geoProvince,
          is_public: isPublic,
          invite_policy: invitePolicy,
          admins_only_messaging: adminsOnlyMessaging
        })
        .eq('id', groupChat.id);

      if (error) {
        console.error('Error updating group:', error);
        toast.error('Failed to update group');
        return;
      }

      toast.success('Group updated!');
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating group:', err);
      toast.error('Failed to update group');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group? You will need to be re-invited to rejoin.')) {
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.rpc('leave_group', {
        p_thread_id: groupChat.id
      });

      if (error) {
        console.error('Error leaving group:', error);
        toast.error('Failed to leave group');
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || 'Failed to leave group');
        return;
      }

      toast.success('You have left the group');
      onClose();
      if (onUpdate) onUpdate();

      // Navigate away from the group chat
      window.location.href = '/chat';
    } catch (err) {
      console.error('Error leaving group:', err);
      toast.error('Failed to leave group');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMute = async () => {
    const newMutedState = !isMuted;

    try {
      const { data, error } = await supabase.rpc('toggle_group_mute', {
        p_thread_id: groupChat.id,
        p_is_muted: newMutedState
      });

      if (error) {
        console.error('Error toggling mute:', error);
        toast.error('Failed to update notification settings');
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || 'Failed to update notification settings');
        return;
      }

      setIsMuted(newMutedState);
      toast.success(newMutedState ? 'Notifications muted' : 'Notifications unmuted');
    } catch (err) {
      console.error('Error toggling mute:', err);
      toast.error('Failed to update notification settings');
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${groupChat.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('group-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('group-images')
        .getPublicUrl(fileName);

      // Update chat_threads with new group_image_url
      const { error: updateError } = await supabase
        .from('chat_threads')
        .update({ group_image_url: publicUrl })
        .eq('id', groupChat.id);

      if (updateError) throw updateError;

      toast.success('Image uploaded successfully');
      setUploadProgress(0);

      // Refresh group chat data
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
      setUploadProgress(0);
    }
  };

  const handleUnpinMessage = async (messageId) => {
    const result = await unpinMessageAction(messageId);

    if (result.success) {
      // Reload pinned messages
      await loadPinnedMessages();
    }
  };

  if (!isOpen || !groupChat) return null;

  const isCreator = groupChat.created_by === currentUser?.id;
  const userMember = members.find(m => m.user_id === currentUser?.id);
  const isAdmin = userMember?.role === 'admin' || isCreator;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className={`${uiConfig.colors.card} rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-scout-accent-100 dark:bg-scout-accent-900/30 rounded-lg">
              <Users className="h-5 w-5 text-scout-accent-600 dark:text-scout-accent-400" />
            </div>
            <h2 className={`text-xl ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Edit Group Chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body} transition-colors`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all ${
                !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              maxLength={50}
            />
          </div>

          {/* Group Description */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Description
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all ${
                !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              maxLength={500}
              rows={4}
              placeholder="Describe the purpose of this group chat..."
            />
            <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>
              {groupDescription.length}/500 characters
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all ${
                !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="General">General</option>
              <option value="Travel">Travel</option>
              <option value="Sports">Sports</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Hobbies">Hobbies</option>
              <option value="Health & Fitness">Health & Fitness</option>
              <option value="Technology">Technology</option>
              <option value="Books & Reading">Books & Reading</option>
              <option value="Local Events">Local Events</option>
              <option value="Volunteering">Volunteering</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Geographic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
                Region
              </label>
              <input
                type="text"
                value={geoRegion}
                onChange={(e) => setGeoRegion(e.target.value)}
                disabled={!isAdmin}
                className={`w-full px-4 py-2 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all ${
                  !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="e.g., Western Europe"
              />
            </div>
            <div>
              <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
                Country
              </label>
              <input
                type="text"
                value={geoCountry}
                onChange={(e) => setGeoCountry(e.target.value)}
                disabled={!isAdmin}
                className={`w-full px-4 py-2 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all ${
                  !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="e.g., Portugal"
              />
            </div>
            <div>
              <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
                Province/State
              </label>
              <input
                type="text"
                value={geoProvince}
                onChange={(e) => setGeoProvince(e.target.value)}
                disabled={!isAdmin}
                className={`w-full px-4 py-2 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all ${
                  !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="e.g., Algarve"
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Privacy
            </label>
            <div className={`flex items-center justify-between p-4 ${uiConfig.colors.secondary} rounded-lg border ${uiConfig.colors.border}`}>
              <div>
                <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                  Public Group
                </div>
                <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>
                  Allow anyone to find and join this group
                </div>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                disabled={!isAdmin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-scout-accent-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Invite Policy */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Who Can Invite Members
            </label>
            <select
              value={invitePolicy}
              onChange={(e) => setInvitePolicy(e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all ${
                !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="all_members">All Members</option>
              <option value="members_with_approval">Members (With Approval)</option>
              <option value="admins_only">Admins Only</option>
            </select>
          </div>

          {/* Messaging Permissions */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Messaging
            </label>
            <div className={`flex items-center justify-between p-4 ${uiConfig.colors.secondary} rounded-lg border ${uiConfig.colors.border}`}>
              <div>
                <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                  Admins Only Messaging
                </div>
                <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>
                  Only admins and creators can send messages
                </div>
              </div>
              <button
                onClick={() => setAdminsOnlyMessaging(!adminsOnlyMessaging)}
                disabled={!isAdmin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  adminsOnlyMessaging ? 'bg-scout-accent-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  adminsOnlyMessaging ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* User Settings - Mute Notifications */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Notifications
            </label>
            <div className={`flex items-center justify-between p-4 ${uiConfig.colors.secondary} rounded-lg border ${uiConfig.colors.border}`}>
              <div>
                <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                  Mute Notifications
                </div>
                <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>
                  Stop receiving notifications from this group
                </div>
              </div>
              <button
                onClick={handleToggleMute}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isMuted ? 'bg-scout-accent-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isMuted ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Group Image Upload */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Group Image
            </label>

            {/* Current Image Preview */}
            {groupChat?.group_image_url && (
              <div className="mb-3">
                <img
                  src={groupChat.group_image_url}
                  alt="Group"
                  className={`w-32 h-32 object-cover rounded-lg border ${uiConfig.colors.border}`}
                />
              </div>
            )}

            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={!isAdmin}
              className={`block w-full text-sm ${uiConfig.colors.body}
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-scout-accent-500 file:text-white
                hover:file:bg-scout-accent-600
                ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            />

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-scout-accent-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className={`text-xs ${uiConfig.colors.hint} mt-1`}>{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>

          {/* Pinned Messages */}
          {pinnedMessages.length > 0 && (
            <div>
              <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
                Pinned Messages ({pinnedMessages.length})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pinnedMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg border ${uiConfig.colors.border} ${uiConfig.colors.secondary}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} text-sm`}>
                          {msg.user?.username || 'Unknown'}
                        </div>
                        <div className={`${uiConfig.colors.body} text-sm mt-1 break-words`}>
                          {msg.content}
                        </div>
                        <div className={`${uiConfig.colors.hint} text-xs mt-1`}>
                          Pinned {new Date(msg.pinned_at).toLocaleDateString()}
                        </div>
                      </div>
                      {userMember?.role && ['moderator', 'admin', 'admin_executive', 'creator'].includes(userMember.role) && (
                        <button
                          onClick={() => handleUnpinMessage(msg.id)}
                          className="text-red-500 hover:text-red-600 text-xs font-medium"
                        >
                          Unpin
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members List */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
              Members ({members.length})
            </label>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-accent-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map(member => (
                  <div
                    key={member.user_id}
                    className={`p-3 rounded-lg border ${uiConfig.colors.border} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400`}>
                        <span className="text-sm font-medium">
                          {member.user?.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <div className={`flex items-center gap-2 ${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                          <span>
                            {member.user?.username || 'Unknown'}
                            {member.user_id === currentUser?.id && ' (You)'}
                          </span>
                          {/* Role badge */}
                          {member.role === 'creator' && (
                            <Crown className="h-4 w-4 text-yellow-500" title="Creator" />
                          )}
                          {member.role === 'admin' && (
                            <Star className="h-4 w-4 text-blue-500" title="Admin" />
                          )}
                          {member.role === 'admin_executive' && (
                            <Shield className="h-4 w-4 text-purple-500" title="Executive Admin" />
                          )}
                          {member.role === 'moderator' && (
                            <Gavel className="h-4 w-4 text-green-600 dark:text-green-400" title="Moderator" />
                          )}
                        </div>
                        <div className={`text-xs ${uiConfig.colors.hint}`}>
                          {member.role === 'creator' && 'Creator'}
                          {member.role === 'admin' && 'Admin'}
                          {member.role === 'admin_executive' && 'Executive Admin'}
                          {member.role === 'moderator' && 'Moderator'}
                          {member.role === 'member' && 'Member'}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (only for admins/creator) */}
                    <div className="flex items-center gap-2">
                      {/* Promote to Moderator (only show for regular members, only if you're admin/creator) */}
                      {isAdmin && member.role === 'member' && member.user_id !== currentUser?.id && (
                        <button
                          onClick={() => handlePromoteToModerator(member.user_id)}
                          className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          Promote to Moderator
                        </button>
                      )}

                      {/* Promote to Admin (only show for regular members, only if you're admin/creator) */}
                      {isAdmin && member.role === 'member' && member.user_id !== currentUser?.id && (
                        <button
                          onClick={() => handlePromoteToAdmin(member.user_id)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          Promote to Admin
                        </button>
                      )}

                      {/* Demote to Member (only show for admins, only if you're creator) */}
                      {isCreator && member.role === 'admin' && member.user_id !== currentUser?.id && (
                        <button
                          onClick={() => handleDemoteToMember(member.user_id)}
                          className="px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        >
                          Demote
                        </button>
                      )}

                      {/* Ban button (only for admins, can't ban yourself, creator, or exec admin) */}
                      {isAdmin && member.user_id !== currentUser?.id && member.role !== 'creator' && member.role !== 'admin_executive' && (
                        <button
                          onClick={() => handleBanUser(member.user_id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Ban from group"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Banned Users Section */}
          {isAdmin && bannedUsers.length > 0 && (
            <div>
              <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
                Banned Users ({bannedUsers.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bannedUsers.map(ban => (
                  <div
                    key={ban.user_id}
                    className={`p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                          {ban.user?.username || 'Unknown'}
                        </div>
                        {ban.reason && (
                          <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>
                            Reason: {ban.reason}
                          </div>
                        )}
                        <div className={`text-xs ${uiConfig.colors.hint}`}>
                          Banned {new Date(ban.banned_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnbanUser(ban.user_id)}
                        className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        Unban
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Members (only for admins) */}
          {isAdmin && availableFriends.length > 0 && (
            <div>
              <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
                Add Friends
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableFriends.map(friend => (
                  <button
                    key={friend.friend_id}
                    onClick={() => handleAddMember(friend.friend_id)}
                    className={`w-full p-3 rounded-lg border ${uiConfig.colors.border} flex items-center justify-between hover:border-scout-accent-400 transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center`}>
                        <span className="text-sm font-medium">
                          {friend.friend?.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                        {friend.friend?.username || 'Friend'}
                      </div>
                    </div>
                    <UserPlus className="h-5 w-5 text-scout-accent-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transfer Ownership - Creator Only */}
          {isCreator && (
            <div className="border-t border-red-200 dark:border-red-900 pt-6">
              <label className={`block text-sm ${uiConfig.font.weight.medium} text-red-600 dark:text-red-400 mb-2`}>
                ⚠️ Danger Zone: Transfer Ownership
              </label>
              <div className={`p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900`}>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  Transfer ownership of this group to another admin. You will become a regular admin.
                </p>
                <select
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 mb-3"
                >
                  <option value="">Select new creator...</option>
                  {members
                    .filter(m => m.role === 'admin' && m.user_id !== currentUser?.id)
                    .map(m => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.user?.username}
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleTransferOwnership}
                  disabled={!transferTarget}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
                    transferTarget
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Transfer Ownership
                </button>
              </div>
            </div>
          )}

          {/* Delete Group - Creator Only */}
          {isCreator && (
            <div className="border-t border-red-200 dark:border-red-900 pt-6 mt-6">
              <label className={`block text-sm ${uiConfig.font.weight.medium} text-red-600 dark:text-red-400 mb-2`}>
                💀 Nuclear Option: Delete Group Permanently
              </label>
              <div className={`p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900`}>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  This will permanently delete the group, all messages, and remove all members. This cannot be undone!
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={`Type "${groupChat.topic}" to confirm`}
                  className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 mb-3"
                />
                <button
                  onClick={handleDeleteGroup}
                  disabled={deleteConfirmation.trim().toLowerCase() !== groupChat.topic.toLowerCase()}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
                    deleteConfirmation.trim().toLowerCase() === groupChat.topic.toLowerCase()
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Permanently Delete Group
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Left side - Leave Group */}
          {!isCreator && (
            <button
              onClick={handleLeaveGroup}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              Leave Group
            </button>
          )}
          {isCreator && <div />}

          {/* Right side - Cancel & Save */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uiConfig.colors.hint} hover:${uiConfig.colors.body}`}
            >
              Cancel
            </button>
          {isAdmin && (
            <button
              onClick={handleSave}
              disabled={isSaving || !groupName.trim()}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSaving || !groupName.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-scout-accent-500 text-white hover:bg-scout-accent-600'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default GroupChatEditModal;
