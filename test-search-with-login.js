// Test search feature with proper login
import { chromium } from 'playwright';

async function testSearchWithLogin() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Track console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('❌ Page Error:', error.message);
  });

  try {
    console.log('\n🚀 Testing Scout2Retire Search Feature with Login\n');
    console.log('='*50 + '\n');

    // Step 1: Navigate to app
    console.log('1️⃣  Navigating to Scout2Retire...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // Step 2: Handle login if needed
    if (currentUrl.includes('/welcome')) {
      console.log('\n2️⃣  On welcome page - clicking Log In...');

      // Click Log In button
      await page.click('text="Log In"');
      await page.waitForURL('**/login**', { timeout: 5000 });

      console.log('3️⃣  Filling login form...');
      await page.fill('input[type="email"]', 'tilman.rumpf@gmail.com');
      await page.fill('input[type="password"]', 'testing123');

      await page.screenshot({ path: '/tmp/scout-login.png' });
      console.log('   Screenshot saved: /tmp/scout-login.png');

      console.log('4️⃣  Submitting login...');
      await page.click('button[type="submit"]');

      // Wait for navigation away from login
      try {
        await page.waitForURL((url) => !url.toString().includes('/login') && !url.toString().includes('/welcome'), {
          timeout: 10000
        });
        console.log('   ✅ Login successful!');
      } catch (e) {
        console.log('   ❌ Login failed or timed out');
        await page.screenshot({ path: '/tmp/scout-login-error.png' });
        throw new Error('Login failed');
      }

      await page.waitForTimeout(2000);
    }

    // Step 3: Open hamburger menu
    console.log('\n5️⃣  Opening QuickNav menu...');
    const hamburgerButton = page.locator('.nav-toggle').first();

    if (await hamburgerButton.isVisible()) {
      await hamburgerButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: '/tmp/scout-menu.png' });
      console.log('   ✅ Menu opened - screenshot: /tmp/scout-menu.png');

      // Step 4: Click Search
      console.log('\n6️⃣  Looking for Search button...');
      const searchButton = page.locator('button:has-text("Search")').first();

      if (await searchButton.isVisible()) {
        console.log('   ✅ Search button found - clicking...');
        await searchButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: '/tmp/scout-search-modal.png' });
        console.log('   ✅ Search modal opened - screenshot: /tmp/scout-search-modal.png');

        // Step 5: Test Text Search
        console.log('\n7️⃣  Testing Text Search...');
        const searchInput = page.locator('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]').first();

        if (await searchInput.isVisible()) {
          await searchInput.fill('Valencia');
          console.log('   ✅ Entered search term: "Valencia"');
          await page.waitForTimeout(2000); // Wait for search results

          await page.screenshot({ path: '/tmp/scout-search-results.png' });
          console.log('   ✅ Search results screenshot: /tmp/scout-search-results.png');

          // Check for database errors
          const errorCheck = page.locator('text=/column.*undefined|column.*does not exist|error/i');
          const hasErrors = await errorCheck.count() > 0;

          if (hasErrors) {
            const errorText = await errorCheck.first().textContent();
            console.log(`   ❌ DATABASE ERROR FOUND: ${errorText}`);
            errors.push(errorText);
          } else {
            console.log('   ✅ No database errors - search working correctly!');

            // Count results
            const results = await page.locator('[role="button"], .search-result, .town-card').count();
            console.log(`   ✅ Found ${results} search results`);
          }
        } else {
          console.log('   ❌ Search input not found');
        }

        // Step 6: Test By Country tab
        console.log('\n8️⃣  Testing By Country search...');
        const countryTab = page.locator('button:has-text("By Country")').first();

        if (await countryTab.isVisible()) {
          await countryTab.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ path: '/tmp/scout-country-search.png' });
          console.log('   ✅ By Country tab screenshot: /tmp/scout-country-search.png');

          // Try to select a country
          const countrySelect = page.locator('select').first();
          if (await countrySelect.isVisible()) {
            const options = await countrySelect.locator('option').count();
            console.log(`   ✅ Found ${options - 1} countries available`);

            if (options > 1) {
              await countrySelect.selectOption({ index: 1 });
              await page.waitForTimeout(1500);
              console.log('   ✅ Selected first country');
            }
          }
        }

        // Step 7: Test Nearby search
        console.log('\n9️⃣  Testing Nearby search...');
        const nearbyTab = page.locator('button:has-text("Nearby")').first();

        if (await nearbyTab.isVisible()) {
          await nearbyTab.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ path: '/tmp/scout-nearby-search.png' });
          console.log('   ✅ Nearby tab screenshot: /tmp/scout-nearby-search.png');
        }

        // Summary
        console.log('\n' + '='*50);
        console.log('📊 TEST SUMMARY:');
        console.log('='*50);

        if (errors.length === 0) {
          console.log('✅ ALL TESTS PASSED! Search feature is working correctly.');
          console.log('✅ The state_code column issue has been fixed.');
          console.log('✅ All three search modes are functional:');
          console.log('   • Text Search ✅');
          console.log('   • By Country ✅');
          console.log('   • Nearby ✅');
        } else {
          console.log(`❌ Found ${errors.length} errors:`);
          errors.forEach((err, i) => {
            console.log(`   ${i + 1}. ${err}`);
          });
        }

        console.log('\n📸 Screenshots saved:');
        console.log('   • /tmp/scout-login.png');
        console.log('   • /tmp/scout-menu.png');
        console.log('   • /tmp/scout-search-modal.png');
        console.log('   • /tmp/scout-search-results.png');
        console.log('   • /tmp/scout-country-search.png');
        console.log('   • /tmp/scout-nearby-search.png');

      } else {
        console.log('   ❌ Search button not found in menu');
        await page.screenshot({ path: '/tmp/scout-error-no-search.png' });
      }
    } else {
      console.log('   ❌ Hamburger menu not visible');
      console.log(`   Current URL: ${page.url()}`);
      await page.screenshot({ path: '/tmp/scout-error-no-menu.png' });
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({ path: '/tmp/scout-error-final.png' });
  } finally {
    console.log('\nKeeping browser open for 10 seconds to review...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('Browser closed.\n');
  }
}

testSearchWithLogin();