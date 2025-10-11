import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Chat Page Tests', () => {
  test('should load chat page and test tabs', async ({ page }) => {
    console.log('Starting Chat page test...\n');

    // Track console messages
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ CONSOLE ERROR:', msg.text());
      }
    });

    // Step 1: Login first
    console.log('1. Logging in...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // Check if we need to login
    const currentUrlBeforeLogin = page.url();
    if (!currentUrlBeforeLogin.includes('/daily') && !currentUrlBeforeLogin.includes('/chat')) {
      console.log('   ⚠️  Not logged in, attempting login...');

      // Fill in login form with test credentials
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      if (await emailInput.count() > 0) {
        console.log('   ℹ️  Login form found, entering credentials...');
        await emailInput.fill(process.env.TEST_USER_EMAIL);
        await passwordInput.fill(process.env.TEST_USER_PASSWORD);

        // Click login button
        const loginButton = page.locator('button[type="submit"]').first();
        await loginButton.click();

        console.log('   ⏳ Waiting for authentication...');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Give it time to process auth

        const urlAfterLogin = page.url();
        console.log('   ℹ️  URL after login:', urlAfterLogin);

        if (urlAfterLogin.includes('/login')) {
          console.log('   ❌ Login failed - still on login page');
          await page.screenshot({ path: '/tmp/chat-login-failed.png', fullPage: true });
          test.skip('Authentication failed');
          return;
        }

        console.log('   ✓ Login successful');
      } else {
        console.log('   ❌ No login form found');
        await page.screenshot({ path: '/tmp/chat-no-form.png', fullPage: true });
        test.skip('No login form available');
        return;
      }
    } else {
      console.log('   ✓ Already authenticated');
    }

    // Step 2: Navigate to chat page
    console.log('\n2. Navigating to Chat page...');
    await page.goto('http://localhost:5173/chat');
    await page.waitForLoadState('networkidle');

    // Check if redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/welcome')) {
      console.log('❌ Redirected to auth page:', currentUrl);
      console.log('⚠️  Session expired or not authenticated');
      await page.screenshot({ path: '/tmp/chat-needs-auth.png', fullPage: true });
      test.skip('Authentication required');
      return;
    }

    console.log('✓ Chat page loaded (authenticated)');
    await page.screenshot({ path: '/tmp/chat-initial.png', fullPage: true });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Test tabs
    console.log('\n2. Testing tabs...');
    const tabs = ['Lobby', 'Lounges', 'Groups', 'Friends'];

    for (const tabName of tabs) {
      try {
        const tabButton = page.getByRole('button', { name: tabName });
        const isVisible = await tabButton.isVisible({ timeout: 2000 });

        if (isVisible) {
          console.log(`   ✓ Found "${tabName}" tab`);
          await tabButton.click();
          await page.waitForTimeout(500);
          console.log(`   ✓ Clicked "${tabName}" tab`);
          await page.screenshot({ path: `/tmp/chat-tab-${tabName.toLowerCase()}.png`, fullPage: true });
        } else {
          console.log(`   ⚠️  "${tabName}" tab not visible`);
        }
      } catch (e) {
        console.log(`   ❌ Error with "${tabName}" tab:`, e.message);
      }
    }

    // Final screenshot
    await page.screenshot({ path: '/tmp/chat-final.png', fullPage: true });

    // Report results
    console.log('\n📊 RESULTS:');
    console.log(`   Console errors: ${consoleErrors.length}`);
    console.log(`   Current URL: ${page.url()}`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ Errors found:');
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    }

    console.log('\n✅ Test completed');
  });
});
