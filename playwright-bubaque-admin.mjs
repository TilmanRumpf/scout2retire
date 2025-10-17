import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to home first to establish session
    console.log('Navigating to home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Take screenshot of initial page
    await page.screenshot({ path: '/tmp/admin-home.png', fullPage: true });
    console.log('Home page screenshot taken');

    // Navigate to admin panel
    console.log('Navigating to admin panel...');
    await page.goto('http://localhost:5173/admin/towns-manager', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Take screenshot of admin page
    await page.screenshot({ path: '/tmp/admin-page.png', fullPage: true });
    console.log('Admin page screenshot taken');

    // Get page content for debugging
    const title = await page.title();
    const url = page.url();
    console.log('Page title:', title);
    console.log('Current URL:', url);

    // Try to find any input fields
    const inputs = await page.locator('input').count();
    console.log('Number of input fields found:', inputs);

    if (inputs > 0) {
      // Get all input placeholders
      const inputElements = await page.locator('input').all();
      for (let i = 0; i < inputElements.length; i++) {
        const placeholder = await inputElements[i].getAttribute('placeholder');
        const type = await inputElements[i].getAttribute('type');
        console.log(`Input ${i}: type="${type}", placeholder="${placeholder}"`);
      }

      // Try to find search input
      const searchInput = await page.locator('input[placeholder*="Search" i], input[placeholder*="town" i], input[type="search"]').first();
      if (await searchInput.count() > 0) {
        console.log('Found search input, typing Bubaque...');
        await searchInput.fill('Bubaque');
        await page.waitForTimeout(2000);

        // Take screenshot after search
        await page.screenshot({ path: '/tmp/admin-bubaque-search.png', fullPage: true });
        console.log('Search screenshot taken');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/tmp/admin-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
