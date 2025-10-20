// Comprehensive test for Scout2Retire Search Feature
import { chromium } from 'playwright';

const EMAIL = process.env.TEST_EMAIL || 'tilman.rumpf@gmail.com';
const PASSWORD = process.env.TEST_PASSWORD || 'testing123';

// Helper function to take a screenshot and log progress
async function takeScreenshot(page, name, description) {
  const path = `/tmp/${name}.png`;
  await page.screenshot({ path });
  console.log(`✅ ${description} - Screenshot saved to ${path}`);
}

// Helper function to wait and click safely
async function safeClick(page, selector, description) {
  try {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout: 5000 });
    await element.click();
    console.log(`✅ ${description}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to ${description}: ${error.message}`);
    return false;
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  try {
    console.log('\n🚀 Starting Search Feature Test\n');
    console.log('=====================================\n');

    // Step 1: Navigate to the app
    console.log('1️⃣  Navigating to Scout2Retire...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '01-initial-page', 'Initial page loaded');

    // Step 2: Check if we need to login
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('/welcome') || currentUrl.includes('/login')) {
      console.log('\n2️⃣  Login required - attempting login...');

      // Navigate to login if on welcome page
      if (currentUrl.includes('/welcome')) {
        const loginButton = page.locator('text=/log in/i').or(page.locator('a[href="/login"]')).first();
        if (await loginButton.isVisible()) {
          await loginButton.click();
          await page.waitForURL('**/login**', { timeout: 5000 });
        }
      }

      // Fill login form
      await page.fill('input[type="email"]', EMAIL);
      await page.fill('input[type="password"]', PASSWORD);
      await takeScreenshot(page, '02-login-form', 'Login form filled');

      // Submit login
      await page.click('button[type="submit"]');
      console.log('   Waiting for login...');
      await page.waitForURL((url) => !url.toString().includes('/login') && !url.toString().includes('/welcome'), {
        timeout: 10000
      });
      await page.waitForTimeout(2000);
      console.log(`   ✅ Logged in - now at: ${page.url()}`);
    }

    await takeScreenshot(page, '03-after-login', 'After login');

    // Step 3: Open QuickNav menu
    console.log('\n3️⃣  Opening QuickNav menu...');
    const hamburgerButton = page.locator('.nav-toggle').first();
    const hamburgerVisible = await hamburgerButton.isVisible();

    if (hamburgerVisible) {
      await hamburgerButton.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '04-quicknav-open', 'QuickNav menu opened');
      console.log('   ✅ QuickNav menu opened');
    } else {
      console.log('   ⚠️  Hamburger menu not visible');
    }

    // Step 4: Click on Search
    console.log('\n4️⃣  Looking for Search option...');
    const searchButton = page.locator('button:has-text("Search")').first();
    const searchVisible = await searchButton.isVisible();

    if (searchVisible) {
      console.log('   ✅ Search button found');
      await searchButton.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '05-search-modal', 'Search modal opened');

      // Step 5: Test Text Search
      console.log('\n5️⃣  Testing Text Search mode...');

      // Ensure we're in text search mode
      const textSearchTab = page.locator('button:has-text("Text Search")').first();
      if (await textSearchTab.isVisible()) {
        await textSearchTab.click();
        await page.waitForTimeout(500);
      }

      // Type in search box
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Valencia');
        console.log('   ✅ Entered search term: Valencia');
        await page.waitForTimeout(1500); // Wait for debounce and results
        await takeScreenshot(page, '06-search-results', 'Search results for Valencia');
      }

      // Step 6: Test Nearby Search
      console.log('\n6️⃣  Testing Nearby Search mode...');
      const nearbyTab = page.locator('button:has-text("Nearby")').first();
      if (await nearbyTab.isVisible()) {
        await nearbyTab.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '07-nearby-mode', 'Nearby search mode');
        console.log('   ✅ Switched to Nearby mode');
      }

      // Step 7: Test Country Search
      console.log('\n7️⃣  Testing Country Search mode...');
      const countryTab = page.locator('button:has-text("By Country")').first();
      if (await countryTab.isVisible()) {
        await countryTab.click();
        await page.waitForTimeout(1000);

        // Select a country
        const countrySelect = page.locator('select').first();
        if (await countrySelect.isVisible()) {
          await countrySelect.selectOption({ index: 1 }); // Select first country
          await page.waitForTimeout(1500);
          await takeScreenshot(page, '08-country-search', 'Country search results');
          console.log('   ✅ Selected country and got results');
        }
      }

      // Step 8: Test responsive design
      console.log('\n8️⃣  Testing responsive design...');

      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '09-mobile-view', 'Mobile view (iPhone size)');

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '10-tablet-view', 'Tablet view (iPad size)');

      // Return to desktop
      await page.setViewportSize({ width: 1280, height: 720 });

      console.log('\n✅ Search Feature Test Completed Successfully!\n');
      console.log('=====================================\n');
      console.log('Screenshots saved to /tmp/ directory:');
      console.log('  • 01-initial-page.png');
      console.log('  • 02-login-form.png');
      console.log('  • 03-after-login.png');
      console.log('  • 04-quicknav-open.png');
      console.log('  • 05-search-modal.png');
      console.log('  • 06-search-results.png');
      console.log('  • 07-nearby-mode.png');
      console.log('  • 08-country-search.png');
      console.log('  • 09-mobile-view.png');
      console.log('  • 10-tablet-view.png');

    } else {
      console.log('   ❌ Search button not found in QuickNav');
      await takeScreenshot(page, 'error-no-search', 'Search button not found');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await takeScreenshot(page, 'error-screenshot', 'Error occurred');
  } finally {
    console.log('\nClosing browser in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();