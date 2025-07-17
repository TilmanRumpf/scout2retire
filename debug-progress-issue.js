import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 DEBUGGING ONBOARDING PROGRESS OBJECT RENDER ISSUE');
console.log('====================================================\n');

// Test what getOnboardingProgress actually returns
async function testProgressFunction() {
  // Get a real user ID
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (error || !users || users.length === 0) {
      console.log('❌ No users found to test with');
      return;
    }
    
    const testUser = users[0];
    console.log('📋 Testing with user:', testUser.email);
    
    // Test the actual getOnboardingProgress response
    const { data, error: progError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', testUser.id);
    
    console.log('\n🔍 Raw onboarding_responses query result:');
    console.log('Data:', data);
    console.log('Error:', progError);
    
    // Simulate what the getOnboardingProgress function does
    const steps = [
      'current_status',
      'region_preferences', 
      'climate_preferences',
      'culture_preferences',
      'hobbies',
      'administration',
      'costs'
    ];
    
    let progressResult;
    
    if (!data || data.length === 0) {
      const completedSteps = {};
      steps.forEach(step => {
        completedSteps[step] = false;
      });
      
      progressResult = {
        success: true,
        progress: {
          completedSteps,
          completedCount: 0,
          totalSteps: steps.length,
          percentage: 0
        },
        data: null
      };
    } else {
      const userData = data[0];
      const completedSteps = {};
      let completedCount = 0;
      
      steps.forEach(step => {
        const isCompleted = userData && userData[step] !== null && userData[step] !== undefined;
        completedSteps[step] = isCompleted;
        if (isCompleted) completedCount++;
      });
      
      progressResult = {
        success: true,
        progress: {
          completedSteps,
          completedCount,
          totalSteps: steps.length,
          percentage: Math.round((completedCount / steps.length) * 100)
        },
        data: userData
      };
    }
    
    console.log('\n📊 Simulated getOnboardingProgress result:');
    console.log('Full result:', JSON.stringify(progressResult, null, 2));
    console.log('\n🎯 What ProfileUnified would extract:');
    console.log('progressResult.success:', progressResult.success);
    console.log('progressResult.progress:', progressResult.progress);
    console.log('progressResult.progress.percentage:', progressResult.progress?.percentage);
    console.log('Type of percentage:', typeof progressResult.progress?.percentage);
    
    // Test the exact code from ProfileUnified
    if (progressResult.success && progressResult.progress) {
      const percentage = progressResult.progress.percentage || 0;
      console.log('\n✅ ProfileUnified would set onboardingProgress to:', percentage);
      console.log('Type:', typeof percentage);
      console.log('String representation: "' + percentage + '% Complete"');
    } else {
      console.log('\n❌ ProfileUnified would set onboardingProgress to: 0');
      console.log('Error object:', progressResult.error);
      console.log('Error type:', typeof progressResult.error);
    }
    
  } catch (e) {
    console.log('❌ Error in test:', e.message);
  }
}

testProgressFunction();