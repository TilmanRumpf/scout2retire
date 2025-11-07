import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Checking public town count via UI...\n');
  
  // Navigate to discover page (assumes user is logged in)
  await page.goto('http://localhost:5173/discover');
  await page.waitForTimeout(3000);
  
  // Check if we see towns or login page
  const url = page.url();
  console.log('Current URL:', url);
  
  if (url.includes('login') || url.includes('welcome')) {
    console.log('❌ Not logged in - cannot check public town count');
    await browser.close();
    return;
  }
  
  // Count town cards on the page
  const townCount = await page.evaluate(() => {
    // Look for town elements - adjust selector based on actual structure
    const townElements = document.querySelectorAll('[class*="town"]');
    return townElements.length;
  });
  
  console.log(`✅ Found ${townCount} town elements on page`);
  
  await page.screenshot({ path: '/tmp/discover-page.png' });
  console.log('Screenshot saved to /tmp/discover-page.png');
  
  await browser.close();
})();
