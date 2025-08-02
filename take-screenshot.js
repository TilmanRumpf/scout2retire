import { chromium } from 'playwright';

(async () => {
  console.log('Starting browser...');
  let browser;
  
  try {
    browser = await chromium.launch({
      headless: true,
      timeout: 30000
    });
    
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Set viewport for a consistent screenshot
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('Navigating to favorites page...');
    // Navigate to the favorites page
    await page.goto('https://scout2retire.vercel.app/favorites', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait a bit for any animations to complete
    console.log('Waiting for page to settle...');
    await page.waitForTimeout(2000);
    
    // Take screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: 'favorites-page-screenshot.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved as favorites-page-screenshot.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();