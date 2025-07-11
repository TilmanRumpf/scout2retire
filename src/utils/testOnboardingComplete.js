// Test script to verify onboarding_completed update
import supabase from './supabaseClient.js';

async function testOnboardingUpdate() {
  try {
    // First, get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No active session. Please log in first.');
      return;
    }
    
    const userId = session.user.id;
    console.log('Testing with user ID:', userId);
    
    // Check current onboarding_completed status
    const { data: userBefore, error: fetchError } = await supabase
      .from('users')
      .select('id, email, onboarding_completed')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return;
    }
    
    console.log('User before update:', userBefore);
    
    // Try to update onboarding_completed
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating onboarding_completed:', updateError);
      console.error('Error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      return;
    }
    
    console.log('Update successful! User after update:', updateData);
    
    // Verify the update by fetching again
    const { data: userAfter, error: verifyError } = await supabase
      .from('users')
      .select('id, email, onboarding_completed')
      .eq('id', userId)
      .single();
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }
    
    console.log('Verification - User after update:', userAfter);
    
    if (userAfter.onboarding_completed === true) {
      console.log('✅ SUCCESS: onboarding_completed was successfully updated to TRUE');
    } else {
      console.log('❌ FAILED: onboarding_completed is still FALSE');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Export the function to be called from browser console
window.testOnboardingUpdate = testOnboardingUpdate;

console.log('Test function loaded. Call window.testOnboardingUpdate() in the console to test.');