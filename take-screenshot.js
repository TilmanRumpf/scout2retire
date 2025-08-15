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
    
    console.log('Navigating to localhost...');
    // Navigate to the local development server
    await page.goto('http://localhost:5173/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait a bit for any animations to complete
    console.log('Waiting for page to settle...');
    await page.waitForTimeout(2000);
    
    // Take screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: 'localhost-screenshot.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved as localhost-screenshot.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();