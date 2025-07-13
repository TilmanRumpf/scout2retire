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
 * Check if a username is available
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} - True if available, false if taken
 */
export const checkUsernameAvailability = async (username) => {
  try {
    // Use the RPC function to check username availability
    const { data, error } = await supabase
      .rpc('check_username_available', { 
        check_username: username.toLowerCase() 
      });
    
    if (error) {
      console.error("Error checking username availability:", error);
      // Fall back to direct query if RPC fails
      try {
        const { data: userData, error: queryError } = await supabase
          .from('users')
          .select('username')
          .eq('username', username.toLowerCase())
          .maybeSingle();
        
        if (queryError) {
          console.error("Fallback query error:", queryError);
          return true; // Assume available on error
        }
        
        return !userData; // Available if no user found
      } catch (fallbackErr) {
        console