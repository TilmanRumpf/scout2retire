import fetch from 'node-fetch';

// Test production API to see if it's still trying to insert nationality
async function testProductionAPI() {
  console.log('🔍 Testing production API at scout2retire.vercel.app...\n');
  
  // Test 1: Check if the site is accessible
  try {
    const response = await fetch('https://scout2retire.vercel.app/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Scout2Retire-Deployment-Test/1.0'
      }
    });
    
    console.log('✅ Site Status:', response.status, response.statusText);
    console.log('📅 Last Modified:', response.headers.get('last-modified') || 'Not available');
    console.log('🏷️ ETag:', response.headers.get('etag') || 'Not available');
    console.log('🌐 Server:', response.headers.get('server') || 'Not available');
    console.log('📦 X-Vercel-Cache:', response.headers.get('x-vercel-cache') || 'Not available');
    console.log('🆔 X-Vercel-ID:', response.headers.get('x-vercel-id') || 'Not available');
    
    // Check if we can find any build info in the HTML
    const html = await response.text();
    
    // Look for common build artifacts
    const buildIdMatch = html.match(/_next\/static\/([^\/]+)\//);
    if (buildIdMatch) {
      console.log('🔨 Build ID:', buildIdMatch[1]);
    }
    
    // Check for any script tags that might have version info
    const scriptMatches = html.match(/<script[^>]*src="([^"]*)"[^>]*>/g) || [];
    console.log(`\n📜 Found ${scriptMatches.length} script tags`);
    
    // Look for the main app bundle
    const mainBundle = scriptMatches.find(s => s.includes('app-') || s.includes('main'));
    if (mainBundle) {
      console.log('📱 Main bundle:', mainBundle.match(/src="([^"]*)"/)[1]);
    }
    
  } catch (error) {
    console.error('❌ Error accessing production site:', error.message);
  }
  
  // Test 2: Check API endpoint (if accessible)
  console.log('\n🔍 Checking API endpoint...');
  try {
    const apiResponse = await fetch('https://scout2retire.vercel.app/api/health', {
      method: 'GET',
      headers: {
        'User-Agent': 'Scout2Retire-Deployment-Test/1.0'
      }
    });
    
    if (apiResponse.ok) {
      console.log('✅ API Health Check:', apiResponse.status);
      const data = await apiResponse.text();
      console.log('📊 Response:', data);
    } else {
      console.log('ℹ️ API Health endpoint not available (status:', apiResponse.status + ')');
    }
  } catch (error) {
    console.log('ℹ️ No public API health endpoint found');
  }
  
  // Test 3: Check Supabase connection from client side
  console.log('\n🔍 Checking Supabase connection...');
  console.log('🌐 Supabase URL: https://axlruvvsjepsulcbqlho.supabase.co');
  
  // Test 4: Look for deployment timestamp
  console.log('\n📅 Deployment Information:');
  console.log('Last known commits:');
  console.log('- 321c2c7: Force Vercel rebuild - add Linux Rollup dependency');
  console.log('- 3f85aa6: Fix username parameter mismatch in signup flow');
  console.log('- 077973e: Update auth system and clean users table schema');
  
  console.log('\n💡 To verify if the latest build is deployed:');
  console.log('1. Check the Vercel dashboard at https://vercel.com/dashboard');
  console.log('2. Look for the latest deployment timestamp');
  console.log('3. Verify the commit hash matches 321c2c7 or later');
  console.log('4. Check build logs for any errors');
}

// Run the test
testProductionAPI().catch(console.error);