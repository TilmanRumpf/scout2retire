import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(2000);

    // Login
    const loginBtn = await page.locator('button').filter({ hasText: 'Log In' }).first().isVisible().catch(() => false);
    if (loginBtn) {
      await page.click('button:has-text("Log In")');
      await page.waitForTimeout(1000);
      await page.fill('input[type="email"]', 'tilman.rumpf@gmail.com');
      await page.fill('input[type="password"]', 'Schoko2005');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    // Go to Towns Manager
    await page.goto('http://localhost:5173/admin/towns');
    await page.waitForTimeout(5000);

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'test-towns-page.png', fullPage: true });

    // Get page content to analyze structure
    const html = await page.content();
    console.log('Page title:', await page.title());
    console.log('URL:', page.url());

    // Try to find clickable elements
    const clickableText = await page.locator('*').filter({ hasText: /Lisbon|Valencia|Granada/ }).first().textContent().catch(() => 'not found');
    console.log('Found town text:', clickableText);

    // Just wait and keep browser open
    console.log('\nBrowser open for manual inspection...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
})();
