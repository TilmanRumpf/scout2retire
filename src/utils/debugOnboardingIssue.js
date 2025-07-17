// Comprehensive diagnostic for onboarding_completed update issue
import supabase from './supabaseClient.js';

export async function debugOnboardingIssue() {
  console.log('=== Starting Onboarding Debug ===');
  
  try {
    // 1. Check authentication
    console.log('\n1. Checking authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.error('No active session!');
      return;
    }
    
    console.log('✅ Session active:', session.user.email);
    console.log('User ID:', session.user.id);
    
    // 2. Check if user exists in users table
    console.log('\n2. Checking user in database...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return;
    }
    
    console.log('✅ User found in database:');
    console.log('- Email:', userData.email);
    console.log('- onboarding_completed:', userData.onboarding_completed);
    console.log('- retirement_year_estimate:', userData.retirement_year_estimate);
    
    // 3. Check RLS policies
    console.log('\n3. Testing RLS policies...');
    
    // Test SELECT
    const { data: selectTest, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id);
    
    if (selectError) {
      console.error('❌ SELECT failed:', selectError);
    } else {
      console.log('✅ SELECT works');
    }
    
    // 4. Test simple update
    console.log('\n4. Testing simple update...');
    const testTimestamp = new Date().toISOString();
    
    const { data: updateTest, error: updateError } = await supabase
      .from('users')
      .update({ full_name: userData.full_name || 'Test User' })
      .eq('id', session.user.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Simple update failed:', updateError);
      console.error('Error details:', {
        message: updateError.message,
        code: updateError.code,
        hint: updateError.hint
      });
    } else {
      console.log('✅ Simple update works');
    }
    
    // 5. Test onboarding_completed update specifically
    console.log('\n5. Testing onboarding_completed update...');
    const { data: onboardingUpdate, error: onboardingError } = await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', session.user.id)
      .select()
      .single();
    
    if (onboardingError) {
      console.error('❌ onboarding_completed update failed:', onboardingError);
      console.error('Error details:', {
        message: onboardingError.message,
        code: onboardingError.code,
        hint: onboardingError.hint,
        details: onboardingError.details
      });
    } else {
      console.log('✅ onboarding_completed update successful!');
      console.log('New value:', onboardingUpdate.onboarding_completed);
    }
    
    // 6. Verify the update
    console.log('\n6. Verifying update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('Final onboarding_completed value:', verifyData.onboarding_completed);
      if (verifyData.onboarding_completed === true) {
        console.log('✅ SUCCESS: Update persisted correctly!');
      } else {
        console.log('❌ FAILED: Update did not persist');
      }
    }
    
    // 7. Check onboarding responses
    console.log('\n7. Checking onboarding responses...');
    const { data: onboardingData, error: onboardingDataError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (onboardingDataError) {
      console.error('Error fetching onboarding responses:', onboardingDataError);
    } else if (!onboardingData || onboardingData.length === 0) {
      console.log('⚠️ No onboarding responses found for user');
    } else {
      console.log('✅ Onboarding responses found');
      const response = onboardingData[0];
      const completedSteps = [];
      const incompleteSteps = [];
      
      const steps = ['current_status', 'region_preferences', 'climate_preferences', 
                     'culture_preferences', 'hobbies', 'administration', 'costs'];
      
      steps.forEach(step => {
        if (response[step]) {
          completedSteps.push(step);
        } else {
          incompleteSteps.push(step);
        }
      });
      
      console.log('Completed steps:', completedSteps);
      console.log('Incomplete steps:', incompleteSteps);
    }
    
  } catch (error) {
    console.error('Unexpected error during debug:', error);
  }
  
  console.log('\n=== Debug Complete ===');
}

// Make it available globally
window.debugOnboardingIssue = debugOnboardingIssue;