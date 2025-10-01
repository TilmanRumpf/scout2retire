import { chromium } from 'playwright';

async function inspectHobbyPage() {
  console.log('🔍 Inspecting hobby page to understand its current state...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the hobby page
    console.log('1. Navigating to http://localhost:5173/onboarding/hobbies');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take a full page screenshot to see what's there
    console.log('2. Taking full page screenshot...');
    await page.screenshot({ path: 'hobby_page_full.png', fullPage: true });
    console.log('   ✅ Screenshot saved as hobby_page_full.png');
    
    // Check the current URL (might have redirected)
    const currentUrl = page.url();
    console.log(`3. Current URL: ${currentUrl}`);
    
    // Check if this is the landing page or the hobby page
    const pageTitle = await page.title();
    console.log(`   Page title: ${pageTitle}`);
    
    // Look for specific elements that would indicate which page we're on
    const hasGetStarted = await page.locator('text=Get Started').count();
    const hasLogIn = await page.locator('text=Log In').count();
    const hasPhysicalActivities = await page.locator('text=Physical Activities').count();
    const hasHobbiesInterests = await page.locator('text=Hobbies & Interests').count();
    const hasWalkingCycling = await page.locator('text=Walking & Cycling').count();
    const hasAddMore = await page.locator('text=Add More').count();
    
    console.log('\n4. Page element analysis:');
    console.log(`   - "Get Started" button: ${hasGetStarted > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`   - "Log In" button: ${hasLogIn > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`   - "Physical Activities" section: ${hasPhysicalActivities > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`   - "Hobbies & Interests" section: ${hasHobbiesInterests > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`   - "Walking & Cycling" card: ${hasWalkingCycling > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`   - "Add More" buttons: ${hasAddMore > 0 ? `✅ Found ${hasAddMore}` : '❌ Not found'}`);
    
    // Check if we need to authenticate first
    if (hasGetStarted > 0) {
      console.log('\n5. Detected landing page - attempting authentication...');
      console.log('   Clicking "Get Started" to begin onboarding...');
      await page.click('text=Get Started');
      await page.waitForTimeout(2000);
      
      // Check new URL
      const newUrl = page.url();
      console.log(`   New URL after clicking Get Started: ${newUrl}`);
      
      // Take another screenshot
      await page.screenshot({ path: 'after_get_started.png', fullPage: true });
      console.log('   ✅ Screenshot saved as after_get_started.png');
    }
    
    console.log('\n6. Test completed! Check the screenshots to understand the page flow.');
    
  } catch (error) {
    console.error('❌ Error during inspection:', error);
  } finally {
    await browser.close();
  }
}

inspectHobbyPage();