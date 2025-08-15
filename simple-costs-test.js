import playwright from 'playwright';

async function testCostsPage() {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigating to onboarding costs page...');
    await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: 'costs-page-debug.png', fullPage: true });
    
    // Get page title and URL to confirm we're on the right page
    const title = await page.title();
    const url = page.url();
    console.log(`Page title: ${title}`);
    console.log(`Current URL: ${url}`);
    
    // Check what's actually on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Page content preview:', bodyText.substring(0, 500));
    
    // Look for housing-related elements
    const housingElements = await page.locator('*:has-text("housing"), *:has-text("rent"), *:has-text("buy")').count();
    console.log(`Found ${housingElements} housing-related elements`);
    
    // Try to find any buttons
    const buttons = await page.locator('button').count();
    console.log(`Found ${buttons} buttons on the page`);
    
    if (buttons > 0) {
      const buttonTexts = await page.locator('button').allTextContents();
      console.log('Button texts:', buttonTexts.slice(0, 10)); // First 10 buttons
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'costs-page-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testCostsPage().catch(console.error);