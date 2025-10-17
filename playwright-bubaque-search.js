const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to admin panel
    console.log('Navigating to admin panel...');
    await page.goto('http://localhost:5173/admin/towns-manager', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait a bit for the page to fully render
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/admin-initial.png', fullPage: true });
    console.log('Initial screenshot taken');

    // Look for search input - try multiple selectors
    let searchInput = await page.locator('input[type="text"]').first();
    if (await searchInput.count() === 0) {
      searchInput = await page.locator('input').first();
    }

    if (await searchInput.count() > 0) {
      console.log('Found search input, typing Bubaque...');
      await searchInput.fill('Bubaque');
      await page.waitForTimeout(2000);

      // Take screenshot after search
      await page.screenshot({ path: '/tmp/admin-bubaque-search.png', fullPage: true });
      console.log('Search screenshot taken');
    } else {
      console.log('No search input found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
