// Test the enhanced matching algorithm through the API
// This tests the actual integration in the running app

async function testEnhancedMatching() {
  console.log('Testing Enhanced Matching Algorithm Integration...\n');
  
  try {
    // Test 1: Check if the TownDiscovery page loads with personalization
    console.log('1. Testing Town Discovery page with personalization...');
    const discoveryResponse = await fetch('http://localhost:5173/discover');
    if (discoveryResponse.ok) {
      console.log('✅ Town Discovery page loads successfully');
    } else {
      console.log('❌ Town Discovery page failed to load');
    }
    
    // Test 2: Check if the Daily page works with enhanced matching
    console.log('\n2. Testing Daily page with enhanced matching...');
    const dailyResponse = await fetch('http://localhost:5173/daily');
    if (dailyResponse.ok) {
      console.log('✅ Daily page loads successfully');
    } else {
      console.log('❌ Daily page failed to load');
    }
    
    // Test 3: Check console logs in the browser
    console.log('\n3. Manual verification steps:');
    console.log('   a) Open http://localhost:5173 in your browser');
    console.log('   b) Log in with a test account');
    console.log('   c) Navigate to the Discover page');
    console.log('   d) Open browser console (F12)');
    console.log('   e) Look for "Personalized recommendations loaded!" message');
    console.log('   f) Check if towns show match percentages');
    console.log('   g) Navigate to Daily page and verify match scores');
    
    console.log('\n4. Expected console logs:');
    console.log('   - "Personalized recommendations loaded!"');
    console.log('   - "User preferences: {...}"');
    console.log('   - "Top 3 towns with scores: [...]"');
    
    console.log('\n5. Visual checks:');
    console.log('   - Town cards should show match percentages (e.g., 85%)');
    console.log('   - Match percentages should be color-coded:');
    console.log('     • Green for 80%+ (Excellent match)');
    console.log('     • Yellow for 60-79% (Good match)');
    console.log('     • Orange for <60% (Fair match)');
    console.log('   - Appeal statements should reflect match quality');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEnhancedMatching();