import supabase from './supabaseClient';
import toast from 'react-hot-toast';

// Auth helpers
export const signUp = async (email, password, fullName, nationality, retirementDate) => {
  try {
    // First try signing up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // Check if error is due to user already existing
      if (authError.message.includes('already registered') || 
          authError.message.includes('User already registered')) {
        toast.error('This email is already registered. Please log in instead.');
        return { success: false, reason: 'already_exists' };
      }
      toast.error(`Signup failed: ${authError.message}`);
      return { success: false, error: authError };
    }

    // If signup successful, create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            nationality,
            retirement_date: retirementDate,
            retirement_year_estimate: new Date(retirementDate).getFullYear(),
            onboarding_completed: false
          }
        ]);

      if (profileError) {
        toast.error(`Error creating profile: ${profileError.message}`);
        return { success: false, error: profileError };
      }
      
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
      return { user: session.user, profile: null, error };
    }

    return { user: session.user, profile: userData };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error };
  }
};