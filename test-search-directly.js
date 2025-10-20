// Direct test of search functionality
import { chromium } from 'playwright';

async function testSearch() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    // Use existing session if available
    storageState: undefined
  });

  const page = await context.newPage();

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  try {
    console.log('\n🚀 Testing Search Feature Directly\n');
    console.log('=====================================\n');

    // Navigate directly to the app (hoping we're already logged in)
    console.log('1️⃣  Navigating to Scout2Retire...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/search-test-01.png' });
    console.log('✅ Initial page loaded - screenshot saved');

    // Try to open the hamburger menu
    console.log('\n2️⃣  Looking for hamburger menu...');
    const hamburgerButton = page.locator('.nav-toggle').first();

    if (await hamburgerButton.isVisible()) {
      console.log('✅ Hamburger menu found - clicking...');
      await hamburgerButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: '/tmp/search-test-02.png' });
      console.log('✅ Menu opened - screenshot saved');

      // Look for Search button
      console.log('\n3️⃣  Looking for Search button...');
      const searchButton = page.locator('button:has-text("Search")').first();

      if (await searchButton.isVisible()) {
        console.log('✅ Search button found - clicking...');
        await searchButton.click();
        await page.waitForTimeout(1500);

        await page.screenshot({ path: '/tmp/search-test-03.png' });
        console.log('✅ Search modal opened - screenshot saved');

        // Test text search
        console.log('\n4️⃣  Testing text search...');
        const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();

        if (await searchInput.isVisible()) {
          await searchInput.fill('Valencia');
          console.log('✅ Entered search term: Valencia');
          await page.waitForTimeout(2000); // Wait for results

          await page.screenshot({ path: '/tmp/search-test-04.png' });
          console.log('✅ Search results displayed - screenshot saved');

          // Check for results or errors
          const errorMessage = page.locator('text=/error|failed/i').first();
          if (await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
            const errorText = await errorMessage.textContent();
            console.log(`❌ Error found: ${errorText}`);
          } else {
            console.log('✅ No errors detected in search results');
          }

          // Check if results are showing
          const resultsCount = await page.locator('[role="button"]').count();
          console.log(`✅ Found ${resultsCount} clickable elements (potential results)`);
        } else {
          console.log('❌ Search input not found');
        }

        // Test "By Country" tab
        console.log('\n5️⃣  Testing By Country search...');
        const countryTab = page.locator('button:has-text("By Country")').first();

        if (await countryTab.isVisible()) {
          await countryTab.click();
          await page.waitForTimeout(1000);

          await page.screenshot({ path: '/tmp/search-test-05.png' });
          console.log('✅ By Country tab selected - screenshot saved');
        }

        // Test "Nearby" tab
        console.log('\n6️⃣  Testing Nearby search...');
        const nearbyTab = page.locator('button:has-text("Nearby")').first();

        if (await nearbyTab.isVisible()) {
          await nearbyTab.click();
          await page.waitForTimeout(1000);

          await page.screenshot({ path: '/tmp/search-test-06.png' });
          console.log('✅ Nearby tab selected - screenshot saved');
        }

        console.log('\n✅ Search Feature Test Completed!');
        console.log('=====================================');
        console.log('Screenshots saved:');
        console.log('  • /tmp/search-test-01.png - Initial page');
        console.log('  • /tmp/search-test-02.png - Menu open');
        console.log('  • /tmp/search-test-03.png - Search modal');
        console.log('  • /tmp/search-test-04.png - Search results');
        console.log('  • /tmp/search-test-05.png - By Country tab');
        console.log('  • /tmp/search-test-06.png - Nearby tab');

      } else {
        console.log('❌ Search button not found in menu');
        await page.screenshot({ path: '/tmp/search-test-error.png' });
      }
    } else {
      console.log('❌ Hamburger menu not visible');
      console.log('Current URL:', page.url());
      await page.screenshot({ path: '/tmp/search-test-error.png' });
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: '/tmp/search-test-error.png' });
  } finally {
    console.log('\nClosing browser in 3 seconds...');
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testSearch();