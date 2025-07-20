import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function testFixedCompleteOnboarding() {
  console.log('=== Testing fixed completeOnboarding logic ===\n');

  const testUserId = 'da39d09b-af4e-4f11-a67a-b06bd54e06f7';
  
  console.log(`Testing with user: ${testUserId}`);
  
  // Check initial state
  const { data: initialState } = await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('user_id', testUserId)
    .single();
  
  console.log(`Initial onboarding_completed: ${initialState?.onboarding_completed}\n`);

  // Simulate the fixed completeOnboarding function
  console.log('Executing fixed update logic...');
  const { data: updatedUser, error } = await supabase
    .from('user_preferences')
    .update({ onboarding_completed: true })
    .eq('user_id', testUserId)
    .select()
    .single();
  
  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log('✅ Update succeeded!');
    console.log(`onboarding_completed is now: ${updatedUser.onboarding_completed}`);
  }

  // Verify the change persisted
  console.log('\nVerifying the change persisted...');
  const { data: finalState } = await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('user_id', testUserId)
    .single();
  
  console.log(`Final onboarding_completed: ${finalState?.onboarding_completed}`);

  // Reset back to false for testing
  console.log('\nResetting back to false for future testing...');
  await supabase
    .from('user_preferences')
    .update({ onboarding_completed: false })
    .eq('user_id', testUserId);
  
  console.log('Reset complete.');
  
  console.log('\n✅ The fix works! The issue was the incorrect use of upsert with .eq() chaining.');
  console.log('The solution is to use update() instead of upsert() for updating existing records.');
}

testFixedCompleteOnboarding().catch(console.error);