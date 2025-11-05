import { chromium } from 'playwright';

async function checkAllTowns() {
  console.log('Checking all towns display...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Clear cache
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Navigate to towns page
    await page.goto('http://localhost:5173/towns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Scroll to load more content
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
    }

    // Get all town names displayed
    const townInfo = await page.evaluate(() => {
      // Look for town cards with actual town names
      const results = [];

      // Check h3 elements
      document.querySelectorAll('h3').forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.includes(',')) {
          results.push({ type: 'h3', text });
        }
      });

      // Check h4 elements
      document.querySelectorAll('h4').forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.includes(',')) {
          results.push({ type: 'h4', text });
        }
      });

      return results;
    });

    console.log('Towns found on page:');
    if (townInfo.length > 0) {
      const uniqueTowns = new Set();
      townInfo.forEach(info => {
        if (!uniqueTowns.has(info.text)) {
          console.log(`  - ${info.text}`);
          uniqueTowns.add(info.text);
        }
      });
      console.log(`\n✅ Total unique towns displayed: ${uniqueTowns.size}`);
    } else {
      console.log('  ❌ No towns with names found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkAllTowns();
