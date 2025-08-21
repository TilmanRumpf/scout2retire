import { chromium } from 'playwright';

(async () => {
  console.log('Testing current-status page button sizing...');
  try {
    const browser = await chromium.launch({ headless: true });
    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    
    // Test multiple viewport sizes to check for button consistency
    const viewports = [
      { name: 'mobile-xs', width: 320, height: 568 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'mobile-lg', width: 414, height: 896 },
      { name: 'tablet-sm', width: 640, height: 960 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop-sm', width: 1024, height: 768 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'desktop-lg', width: 1440, height: 900 }
    ];
    
    // Navigate to our test button sizing page
    console.log('Navigating to test button sizing page...');
    await page.goto('http://localhost:5173/test-button-sizing');
    await page.waitForTimeout(2000);
    console.log('Current URL:', page.url());
    
    // For now, let's just test the button sizing on the page we can access
    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Take full page screenshot
      await page.screenshot({ 
        path: `button-sizing-${viewport.name}.png`, 
        fullPage: true 
      });
      
      // Also take focused screenshots of each button section
      const sections = await page.$$('[data-testid="selection-section"], section, .mb-6');
      for (let i = 0; i < Math.min(sections.length, 3); i++) {
        await sections[i].screenshot({ 
          path: `button-section-${i}-${viewport.name}.png`
        });
      }
    }
    
    await browser.close();
    console.log('All screenshots saved successfully');
  } catch (error) {
    console.error('Error:', error);
  }
})();