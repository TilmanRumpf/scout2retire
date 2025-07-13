import supabase from './supabaseClient';
import toast from 'react-hot-toast';

// Auth helpers
export const signUp = async (email, password, fullName, nationality, retirementDate, hometown = null, username = null, avatarUrl = null) => {
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
              nationality: nationality || 'pending', // Will be set in onboarding
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
      // Try using the atomic profile completion function first
      const { data: profileData, error: profileError } = await supabase
        .rpc('complete_user_profile', {
          user_id: authData.user.id,
          user_email: email,
          user_full_name: fullName,
          user_nationality: nationality || 'pending', // Will be set in onboarding
          user_retirement_year: new Date(retirementDate).getFullYear(),
          user_hometown: hometown || null,
          user_username: username ? username.toLowerCase() : null,
          user_avatar_url: avatarUrl || null
        });

      if (profileError) {
        // If RPC fails, fall back to direct insert
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              full_name: fullName,
              nationality: nationality || 'pending', // Will be set in onboarding
              retirement_year_estimate: new Date(retirementDate).getFullYear(),
              onboarding_completed: false,
              hometown: hometown || null,
              username: username ? username.toLowerCase() : null,
              avatar_url: avatarUrl || null
            }
          ]);

        const finalError = insertError || profileError;
        
        if (finalError) {
          // Profile creation failed - check if it's a username conflict
          if ((finalError.code === '23505' && finalError.message.includes('username')) ||
              (finalError.message && finalError.message.includes('Username already taken'))) {
            // Username already taken
            toast.error('This username is already taken. Please try a different username.');
            return { 
              success: false, 
              error: finalError,
              reason: 'username_taken',
              // Include auth user ID so the UI can handle this case
              authUserId: authData.user.id
            };
          }
          
          toast.error(`Error creating profile: ${finalError.message}`);
          return { success: false, error: finalError };
        }
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
    