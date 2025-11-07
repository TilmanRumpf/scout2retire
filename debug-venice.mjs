import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console messages from the browser
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('venice') || text.includes('Venice') || text.includes('matchScore') || text.includes('categoryScores')) {
      console.log('[BROWSER]', text);
    }
  });
  
  console.log('1. Navigating to localhost:5173...');
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Check if we're on login page
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  if (currentUrl.includes('/login')) {
    console.log('❌ Page redirected to login - need authentication');
    await browser.close();
    return;
  }
  
  console.log('2. Navigating to Discover page...');
  await page.goto('http://localhost:5173/discover');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('3. Taking screenshot of Discover page...');
  await page.screenshot({ path: '/tmp/screenshot-discover.png', fullPage: true });
  
  // Look for Venice in the towns list
  console.log('4. Looking for Venice in town cards...');
  const veniceCard = await page.locator('text=Venice').first();
  const veniceVisible = await veniceCard.isVisible().catch(() => false);
  
  if (!veniceVisible) {
    console.log('❌ Venice not visible on Discover page');
    console.log('Checking all town names on page...');
    const townNames = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="cursor-pointer"]'));
      return cards.slice(0, 10).map(card => card.textContent).filter(t => t);
    });
    console.log('Town names found:', townNames);
    await browser.close();
    return;
  }
  
  console.log('✅ Found Venice! Clicking...');
  await veniceCard.click();
  await page.waitForTimeout(2000);
  
  console.log('5. Taking screenshot of Venice page...');
  await page.screenshot({ path: '/tmp/screenshot-venice.png', fullPage: true });
  
  // Extract Venice data from the page
  console.log('6. Extracting Venice data...');
  const veniceData = await page.evaluate(() => {
    const scoreElement = document.querySelector('text=Score:')?.parentElement;
    const score = scoreElement?.textContent?.match(/Score:\s*(\d+)%/)?.[1];
    
    // Find all data fields showing "--"
    const allText = document.body.innerText;
    const dashedFields = allText.match(/--/g)?.length || 0;
    
    return {
      score: score || 'not found',
      dashedFieldCount: dashedFields,
      url: window.location.href
    };
  });
  
  console.log('\n=== VENICE DATA ===');
  console.log(JSON.stringify(veniceData, null, 2));
  
  await page.waitForTimeout(3000);
  await browser.close();
})();
