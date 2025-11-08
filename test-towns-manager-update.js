// Test Towns Manager Update - Check if "name" field error is fixed
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages and errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  try {
    console.log('✅ Step 1: Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/test-1-login.png' });

    console.log('✅ Step 2: Filling credentials...');
    await page.fill('input[type="email"]', 'tilman.rumpf@gmail.com');
    await page.fill('input[type="password"]', 'Schoko2005');
    await page.screenshot({ path: '/tmp/test-2-filled.png' });

    console.log('✅ Step 3: Submitting login...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/test-3-after-login.png' });

    console.log('✅ Step 4: Navigating to Towns Manager...');
    await page.goto('http://localhost:5173/admin/towns-manager', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/test-4-towns-manager.png', fullPage: true });

    console.log('✅ Step 5: Looking for editable fields...');
    const editableField = await page.locator('[contenteditable="true"], input[type="text"], textarea').first();
    const fieldExists = await editableField.count() > 0;

    if (!fieldExists) {
      console.log('⚠️  No editable fields found - taking screenshot');
      await page.screenshot({ path: '/tmp/test-5-no-fields.png', fullPage: true });
      console.log('❌ TEST FAILED: Cannot find editable fields');
      await browser.close();
      process.exit(1);
    }

    console.log('✅ Step 6: Attempting to edit field...');
    await editableField.click();
    await page.waitForTimeout(500);

    // Clear and type new value
    await editableField.fill('TEST_VALUE_12345');
    await page.screenshot({ path: '/tmp/test-6-edited.png', fullPage: true });

    console.log('✅ Step 7: Blurring field to trigger save...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(3000); // Wait for API call

    await page.screenshot({ path: '/tmp/test-7-after-save.png', fullPage: true });

    // Check for the specific error
    console.log('\n📊 RESULTS:');
    console.log('='.repeat(50));

    const hasNameFieldError = errors.some(err =>
      err.includes('42703') ||
      err.includes('has no field "name"') ||
      err.includes('record "new" has no field')
    );

    if (hasNameFieldError) {
      console.log('❌ ERROR STILL EXISTS!');
      console.log('The "name" field error (42703) was detected:');
      errors.forEach(err => console.log('  - ' + err));
      console.log('\n🔍 The fix did NOT work - trigger/function still references "name"');
    } else if (errors.length > 0) {
      console.log('⚠️  OTHER ERRORS DETECTED:');
      errors.forEach(err => console.log('  - ' + err));
      console.log('\n✅ But the "name" field error (42703) is GONE!');
    } else {
      console.log('✅ SUCCESS! No errors detected!');
      console.log('The update worked without the "name" field error!');
    }

    console.log('='.repeat(50));
    console.log('\n📸 Screenshots saved to /tmp/test-*.png');

  } catch (error) {
    console.log('\n❌ TEST ERROR:', error.message);
    await page.screenshot({ path: '/tmp/test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
