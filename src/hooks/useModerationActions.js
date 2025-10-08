/**
 * useModerationActions Hook
 * Wrapper functions for role-based moderation RPC calls
 *
 * Provides easy-to-use functions for:
 * - Deleting messages (with role-based permissions)
 * - Removing members (with hierarchy enforcement)
 * - Promoting members to moderator
 * - Pinning/unpinning messages
 */

import { useState } from 'react';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export function useModerationActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Delete a message (role-based permissions)
   * - Self-delete: Within 15 minutes only
   * - Moderator+: Can delete any message in their groups
   */
  const deleteMessage = async (messageId) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('delete_message_as_moderator', {
        p_message_id: messageId
      });

      if (rpcError) {
        throw rpcError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete message');
      }

      // Show appropriate toast
      if (data.was_moderation_action) {
        toast.success('Message removed by moderator');
      } else {
        toast.success('Message deleted');
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete message';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove a member from a group chat
   * - Enforces role hierarchy
   * - Logs action to audit table
   */
  const removeMember = async (threadId, userId) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('remove_member', {
        p_thread_id: threadId,
        p_user_id_to_remove: userId
      });

      if (rpcError) {
        throw rpcError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to remove member');
      }

      toast.success('Member removed from group');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove member';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Promote a member to moderator role
   * - Requires admin or creator role
   * - Can only promote regular members
   */
  const promoteToModerator = async (threadId, userId) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('promote_to_moderator', {
        p_thread_id: threadId,
        p_user_id: userId
      });

      if (rpcError) {
        throw rpcError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to promote to moderator');
      }

      toast.success('Member promoted to moderator');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to promote member';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Pin a message in a group chat
   * - Requires moderator role or higher
   * - Maximum 15 pinned messages per group
   */
  const pinMessage = async (messageId, shouldPin = true) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('pin_message', {
        p_message_id: messageId,
        p_should_pin: shouldPin
      });

      if (rpcError) {
        throw rpcError;
      }

      if (!data.success) {
        throw new Error(data.error || `Failed to ${shouldPin ? 'pin' : 'unpin'} message`);
      }

      toast.success(shouldPin ? 'Message pinned' : 'Message unpinned');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || `Failed to ${shouldPin ? 'pin' : 'unpin'} message`;
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Unpin a message (convenience wrapper)
   */
  const unpinMessage = async (messageId) => {
    return pinMessage(messageId, false);
  };

  return {
    deleteMessage,
    removeMember,
    promoteToModerator,
    pinMessage,
    unpinMessage,
    loading,
    error
  };
}
