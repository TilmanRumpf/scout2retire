#!/usr/bin/env node

/**
 * TEST DROPDOWN CLICK FUNCTIONALITY
 * Tests if we can actually click and select from the dropdown
 */

import { chromium } from 'playwright';

async function testDropdownClick() {
  const browser = await chromium.launch({
    headless: false, // Show browser so we can see what's happening
    slowMo: 500 // Slow down to see each action
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to Algorithm Manager...');
    await page.goto('http://localhost:5173/admin/algorithm');
    await page.waitForTimeout(2000);

    // Check if we need to login
    const url = page.url();
    console.log('   Current URL:', url);

    if (!url.includes('/admin/algorithm')) {
      console.log('\n⚠️  NOT ON ALGORITHM MANAGER PAGE');
      console.log('   Please navigate manually to: http://localhost:5173/admin/algorithm');
      console.log('   Waiting 20 seconds for you to navigate...\n');
      await page.waitForTimeout(20000);
    }

    console.log('\n2. Finding user input field...');
    const userInput = page.locator('input[placeholder="Type user email or name..."]');

    if (await userInput.count() === 0) {
      console.log('❌ Could not find user input!');
      return;
    }

    console.log('✅ Found user input field');

    // Clear and type "tobias"
    console.log('\n3. Typing "tobias" in the input...');
    await userInput.click();
    await userInput.fill(''); // Clear first
    await userInput.type('tobias', { delay: 100 });
    await page.waitForTimeout(1000);

    // Look for the dropdown with the exact selector from our code
    console.log('\n4. Looking for dropdown...');
    const dropdown = page.locator('div.absolute.z-50.w-full.mt-1.bg-white');

    if (await dropdown.count() > 0 && await dropdown.isVisible()) {
      console.log('✅ Dropdown is visible!');

      // Find all button elements in the dropdown
      const buttons = dropdown.locator('button');
      const buttonCount = await buttons.count();

      console.log(`   Found ${buttonCount} user buttons in dropdown`);

      // List all users
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const email = await button.locator('div').first().textContent();
        console.log(`   ${i + 1}. ${email}`);
      }

      if (buttonCount > 0) {
        console.log('\n5. Attempting to click first user...');

        // Try different click methods
        const firstButton = buttons.first();

        // Method 1: Regular click
        try {
          await firstButton.click();
          console.log('✅ Click succeeded!');
        } catch (e) {
          console.log('❌ Regular click failed:', e.message);

          // Method 2: Force click
          try {
            await firstButton.click({ force: true });
            console.log('✅ Force click succeeded!');
          } catch (e2) {
            console.log('❌ Force click failed:', e2.message);

            // Method 3: Dispatch click event
            try {
              await firstButton.dispatchEvent('click');
              console.log('✅ Dispatch event succeeded!');
            } catch (e3) {
              console.log('❌ Dispatch event failed:', e3.message);
            }
          }
        }

        await page.waitForTimeout(1000);

        // Check if the value was updated
        const inputValue = await userInput.inputValue();
        console.log(`\n6. Input value after click: "${inputValue}"`);

        if (inputValue.includes('@')) {
          console.log('✅ SUCCESS! User was selected!');
        } else {
          console.log('❌ FAILED! Input still shows:', inputValue);
        }

        // Check if dropdown closed
        const dropdownAfterClick = await dropdown.isVisible();
        console.log(`   Dropdown visible after click: ${dropdownAfterClick}`);

      }
    } else {
      console.log('❌ Dropdown NOT visible!');

      // Check if it exists in DOM but hidden
      if (await dropdown.count() > 0) {
        console.log('   Dropdown exists in DOM but is hidden');

        // Get computed styles
        const styles = await dropdown.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            zIndex: computed.zIndex
          };
        });

        console.log('   Dropdown styles:', styles);
      } else {
        console.log('   Dropdown does not exist in DOM at all');
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'dropdown-test-result.png' });
    console.log('\n📸 Screenshot saved: dropdown-test-result.png');

    console.log('\n=== TEST COMPLETE ===');
    console.log('Keeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    await browser.close();
  }
}

testDropdownClick();