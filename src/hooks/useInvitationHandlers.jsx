import supabase from '../utils/supabaseClient';
import { sendInvitationEmailViaAuth } from '../utils/emailUtils';
import { cancelInvitation } from '../utils/companionUtils';
import toast from 'react-hot-toast';

/**
 * useInvitationHandlers - Handles all invitation-related actions
 * Extracted from Chat.jsx
 */
export function useInvitationHandlers({ user, loadPendingInvitations, loadFriends, setFriendsTabActive }) {
  // Send invitation by email
  const sendInviteByEmail = async (email, inviteMessage, setInviteLoading, setShowInviteModal, setInviteEmail, setInviteMessage) => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setInviteLoading(true);

    try {
      const { data: searchResult, error: searchError } = await supabase
        .rpc('search_user_by_email', {
          search_email: email.trim().toLowerCase()
        });

      if (searchError) {
        if (searchError.code === '42883') {
          toast.error("Search function not set up yet. Please run the migration SQL in Supabase.");
        } else {
          toast.error("Error searching for user. Please try again.");
        }
        setInviteLoading(false);
        return;
      }

      if (!searchResult || searchResult.length === 0) {
        toast.error("No user found with this email address. Please check the email and ensure they've signed up.");
        setInviteLoading(false);
        return;
      }

      const existingUser = searchResult[0];

      const { data: sentConnections } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', existingUser.id)
        .neq('status', 'cancelled');

      const { data: receivedConnections } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', existingUser.id)
        .eq('friend_id', user.id)
        .neq('status', 'cancelled');

      const existingConnection = [...(sentConnections || []), ...(receivedConnections || [])]
        .filter(conn => conn.status === 'pending' || conn.status === 'accepted');

      if (existingConnection && existingConnection.length > 0) {
        const connection = existingConnection[0];
        if (connection.status === 'accepted') {
          toast.error("You're already connected with this user!");
        } else if (connection.status === 'pending') {
          toast.error("There's already a pending invitation with this user!");
        }
        setInviteLoading(false);
        return;
      }

      const { error: inviteError } = await supabase
        .from('user_connections')
        .insert([{
          user_id: user.id,
          friend_id: existingUser.id,
          status: 'pending',
          message: inviteMessage.trim() || null
        }]);

      if (inviteError) {
        console.error("Error sending invitation:", inviteError);
        toast.error("Failed to send invitation");
        setInviteLoading(false);
        return;
      }

      try {
        await supabase.rpc('create_notification', {
          target_user_id: existingUser.id,
          notification_type: 'invitation_received',
          notification_title: `${user.username || 'Someone'} invited you to connect`,
          notification_message: inviteMessage.trim() || 'Connect to chat and share retirement planning ideas',
          notification_link: `/chat?invitation=${existingUser.id}`
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      const emailResult = await sendInvitationEmailViaAuth(
        email,
        user,
        inviteMessage.trim()
      );

      if (!emailResult.success) {
        console.error("Email error:", emailResult.error);
      }

      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
        `${user.username || 'Someone'} invited you to Scout2Retire`
      )}&body=${encodeURIComponent(
        `Hi!\n\n${user.username || 'Someone'} has invited you to join Scout2Retire, a personalized retirement planning platform.\n\n` +
        (inviteMessage ? `Personal message from ${user.username || 'Someone'}:\n"${inviteMessage}"\n\n` : '') +
        `Click here to accept the invitation and create your account:\n${window.location.origin}/signup?invite_from=${user.id}\n\n` +
        `With Scout2Retire, you can:\n` +
        `- Discover retirement destinations that match your lifestyle\n` +
        `- Connect with like-minded people planning their retirement\n` +
        `- Compare locations based on cost, climate, culture, and more\n` +
        `- Plan visits and make informed decisions\n\n` +
        `Looking forward to connecting with you!\n\n` +
        `Best regards,\n${user.username || 'Someone'}`
      )}`;

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Invitation saved!
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  The invitation to {existingUser.username || email} has been recorded.
                </p>
                <div className="mt-3 flex space-x-2">
                  <a
                    href={mailtoLink}
                    className="text-sm font-medium text-scout-accent-600 hover:text-scout-accent-500"
                  >
                    Send email manually
                  </a>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 8000 });

      setShowInviteModal(false);
      setInviteEmail('');
      setInviteMessage('');

      await loadPendingInvitations(user.id);

    } catch (err) {
      console.error("Error sending invitation by email:", err);
      toast.error("An error occurred while sending the invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  // Accept invitation
  const acceptInvitation = async (connectionId) => {
    try {
      const { data: inviteData } = await supabase
        .from('user_connections')
        .select('user_id')
        .eq('id', connectionId)
        .single();

      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) {
        console.error("Error accepting invitation:", error);
        toast.error("Failed to accept invitation");
        return;
      }

      if (inviteData?.user_id) {
        try {
          await supabase.rpc('create_notification', {
            target_user_id: inviteData.user_id,
            notification_type: 'invitation_accepted',
            notification_title: `${user.username || 'Someone'} accepted your invitation`,
            notification_message: 'You can now chat together!',
            notification_link: `/chat`
          });
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }

      toast.success("Invitation accepted!");

      await loadFriends(user.id);
      await loadPendingInvitations(user.id);

      try {
        const { data: relatedNotifs } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_read', false)
          .or(`type.eq.invitation_received,type.eq.friend_request,type.eq.new_friend_request`)
          .limit(5);

        if (relatedNotifs && relatedNotifs.length > 0) {
          for (const notif of relatedNotifs) {
            await supabase.rpc('mark_notification_read', { notification_id: notif.id });
          }
        }
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }

      setFriendsTabActive('friends');
    } catch (err) {
      console.error("Error accepting invitation:", err);
      toast.error("Failed to accept invitation");
    }
  };

  // Decline invitation
  const declineInvitation = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);

      if (error) {
        console.error("Error declining invitation:", error);
        toast.error("Failed to decline invitation");
        return;
      }

      toast.success("Invitation declined");

      await loadPendingInvitations(user.id);

      try {
        const { data: relatedNotifs } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_read', false)
          .or(`type.eq.invitation_received,type.eq.friend_request,type.eq.new_friend_request`)
          .limit(5);

        if (relatedNotifs && relatedNotifs.length > 0) {
          for (const notif of relatedNotifs) {
            await supabase.rpc('mark_notification_read', { notification_id: notif.id });
          }
        }
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    } catch (err) {
      console.error("Error declining invitation:", err);
      toast.error("Failed to decline invitation");
    }
  };

  // Cancel sent invitation
  const cancelSentInvitation = async (connectionId, pendingInvitations, setPendingInvitations) => {
    const invitationToCancel = pendingInvitations.sent.find(inv => inv.id === connectionId);
    if (!invitationToCancel) return;

    setPendingInvitations(prev => ({
      ...prev,
      sent: prev.sent.filter(invite => invite.id !== connectionId)
    }));

    const { success, error } = await cancelInvitation(connectionId, user.id);

    if (!success) {
      setPendingInvitations(prev => ({
        ...prev,
        sent: [...prev.sent, invitationToCancel].sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        )
      }));

      toast.error("Failed to cancel invitation");
      console.error("Cancel invitation error:", error);
    } else {
      toast.success("Invitation canceled");
    }
  };

  // Send friend request
  const sendFriendRequest = async (targetUserId, setShowCompanionsModal, loadSuggestedCompanions) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .insert([{
          user_id: user.id,
          friend_id: targetUserId,
          status: 'pending'
        }]);

      if (error) {
        console.error("Error sending friend request:", error);
        toast.error("Failed to send friend request");
        return;
      }

      toast.success("Friend request sent!");
      setShowCompanionsModal(false);

      await loadSuggestedCompanions(user.id);
    } catch (err) {
      console.error("Error sending friend request:", err);
      toast.error("Failed to send friend request");
    }
  };

  return {
    sendInviteByEmail,
    acceptInvitation,
    declineInvitation,
    cancelSentInvitation,
    sendFriendRequest
  };
}
