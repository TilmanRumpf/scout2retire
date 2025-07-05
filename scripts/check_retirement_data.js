import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRetirementData() {
  console.log('Checking retirement date data...\n');

  try {
    // 1. Find user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error getting auth users:', authError);
      // Try different approach
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .or('email.eq.tilman.rumpf@gmail.com,full_name.ilike.%Tilman%');
      
      if (usersError) {
        console.error('Error getting users:', usersError);
        return;
      }
      
      console.log('Found users:', users);
      
      if (users && users.length > 0) {
        const userId = users[0].id;
        
        // 2. Check onboarding data
        const { data: onboarding, error: onboardingError } = await supabase
          .from('onboarding_responses')
          .select('*')
          .eq('user_id', userId);
        
        if (onboardingError) {
          console.error('Error getting onboarding data:', onboardingError);
        } else {
          console.log('\nOnboarding data found:', onboarding?.length > 0);
          if (onboarding && onboarding.length > 0) {
            const currentStatus = onboarding[0].current_status;
            console.log('\nCurrent status:', JSON.stringify(currentStatus, null, 2));
            
            if (currentStatus?.retirement_timeline) {
              console.log('\nRetirement timeline:', JSON.stringify(currentStatus.retirement_timeline, null, 2));
            } else {
              console.log('\nNo retirement_timeline found in current_status');
            }
          }
        }
        
        // 3. Check user profile
        console.log('\nUser profile retirement info:');
        console.log('- retirement_date:', users[0].retirement_date);
        console.log('- retirement_year_estimate:', users[0].retirement_year_estimate);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRetirementData();