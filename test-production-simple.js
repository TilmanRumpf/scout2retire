import https from 'https';

// Test production deployment
function testProduction() {
  console.log('🔍 Testing production at scout2retire.vercel.app...\n');
  
  const options = {
    hostname: 'scout2retire.vercel.app',
    port: 443,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Scout2Retire-Test/1.0'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log('✅ Status:', res.statusCode, res.statusMessage);
    console.log('\n📊 Headers:');
    console.log('- Server:', res.headers['server'] || 'Not specified');
    console.log('- Cache:', res.headers['x-vercel-cache'] || 'Not specified');
    console.log('- Vercel ID:', res.headers['x-vercel-id'] || 'Not specified');
    console.log('- Date:', res.headers['date'] || 'Not specified');
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      // Look for build ID in the HTML
      const buildIdMatch = data.match(/_next\/static\/([^\/]+)\//);
      if (buildIdMatch) {
        console.log('\n🔨 Build ID:', buildIdMatch[1]);
      }
      
      // Count script tags to get an idea of the build
      const scriptCount = (data.match(/<script/g) || []).length;
      console.log('📜 Script tags found:', scriptCount);
      
      // Look for any error messages that might indicate old code
      if (data.includes('nationality')) {
        console.log('\n⚠️ WARNING: Found "nationality" in the HTML - might be old build!');
      } else {
        console.log('\n✅ No references to "nationality" found in HTML');
      }
      
      console.log('\n💡 Next steps:');
      console.log('1. If build seems old, try clearing Vercel cache');
      console.log('2. Check Vercel dashboard for deployment status');
      console.log('3. Force redeploy if necessary');
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
  });
  
  req.end();
}

testProduction();