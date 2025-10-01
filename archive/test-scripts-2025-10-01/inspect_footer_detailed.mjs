import { chromium } from 'playwright';

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
    
    // Look for copyright text specifically and trace the entire DOM hierarchy
    const copyrightElements = await page.locator('text=© 2025 Scout2Retire').all();
    
    console.log(`Found ${copyrightElements.length} copyright elements`);
    
    if (copyrightElements.length > 0) {
      const element = copyrightElements[0];
      
      // Get the complete hierarchy up to the body
      const hierarchy = await element.evaluate(el => {
        const parents = [];
        let current = el;
        
        while (current && current.tagName !== 'BODY') {
          const computed = window.getComputedStyle(current);
          parents.push({
            tagName: current.tagName,
            className: current.className,
            id: current.id,
            textContent: current.textContent?.trim().substring(0, 100) + (current.textContent?.length > 100 ? '...' : ''),
            styles: {
              backgroundColor: computed.backgroundColor,
              borderTop: computed.borderTop,
              borderBottom: computed.borderBottom,
              position: computed.position,
              bottom: computed.bottom,
              width: computed.width,
              height: computed.height,
              padding: computed.padding,
              margin: computed.margin,
              boxSizing: computed.boxSizing
            }
          });
          current = current.parentElement;
        }
        
        return parents;
      });
      
      console.log('\n=== COMPLETE DOM HIERARCHY FROM FOOTER TO BODY ===');
      hierarchy.forEach((parent, index) => {
        console.log(`\nLevel ${index} (${parent.tagName}):`);
        console.log(`  Classes: "${parent.className}"`);
        console.log(`  ID: "${parent.id}"`);
        console.log(`  Background: ${parent.styles.backgroundColor}`);
        console.log(`  Border Top: ${parent.styles.borderTop}`);
        console.log(`  Border Bottom: ${parent.styles.borderBottom}`);
        console.log(`  Position: ${parent.styles.position}`);
        console.log(`  Dimensions: ${parent.styles.width} x ${parent.styles.height}`);
        console.log(`  Padding: ${parent.styles.padding}`);
        console.log(`  Margin: ${parent.styles.margin}`);
        console.log(`  Text: "${parent.textContent}"`);
      });
      
      // Also check for any elements with gray backgrounds
      console.log('\n=== GRAY BACKGROUND ELEMENTS ===');
      const grayElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const grayBgs = [];
        
        elements.forEach((el) => {
          const computed = window.getComputedStyle(el);
          const bgColor = computed.backgroundColor;
          
          // Check for gray backgrounds
          if (bgColor && (
            bgColor.includes('rgb(249, 250, 251)') || // gray-50
            bgColor.includes('rgb(243, 244, 246)') || // gray-100
            bgColor.includes('rgb(229, 231, 235)') || // gray-200
            bgColor.includes('rgb(209, 213, 219)') || // gray-300
            bgColor.includes('rgb(156, 163, 175)') || // gray-400
            bgColor.includes('rgb(107, 114, 128)') || // gray-500
            bgColor.includes('rgb(75, 85, 99)')  ||   // gray-600
            bgColor.includes('rgb(55, 65, 81)')  ||   // gray-700
            bgColor.includes('rgb(31, 41, 55)')  ||   // gray-800
            bgColor.includes('rgb(17, 24, 39)')  ||   // gray-900
            bgColor.includes('rgb(3, 7, 18)')         // gray-950
          )) {
            grayBgs.push({
              element: el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''),
              bgColor: bgColor,
              textContent: el.textContent?.trim().substring(0, 50),
              position: computed.position,
              bottom: computed.bottom,
              borderTop: computed.borderTop,
              borderBottom: computed.borderBottom,
              width: computed.width,
              height: computed.height,
              className: el.className
            });
          }
        });
        
        return grayBgs;
      });
      
      console.log(`Found ${grayElements.length} elements with gray backgrounds:`);
      grayElements.forEach((el, i) => {
        console.log(`\n${i + 1}. ${el.element}`);
        console.log(`   Classes: "${el.className}"`);
        console.log(`   Background: ${el.bgColor}`);
        console.log(`   Text: "${el.textContent}"`);
        console.log(`   Position: ${el.position}, Bottom: ${el.bottom}`);
        console.log(`   Dimensions: ${el.width} x ${el.height}`);
        console.log(`   Border: Top: ${el.borderTop}, Bottom: ${el.borderBottom}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();