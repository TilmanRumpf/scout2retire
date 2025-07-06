import supabase from './supabaseClient';

// Companion/Friend management utilities

// Cancel a sent invitation
export const cancelInvitation = async (invitationId, userId) => {
  try {
    // First, let's check what we're trying to delete
    const { data: checkData } = await supabase
      .from('user_connections')
      .select('*')
      .eq('id', invitationId)
      .single();
      
    console.log("Invitation to cancel:", { checkData });
    
    // Try to update the status to 'cancelled' first (more likely to work with RLS)
    const { data: updateData, error: updateError } = await supabase
      .from('user_connections')
      .update({ 
        status: 'cancelled'
      })
      .eq('id', invitationId)
      .eq('user_id', userId)
      .select();
      
    console.log("Update to cancelled result:", { updateData, updateError });
      
    if (!updateError && updateData && updateData.length > 0) {
      console.log("Successfully cancelled invitation");
      return { success: true };
    }
    
    // If update failed, try delete as fallback
    const { data: deleteData, error: deleteError } = await supabase
      .from('user_connections')
      .delete()
      .eq('id', invitationId)
      .eq('user_id', userId)
      .select();
      
    console.log("Delete attempt result:", { deleteData, deleteError });
      
    if (!deleteError) {
      return { success: true };
    }
    
    // If both failed, return the error
    const finalError = updateError || deleteError;
    console.error("Failed to cancel invitation:", finalError);
    return { success: false, error: finalError };
  } catch (err) {
    console.error("Error in cancelInvitation:", err);
    return { success: false, error: err };
  }
};

export const fetchCompanions = async (userId) => {
  try {
    // Fetch accepted friendships where the user is either the requester or receiver
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester:requester_id(id, full_name, email),
        receiver:receiver_id(id, full_name, email)
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) {
      console.error("Error fetching companions:", error);
      return { success: false, error };
    }

    // Transform the data to get companion info
    const companions = data.map(friendship => {
      const isRequester = friendship.requester_id === userId;
      const companion = isRequester ? friendship.receiver : friendship.requester;
      
      return {
        id: companion.id,
        name: companion.full_name,
        email: companion.email,
        friendship_id: friendship.id,
        connected_at: friendship.accepted_at,
        status: 'offline' // This would be determined by presence system
      };
    });

    return { success: true, companions };
  } catch (error) {
    console.error("Unexpected error fetching companions:", error);
    return { success: false, error };
  }
};

export const sendFriendRequest = async (requesterId, receiverEmail) => {
  try {
    // First, find the user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', receiverEmail)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'User not found' };
    }

    const receiverId = userData.id;

    // Check if friendship already exists
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('*')
      .or(
        `and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),` +
        `and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`
      )
      .single();

    if (existingFriendship) {
      return { success: false, error: 'Friendship request already exists' };
    }

    // Create new friendship request
    const { data, error } = await supabase
      .from('friendships')
      .insert([{
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending',
        requested_at: new Date().toISOString()
      }]);

    if (error) {
      console.error("Error sending friend request:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error sending friend request:", error);
    return { success: false, error };
  }
};

export const acceptFriendRequest = async (friendshipId) => {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', friendshipId);

    if (error) {
      console.error("Error accepting friend request:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error accepting friend request:", error);
    return { success: false, error };
  }
};

export const getPendingFriendRequests = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester:requester_id(id, full_name, email)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error("Error fetching pending requests:", error);
      return { success: false, error };
    }

    return { success: true, requests: data };
  } catch (error) {
    console.error("Unexpected error fetching pending requests:", error);
    return { success: false, error };
  }
};

export const blockUser = async (blockerId, blockedUserId) => {
  try {
    // First, remove any existing friendship
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .or(
        `and(requester_id.eq.${blockerId},receiver_id.eq.${blockedUserId}),` +
        `and(requester_id.eq.${blockedUserId},receiver_id.eq.${blockerId})`
      );

    if (deleteError) {
      console.error("Error removing friendship:", deleteError);
    }

    // Add to blocked users table
    const { error } = await supabase
      .from('blocked_users')
      .insert([{
        blocker_id: blockerId,
        blocked_id: blockedUserId,
        blocked_at: new Date().toISOString()
      }]);

    if (error) {
      console.error("Error blocking user:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error blocking user:", error);
    return { success: false, error };
  }
};

export const getLastMessage = async (userId1, userId2) => {
  try {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),` +
        `and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && !error.message.includes('No rows found')) {
      console.error("Error fetching last message:", error);
      return { success: false, error };
    }

    return { success: true, message: data };
  } catch (error) {
    console.error("Unexpected error fetching last message:", error);
    return { success: false, error };
  }
};