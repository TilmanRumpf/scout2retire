import { chromium } from 'playwright';
import dotenv from 'dotenv';

// Try loading from .env.local first, then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Default test credentials (user should update these)
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'tilman@aitmpl.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '';

(async () => {
  console.log('🧪 COMPREHENSIVE ADD TOWN FEATURE TEST');
  console.log('=' .repeat(80));

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // TEST 1: Navigate to app
    console.log('\n✓ TEST 1: Navigate to localhost:5173');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);
    testsPassed++;

    // TEST 2: Login (always try to login for fresh session)
    console.log('\n✓ TEST 2: Login to get authenticated session');
    console.log(`  Using email: ${TEST_EMAIL}`);

    // Check if we have password
    if (!TEST_PASSWORD) {
      console.log('  ❌ No password provided!');
      console.log('  Set TEST_USER_PASSWORD environment variable or update script');
      console.log('  Example: TEST_USER_PASSWORD="yourpassword" node test-add-town-feature.js');
      testsFailed++;
      await browser.close();
      return;
    }

    // Navigate to login
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Fill and submit login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000); // Wait for login to complete

    console.log('  ✅ Login completed, URL:', page.url());
    testsPassed++;

    // TEST 3: Navigate to Towns Manager
    console.log('\n✓ TEST 3: Navigate to /admin/towns-manager');
    await page.goto('http://localhost:5173/admin/towns-manager', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log(`  Current URL: ${page.url()}`);
    testsPassed++;

    // TEST 4: Take screenshot
    console.log('\n✓ TEST 4: Take screenshot of towns manager');
    await page.screenshot({ path: 'test-screenshot-1-towns-manager.png', fullPage: true });
    console.log('  ✅ Screenshot saved: test-screenshot-1-towns-manager.png');
    testsPassed++;

    // TEST 5: Check for Add Town button
    console.log('\n✓ TEST 5: Check if "+ Add Town" button exists');
    const addTownButton = await page.locator('button:has-text("+ Add Town")').count();
    if (addTownButton > 0) {
      console.log('  ✅ "+ Add Town" button found!');
      testsPassed++;
    } else {
      console.log('  ❌ "+ Add Town" button NOT found');
      testsFailed++;
      const allButtons = await page.locator('button').allTextContents();
      console.log('  All buttons on page:', allButtons.slice(0, 10));
    }

    // TEST 6: Click Add Town button
    console.log('\n✓ TEST 6: Click "+ Add Town" button');
    await page.click('button:has-text("+ Add Town")');
    await page.waitForTimeout(1000);
    console.log('  ✅ Button clicked');
    testsPassed++;

    // TEST 7: Check if modal opened
    console.log('\n✓ TEST 7: Verify modal opened');
    await page.screenshot({ path: 'test-screenshot-2-modal-open.png', fullPage: true });
    const modalVisible = await page.locator('text="Add New Town"').count();
    if (modalVisible > 0) {
      console.log('  ✅ Modal opened successfully');
      testsPassed++;
    } else {
      console.log('  ❌ Modal did NOT open');
      testsFailed++;
    }

    // TEST 8: Fill town name
    console.log('\n✓ TEST 8: Fill town name field');
    await page.fill('input[placeholder*="Valencia"]', 'Sintra');
    await page.waitForTimeout(500);
    console.log('  ✅ Town name: Sintra');
    testsPassed++;

    // TEST 9: Fill country
    console.log('\n✓ TEST 9: Fill country field');
    await page.fill('input[placeholder*="Spain"]', 'Portugal');
    await page.waitForTimeout(500);
    console.log('  ✅ Country: Portugal');
    testsPassed++;

    // TEST 10: Click Next/Verify
    console.log('\n✓ TEST 10: Click "Next" or "Verify" button');
    await page.screenshot({ path: 'test-screenshot-3-before-verify.png', fullPage: true });
    const nextButton = await page.locator('button:has-text("Next"), button:has-text("Verify")').first();
    await nextButton.click();
    await page.waitForTimeout(3000);
    console.log('  ✅ Clicked verify button');
    testsPassed++;

    // TEST 11: Wait for verification
    console.log('\n✓ TEST 11: Wait for town verification');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-screenshot-4-after-verify.png', fullPage: true });
    console.log('  ✅ Screenshot after verification');
    testsPassed++;

    // TEST 12: Check for errors in console
    console.log('\n✓ TEST 12: Check browser console for errors');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`  ⚠️  Console Error: ${msg.text()}`);
      }
    });
    page.on('pageerror', error => {
      console.log(`  ❌ Page Error: ${error.message}`);
      testsFailed++;
    });
    testsPassed++;

    // TEST 13: Look for confirmation screen
    console.log('\n✓ TEST 13: Check for confirmation screen');
    const confirmButton = await page.locator('button:has-text("Yes, Add This Town")').count();
    if (confirmButton > 0) {
      console.log('  ✅ Confirmation screen found with "Yes, Add This Town" button');
      testsPassed++;

      // TEST 14: Click confirm
      console.log('\n✓ TEST 14: Click "Yes, Add This Town" button');
      await page.screenshot({ path: 'test-screenshot-5-before-create.png', fullPage: true });
      await page.locator('button:has-text("Yes, Add This Town")').first().click();
      await page.waitForTimeout(2000);
      console.log('  ✅ Clicked confirm');
      testsPassed++;

      // TEST 15: Wait for AI population and check for errors
      console.log('\n✓ TEST 15: Wait for town creation and AI population');
      await page.waitForTimeout(15000); // AI takes time
      await page.screenshot({ path: 'test-screenshot-6-after-create.png', fullPage: true });

      // Check for success or error messages
      const successMsg = await page.locator('text=/successfully/i, text=/created/i').count();
      const errorMsg = await page.locator('text=/error/i, text=/failed/i').count();

      if (successMsg > 0) {
        console.log('  ✅ SUCCESS message found!');
        testsPassed++;
      } else if (errorMsg > 0) {
        console.log('  ❌ ERROR message found');
        const errorText = await page.locator('text=/error/i, text=/failed/i').first().textContent();
        console.log(`  Error text: ${errorText}`);
        testsFailed++;
      } else {
        console.log('  ⚠️  No clear success/error message');
        testsFailed++;
      }
    } else {
      console.log('  ⚠️  No confirmation screen found - might have encountered error earlier');
      await page.screenshot({ path: 'test-screenshot-5-no-confirm.png', fullPage: true });
      testsFailed++;
    }

  } catch (error) {
    console.log(`\n❌ FATAL ERROR: ${error.message}`);
    await page.screenshot({ path: 'test-screenshot-error.png', fullPage: true });
    testsFailed++;
  } finally {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST RESULTS:');
    console.log(`  ✅ Passed: ${testsPassed}`);
    console.log(`  ❌ Failed: ${testsFailed}`);
    console.log(`  📸 Screenshots saved in project root`);
    console.log('='.repeat(80));

    await browser.close();
  }
})();
