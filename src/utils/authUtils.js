import supabase from './supabaseClient';
import toast from 'react-hot-toast';

// Auth helpers
export const signUp = async (email, password, fullName, retirementDate, hometown = null, username = null, avatarUrl = null) => {
  try {
    // First check if username is already taken (if username provided)
    if (username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();
      
      if (existingUser) {
        toast.error('This username is already taken. Please choose a different one.');
        return { success: false, reason: 'username_taken' };
      }
    }
    
    // First try signing up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // Check if error is due to user already existing
      if (authError.message.includes('already registered') || 
          authError.message.includes('User already registered') ||
          authError.status === 422) {
        
        // Try to sign in the user instead
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInData?.user && !signInError) {
          // Check if user profile exists
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', signInData.user.id)
            .single();
            
          if (!profile) {
            // Create profile if it doesn't exist
            await supabase.from('users').insert([{
              id: signInData.user.id,
              email,
              full_name: fullName,
              retirement_year_estimate: new Date(retirementDate).getFullYear(),
              onboarding_completed: false,
              hometown: hometown || null,
              username: username || null,
              avatar_url: avatarUrl || null
            }]);
          }
          
          toast.success('Welcome back! You have been signed in.');
          return { success: true, user: signInData.user };
        }
        
        toast.error('This email is already registered. Please log in instead.');
        return { success: false, reason: 'already_exists' };
      }
      toast.error(`Signup failed: ${authError.message}`);
      return { success: false, error: authError };
    }

    // If signup successful, create user profile
    if (authData.user) {
      console.log('🔄 Creating user profile for:', authData.user.id);
      console.log('📝 Profile data:', {
        id: authData.user.id,
        email,
        full_name: fullName,
        retirement_year_estimate: new Date(retirementDate).getFullYear(),
        hometown: hometown || null,
        username: username ? username.toLowerCase() : null,
        avatar_url: avatarUrl || null
      });

      // Create user profile directly (RPC function doesn't exist)
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            retirement_year_estimate: new Date(retirementDate).getFullYear(),
            onboarding_completed: false,
            hometown: hometown || null,
            username: username ? username.toLowerCase() : null,
            avatar_url: avatarUrl || null
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        
        // Profile creation failed - check if it's a username conflict
        if ((profileError.code === '23505' && profileError.message.includes('username')) ||
            (profileError.message && profileError.message.includes('Username already taken'))) {
          // Username already taken
          toast.error('This username is already taken. Please try a different username.');
          return { 
            success: false, 
            error: profileError,
            reason: 'username_taken',
            // Include auth user ID so the UI can handle this case
            authUserId: authData.user.id
          };
        }
        
        toast.error(`Error creating profile: ${profileError.message}`);
        return { success: false, error: profileError };
      }
      
      console.log('✅ Profile created successfully:', profileData);
      
      // If email confirmation is not required, sign the user in manually
      if (!authData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error("Auto sign-in error:", signInError);
          // Don't show error toast here - just return success for the signup
        } else {
          return { 
            success: true, 
            user: signInData.user,
            session: signInData.session
          };
        }
      }

      return { 
        success: true, 
        user: authData.user,
        session: authData.session 
      };
    }
    
    return { success: false, error: new Error("User creation failed with no error") };
  } catch (error) {
    toast.error(`An unexpected error occurred: ${error.message}`);
    return { success: false, error };
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(`Login failed: ${error.message}`);
      return { success: false, error };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    toast.error(`An unexpected error occurred: ${error.message}`);
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    toast.error(`An unexpected error occurred: ${error.message}`);
    return { success: false, error };
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(`Password reset failed: ${error.message}`);
      return { success: false, error };
    }

    toast.success('Password reset email sent! Check your inbox.');
    return { success: true };
  } catch (error) {
    toast.error(`An unexpected error occurred: ${error.message}`);
    return { success: false, error };
  }
};

export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error(`Password update failed: ${error.message}`);
      return { success: false, error };
    }

    toast.success('Password updated successfully!');
    return { success: true };
  } catch (error) {
    toast.error(`An unexpected error occurred: ${error.message}`);
    return { success: false, error };
  }
};

export const getCurrentUser = async () => {
  try {
    let { data: { session } } = await supabase.auth.getSession();
    
    // If no session, try once more after a brief delay (session might still be loading)
    if (!session) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const retryResult = await supabase.auth.getSession();
      session = retryResult.data.session;
    }
    
    if (!session) {
      console.log('No session found in getCurrentUser');
      return { user: null };
    }

    console.log('Session user:', session.user);
    console.log('Session user ID:', session.user?.id);

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      
      // Check if it's a missing profile (406 error) vs other database errors
      if (error.code === 'PGRST116' || error.message?.includes('Row not found')) {
        // Profile doesn't exist - this is the Tobias bug scenario
        console.error("Auth user exists but profile missing - blocking access");
        
        // In development, give a helpful error
        if (window.location.hostname === 'localhost') {
          toast.error('Profile missing! Run: node scripts/fix-missing-user-profiles.js');
        }
      }
      
      // SECURITY FIX: No profile = No access
      return { user: null, profile: null, error };
    }

    return { user: session.user, profile: userData };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error };
  }
};

// Helper function to ensure user has a valid profile in the users table
export const ensureUserProfile = async (userId) => {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error || !profile) {
      console.error("User profile not found in users table:", error);
      return { hasProfile: false, error };
    }
    
    return { hasProfile: true, profile };
  } catch (error) {
    console.error("Error checking user profile:", error);
    return { hasProfile: false, error };
  }
};