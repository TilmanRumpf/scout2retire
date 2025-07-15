// Test matching in browser context
import { getPersonalizedTowns } from './matchingAlgorithm.js';

export async function testMatchingInBrowser(userId) {
  console.log('🧪 Testing matching in browser context for user:', userId);
  
  try {
    const result = await getPersonalizedTowns(userId, { limit: 10 });
    
    console.log('✅ getPersonalizedTowns completed');
    console.log('Success:', result.success);
    console.log('Towns found:', result.towns?.length || 0);
    
    if (result.towns && result.towns.length > 0) {
      console.log('🎉 MATCHES FOUND!');
      result.towns.slice(0, 3).forEach((town, i) => {
        console.log(`${i+1}. ${town.name}, ${town.country} - Score: ${town.matchScore || 'No score'}`);
      });
    } else {
      console.log('❌ NO MATCHES FOUND');
      console.log('Error:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Error in testMatchingInBrowser:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run test if user is logged in
setTimeout(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const testUser = urlParams.get('testMatching');
  
  if (testUser === 'true') {
    // Get user from localStorage or current auth
    const userData = localStorage.getItem('supabase.auth.token');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        const userId = parsed?.user?.id;
        if (userId) {
          await testMatchingInBrowser(userId);
        }
      } catch (e) {
        console.log('Could not get user ID for test');
      }
    }
  }
}, 2000);