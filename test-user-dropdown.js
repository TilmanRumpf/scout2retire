#!/usr/bin/env node

/**
 * TEST USER DROPDOWN IN ALGORITHM MANAGER
 *
 * Direct test to figure out why the dropdown isn't showing
 */

import { chromium } from 'playwright';
import fs from 'fs';

async function testUserDropdown() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500  // Slow down to see what's happening
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to Algorithm Manager...');
    await page.goto('http://localhost:5173/admin/algorithm');

    // Wait a bit to see if we need to login
    await page.waitForTimeout(2000);

    // Check if we're on the Algorithm Manager page
    const url = page.url();
    console.log('   Current URL:', url);

    if (!url.includes('/admin/algorithm')) {
      console.log('\n⚠️  NOT ON ALGORITHM MANAGER PAGE');
      console.log('   Please navigate manually to: http://localhost:5173/admin/algorithm');
      console.log('   Waiting 30 seconds for you to navigate...\n');

      await page.waitForTimeout(30000);
    }

    console.log('\n2. Looking for user search input...');

    // Find the user search input - it should have placeholder "Type user email or name..."
    const userInput = await page.locator('input[placeholder="Type user email or name..."]');

    if (await userInput.count() === 0) {
      console.log('❌ Could not find user search input!');
      await page.screenshot({ path: 'no-input-found.png' });
      return;
    }

    console.log('✅ Found user search input');

    // Click on it to focus
    console.log('\n3. Clicking on user search input...');
    await userInput.click();
    await page.waitForTimeout(500);

    // Type "tobias" slowly
    console.log('4. Typing "tobias"...');
    await userInput.type('tobias', { delay: 200 });
    await page.waitForTimeout(1000);

    // Take screenshot after typing
    await page.screenshot({ path: 'after-typing-tobias.png' });
    console.log('   Screenshot saved: after-typing-tobias.png');

    // Check DOM for dropdown
    console.log('\n5. Checking DOM for dropdown...');

    // Look for dropdown - it should be a div with buttons containing emails
    const dropdown = await page.locator('div.absolute.z-10.w-full.mt-1.bg-white');
    const dropdownCount = await dropdown.count();

    console.log(`   Dropdown elements found: ${dropdownCount}`);

    if (dropdownCount > 0) {
      console.log('✅ Dropdown EXISTS in DOM');

      // Check if it's visible
      const isVisible = await dropdown.isVisible();
      console.log(`   Dropdown visible: ${isVisible}`);

      // Get all user buttons in the dropdown
      const userButtons = await dropdown.locator('button').all();
      console.log(`   User buttons in dropdown: ${userButtons.length}`);

      for (let i = 0; i < userButtons.length; i++) {
        const text = await userButtons[i].textContent();
        console.log(`   - User ${i + 1}: ${text.trim()}`);
      }
    } else {
      console.log('❌ NO DROPDOWN IN DOM');
    }

    // Check React state using browser console
    console.log('\n6. Checking React state...');

    const reactState = await page.evaluate(() => {
      // Try to find React fiber
      const findReactFiber = (element) => {
        const keys = Object.keys(element);
        const fiberKey = keys.find(key => key.startsWith('__reactFiber'));
        return element[fiberKey];
      };

      // Find the input element
      const input = document.querySelector('input[placeholder="Type user email or name..."]');
      if (!input) return { error: 'Could not find input' };

      // Try to get React component state
      try {
        const fiber = findReactFiber(input);
        if (!fiber) return { error: 'Could not find React fiber' };

        // Walk up to find the component with state
        let current = fiber;
        while (current) {
          if (current.memoizedState && current.memoizedState.element) {
            break;
          }
          current = current.return;
        }

        return {
          inputValue: input.value,
          // Can't easily access hooks state from here
          message: 'Input found, value captured'
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log('   React state check:', reactState);

    // Check console logs
    console.log('\n7. Checking browser console logs...');

    // Listen for console messages
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('[User Filter]') || msg.text().includes('dropdown')) {
        consoleLogs.push(msg.text());
      }
    });

    // Clear input and type again to trigger logs
    await userInput.clear();
    await page.waitForTimeout(500);
    await userInput.type('tobias', { delay: 100 });
    await page.waitForTimeout(1000);

    console.log('   Relevant console logs:');
    consoleLogs.forEach(log => console.log(`   - ${log}`));

    // Final check - try direct DOM manipulation
    console.log('\n8. Trying direct DOM manipulation...');

    await page.evaluate(() => {
      // Find all divs that might be dropdown containers
      const allDivs = document.querySelectorAll('div');
      let foundDropdown = false;

      allDivs.forEach(div => {
        // Check if this looks like a dropdown (has user emails)
        const text = div.textContent || '';
        if (text.includes('tobias') && text.includes('@')) {
          console.log('Found div with tobias:', {
            className: div.className,
            visible: div.offsetParent !== null,
            display: window.getComputedStyle(div).display,
            visibility: window.getComputedStyle(div).visibility,
            opacity: window.getComputedStyle(div).opacity,
            zIndex: window.getComputedStyle(div).zIndex
          });
          foundDropdown = true;
        }
      });

      if (!foundDropdown) {
        console.log('No dropdown div found with tobias users');
      }
    });

    console.log('\n9. Final screenshot...');
    await page.screenshot({ path: 'final-state.png', fullPage: true });
    console.log('   Screenshot saved: final-state.png');

    console.log('\n=== TEST COMPLETE ===');
    console.log('Check the screenshots to see what happened');

    // Keep browser open for manual inspection
    console.log('\nKeeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    await browser.close();
  }
}

testUserDropdown();