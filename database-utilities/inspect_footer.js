const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  try {
    console.log('Navigating to localhost:5173...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Wait a moment for the page to fully load
    await page.waitForTimeout(3000);
    
    // Take a screenshot to see the page
    await page.screenshot({ path: '/tmp/footer_page_screenshot.png', fullPage: true });
    console.log('Screenshot saved to /tmp/footer_page_screenshot.png');
    
    // Look for copyright text specifically
    const copyrightElements = await page.locator('text=© 2025 Scout2Retire').all();
    
    console.log(`Found ${copyrightElements.length} copyright elements`);
    
    for (let i = 0; i < copyrightElements.length; i++) {
      const element = copyrightElements[i];
      try {
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.evaluate(el => el.className);
        const textContent = await element.evaluate(el => el.textContent?.trim());
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            borderTop: computed.borderTop,
            borderBottom: computed.borderBottom,
            position: computed.position,
            bottom: computed.bottom,
            width: computed.width,
            height: computed.height,
            padding: computed.padding,
            margin: computed.margin
          };
        });
        
        console.log(`\nElement ${i + 1}:`);
        console.log(`Tag: ${tagName}`);
        console.log(`Classes: ${className}`);
        console.log(`Text: ${textContent}`);
        console.log(`Computed styles:`, styles);
        
        // Get parent element info
        const parent = await element.locator('..').first();
        const parentTag = await parent.evaluate(el => el.tagName);
        const parentClass = await parent.evaluate(el => el.className);
        const parentStyles = await parent.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            borderTop: computed.borderTop,
            borderBottom: computed.borderBottom,
            position: computed.position,
            bottom: computed.bottom,
            width: computed.width,
            height: computed.height,
            padding: computed.padding
          };
        });
        console.log(`Parent: ${parentTag} with classes: ${parentClass}`);
        console.log(`Parent styles:`, parentStyles);
        
        // Get grandparent info too
        const grandParent = await parent.locator('..').first();
        const grandParentTag = await grandParent.evaluate(el => el.tagName);
        const grandParentClass = await grandParent.evaluate(el => el.className);
        const grandParentStyles = await grandParent.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            borderTop: computed.borderTop,
            borderBottom: computed.borderBottom,
            position: computed.position,
            bottom: computed.bottom,
            width: computed.width,
            height: computed.height
          };
        });
        console.log(`Grandparent: ${grandParentTag} with classes: ${grandParentClass}`);
        console.log(`Grandparent styles:`, grandParentStyles);
        
      } catch (e) {
        console.log(`Error inspecting element ${i + 1}:`, e.message);
      }
    }
    
    // Also check if there's a hamburger menu that needs to be opened
    console.log('\n--- Checking for navigation menu ---');
    const hamburgerButton = await page.locator('.nav-toggle').first();
    if (await hamburgerButton.count() > 0) {
      console.log('Found hamburger button, clicking it...');
      await hamburgerButton.click();
      await page.waitForTimeout(1000);
      
      // Now look for the footer again in the opened menu
      const menuFooterElements = await page.locator('text=© 2025 Scout2Retire').all();
      console.log(`Found ${menuFooterElements.length} footer elements in menu`);
      
      if (menuFooterElements.length > 0) {
        const menuElement = menuFooterElements[0];
        const menuStyles = await menuElement.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            borderTop: computed.borderTop,
            borderBottom: computed.borderBottom,
            position: computed.position,
            bottom: computed.bottom
          };
        });
        
        const menuParent = await menuElement.locator('..').first();
        const menuParentStyles = await menuParent.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            borderTop: computed.borderTop,
            borderBottom: computed.borderBottom,
            position: computed.position,
            className: el.className
          };
        });
        
        console.log('Menu footer styles:', menuStyles);
        console.log('Menu footer parent styles:', menuParentStyles);
      }
      
      // Take another screenshot with menu open
      await page.screenshot({ path: '/tmp/footer_menu_screenshot.png', fullPage: true });
      console.log('Menu screenshot saved to /tmp/footer_menu_screenshot.png');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();