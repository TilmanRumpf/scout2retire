import supabase from './supabaseClient.js';

export async function debugRetirementData(userEmail = 'tilman.rumpf@gmail.com') {
  console.log('=== DEBUGGING RETIREMENT DATE ISSUE ===\n');

  try {
    // 1. Find user by email
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail);
    
    if (usersError) {
      console.error('Error finding user:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('No user found with email:', userEmail);
      return;
    }
    
    const user = users[0];
    console.log('User found:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      retirement_date: user.retirement_date,
      retirement_year_estimate: user.retirement_year_estimate
    });
    
    // 2. Check onboarding data
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', user.id);
    
    if (onboardingError) {
      console.error('Error getting onboarding data:', onboardingError);
      return;
    }
    
    if (!onboarding || onboarding.length === 0) {
      console.log('\nNO ONBOARDING DATA FOUND - This is why retirement date shows "Not set"');
      return;
    }
    
    const onboardingData = onboarding[0];
    console.log('\nOnboarding data exists:', true);
    console.log('Onboarding created:', onboardingData.created_at);
    console.log('Onboarding updated:', onboardingData.updated_at);
    
    // 3. Check current_status
    if (!onboardingData.current_status) {
      console.log('\nNO current_status FOUND IN ONBOARDING DATA');
      return;
    }
    
    console.log('\ncurrent_status exists:', true);
    console.log('current_status keys:', Object.keys(onboardingData.current_status));
    
    // 4. Check retirement_timeline
    const retirementTimeline = onboardingData.current_status.retirement_timeline;
    if (!retirementTimeline) {
      console.log('\nNO retirement_timeline FOUND IN current_status');
      console.log('current_status content:', JSON.stringify(onboardingData.current_status, null, 2));
      return;
    }
    
    console.log('\nRetirement Timeline Found:');
    console.log(JSON.stringify(retirementTimeline, null, 2));
    
    // 5. Check field names
    console.log('\nChecking field names:');
    console.log('- target_year:', retirementTimeline.target_year);
    console.log('- target_month:', retirementTimeline.target_month);
    console.log('- target_day:', retirementTimeline.target_day);
    console.log('- year:', retirementTimeline.year);
    console.log('- month:', retirementTimeline.month);
    console.log('- day:', retirementTimeline.day);
    console.log('- status:', retirementTimeline.status);
    
    return {
      user,
      onboardingData,
      retirementTimeline
    };
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run if called directly
// Commented out as this is only for Node.js environment
// if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
//   debugRetirementData().then(() => process.exit(0));
// }