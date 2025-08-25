import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to welcome page...');
    await page.goto('http://localhost:5173/welcome');
    await page.waitForLoadState('networkidle');
    
    // Look for any way to access onboarding from welcome page
    console.log('Looking for navigation options...');
    
    // Try to find login or signup buttons to see full onboarding flow
    const loginButton = page.locator('text=Log In').first();
    const signupButton = page.locator('text=Sign Up').first();
    const getStartedButton = page.locator('text=Get Started').first();
    
    if (await getStartedButton.isVisible()) {
      console.log('Found Get Started button, clicking...');
      await getStartedButton.click();
      await page.waitForLoadState('networkidle');
      console.log('After Get Started, URL:', page.url());
    }
    
    // Try manual URL override with bypass
    console.log('Attempting direct URL with hash navigation...');
    await page.goto('http://localhost:5173/onboarding/hobbies#bypass');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/hobbies-page.png' });
    
    // Get page content to debug
    const pageContent = await page.content();
    console.log('Page URL:', page.url());
    
    // Look for any text that might indicate we're on the hobbies page
    const hasHobbiesContent = pageContent.includes('Physical Activities') || pageContent.includes('Hobbies') || pageContent.includes('Activities');
    console.log('Has hobbies content:', hasHobbiesContent);
    
    // Look for the Physical Activities section
    const physicalActivitiesSection = await page.locator('text=Physical Activities').first();
    const isPhysicalActivitiesVisible = await physicalActivitiesSection.isVisible().catch(() => false);
    
    if (isPhysicalActivitiesVisible) {
      console.log('✅ Physical Activities section found');
      
      // Look for "Add More" button
      const addMoreButtons = await page.locator('text=Add More').all();
      console.log(`Found ${addMoreButtons.length} "Add More" buttons`);
      
      if (addMoreButtons.length > 0) {
        console.log('✅ Add More button found');
        
        // Check for ANY plus icons on the entire page
        const allPlusIcons = await page.locator('svg').filter({ hasText: '+' }).count();
        const plusSymbols = await page.locator('text="+",text="＋"').count();
        const plusClasses = await page.locator('[class*="plus"], [class*="add"]').count();
        
        console.log(`Found ${allPlusIcons} SVG plus icons`);
        console.log(`Found ${plusSymbols} plus text symbols`);
        console.log(`Found ${plusClasses} elements with plus/add classes`);
        
        const totalPlusIcons = allPlusIcons + plusSymbols + plusClasses;
        
        if (totalPlusIcons > 0) {
          console.log('🔍 PLUS ICON STILL EXISTS');
        } else {
          console.log('✅ NO PLUS ICON FOUND');
        }
        
        // Take a screenshot of the first Add More button
        await addMoreButtons[0].screenshot({ path: '/tmp/add-more-button.png' });
        
      } else {
        console.log('❌ Add More button not found');
      }
    } else {
      console.log('❌ Physical Activities section not found');
      console.log('Taking full page screenshot for debugging...');
      await page.screenshot({ path: '/tmp/debug-page.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();