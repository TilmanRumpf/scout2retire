import { chromium } from 'playwright';

async function testTownDisplay() {
  console.log('Testing town display on localhost...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to town discovery
    console.log('Navigating to http://localhost:5173/towns');
    await page.goto('http://localhost:5173/towns');

    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for town names in the page
    const townNames = await page.evaluate(() => {
      const h3Elements = document.querySelectorAll('h3');
      const names = [];
      h3Elements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 0) {
          names.push(text);
        }
      });
      return names;
    });

    console.log('Town names found on page:');
    if (townNames.length > 0) {
      townNames.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`);
      });
      console.log(`\n✅ Found ${townNames.length} town names!`);
    } else {
      console.log('  ❌ No town names found!');

      // Check if there are any error messages
      const errors = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
        return Array.from(errorElements).map(el => el.textContent);
      });

      if (errors.length > 0) {
        console.log('\nErrors on page:', errors);
      }
    }

    // Take a screenshot for reference
    await page.screenshot({ path: 'town-display-test.png', fullPage: false });
    console.log('\nScreenshot saved as town-display-test.png');

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testTownDisplay();