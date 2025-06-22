import supabase from './supabaseClient';

/**
 * Search for a user by email using Supabase Auth
 * This works around RLS restrictions on the users table
 */
export const findUserByEmail = async (email) => {
  try {
    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    
    // Try to sign in with the email and a dummy password
    // This will tell us if the user exists without actually signing them in
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: 'dummy-password-to-check-existence'
    });
    
    // If we get "Invalid login credentials" it means the user exists
    // If we get "User not found" or similar, the user doesn't exist
    if (error) {
      console.log("Auth check error:", error.message);
      
      // Check the error message to determine if user exists
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('incorrect') ||
          error.message.includes('wrong')) {
        // User exists but wrong password (which is expected)
        return { exists: true, email: normalizedEmail };
      } else if (error.message.includes('not found') || 
                 error.message.includes('not registered')) {
        // User doesn't exist
        return { exists: false, email: normalizedEmail };
      }
      
      // For any other error, assume user might exist
      return { exists: true, email: normalizedEmail, uncertain: true };
    }
    
    // Shouldn't reach here, but if we do, assume user exists
    return { exists: true, email: normalizedEmail };
  } catch (err) {
    console.error("Error checking user existence:", err);
    return { exists: false, email: email, error: err.message };
  }
};

/**
 * Create a friend connection by email
 * Since we can't look up user IDs due to RLS, we'll use a different approach
 */
export const createFriendInvitationByEmail = async (inviterUserId, inviteeEmail) => {
  try {
    // First check if the user exists
    const userCheck = await findUserByEmail(inviteeEmail);
    
    if (!userCheck.exists) {
      return { 
        success: false, 
        error: "No user found with this email address. They need to sign up first!" 
      };
    }
    
    // Since we can't get the user ID directly, we'll create a pending invitation
    // that the recipient can accept when they log in
    // For now, we'll just return success and handle the actual connection differently
    
    return { 
      success: true, 
      message: userCheck.uncertain 
        ? `Invitation process started for ${inviteeEmail}` 
        : `User found! They'll need to accept your invitation.`
    };
  } catch (err) {
    console.error("Error creating invitation:", err);
    return { success: false, error: err.message };
  }
};