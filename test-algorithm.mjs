import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  try {
    console.log('Navigating to algorithm admin page...');
    await page.goto('http://localhost:5173/admin/algorithm', { waitUntil: 'networkidle' });
    
    // Take first screenshot
    console.log('Taking screenshot of algorithm page...');
    await page.screenshot({ path: './test-algorithm-1.png' });
    console.log('Screenshot saved');
    
    // Check page title and content
    const title = await page.title();
    console.log('Page title: ' + title);
    
    const bodyText = await page.textContent('body');
    if (bodyText.includes('404') || bodyText.includes('not found')) {
      console.log('ERROR: Page not found (404)');
    } else {
      console.log('Page loaded successfully');
    }
    
    // Look for inputs
    console.log('\nLooking for inputs...');
    const inputs = await page.locator('input[type="text"]').all();
    console.log('Found ' + inputs.length + ' text inputs');
    
    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const value = await inputs[i].inputValue();
      console.log('Input ' + i + ': placeholder="' + placeholder + '", value="' + value + '"');
    }
    
    // Try to find town input and search
    console.log('\nSearching for Gainesville...');
    const townInputs = await page.locator('input').filter({ has: page.locator('[placeholder*="Select"], [placeholder*="town"], [placeholder*="search"]') }).all();
    
    if (inputs.length > 0) {
      const input = inputs[0];
      await input.click();
      await input.fill('Gainesville');
      console.log('Typed "Gainesville"');
      
      // Wait for dropdown
      await page.waitForTimeout(1500);
      
      // Look for Gainesville option
      const options = await page.locator('text=Gainesville').all();
      console.log('Found ' + options.length + ' elements with "Gainesville"');
      
      if (options.length > 0) {
        await options[0].click();
        console.log('Clicked on Gainesville');
        await page.waitForTimeout(500);
      }
    }
    
    // Look for buttons
    console.log('\nLooking for buttons...');
    const buttonTexts = await page.locator('button').allTextContents();
    console.log('Buttons: ' + JSON.stringify(buttonTexts));
    
    // Try to click Calculate button
    const calcButtons = await page.locator('button').filter({ hasText: /Calculate/ }).all();
    console.log('Found ' + calcButtons.length + ' Calculate buttons');
    
    if (calcButtons.length > 0) {
      console.log('Clicking Calculate button...');
      await calcButtons[0].click();
      await page.waitForTimeout(2000);
      console.log('Clicked Calculate');
    }
    
    // Take final screenshot
    console.log('\nTaking final screenshot...');
    await page.screenshot({ path: './test-algorithm-2.png' });
    console.log('Screenshot saved');
    
  } catch (error) {
    console.error('Error: ' + error.message);
  } finally {
    await browser.close();
  }
})();
