import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Monitor console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    };
    consoleLogs.push(logEntry);
    console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
  });

  // Monitor page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  console.log('1. Navigating to Algorithm Manager...');
  await page.goto('http://localhost:5173/admin/algorithm');
  await page.waitForLoadState('networkidle');

  console.log('2. Taking initial screenshot...');
  await page.screenshot({ path: '/Users/tilmanrumpf/Desktop/scout2retire/screenshot-initial.png', fullPage: true });

  // Check if we got redirected (not logged in or not authorized)
  const currentUrl = page.url();
  console.log(`   Current URL: ${currentUrl}`);

  if (currentUrl !== 'http://localhost:5173/admin/algorithm') {
    console.log('\n⚠️  NOT LOGGED IN - PLEASE LOG IN NOW ⚠️');
    console.log('=========================================');
    console.log('The browser window is open - please:');
    console.log('1. Click "Log In" button');
    console.log('2. Log in with executive admin credentials');
    console.log('3. Wait for this script to continue...');
    console.log('=========================================\n');
    console.log('Waiting 60 seconds for you to log in...\n');

    await page.waitForTimeout(60000);

    // Try navigating again
    console.log('   Attempting to navigate to Algorithm Manager...');
    await page.goto('http://localhost:5173/admin/algorithm');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const newUrl = page.url();
    console.log(`   Current URL after login: ${newUrl}`);

    if (newUrl !== 'http://localhost:5173/admin/algorithm') {
      console.log('❌ Still not on Algorithm Manager page. Exiting.');
      console.log('   Make sure you logged in as an EXECUTIVE ADMIN');
      await browser.close();
      return;
    }

    console.log('✅ Successfully on Algorithm Manager page!\n');
    await page.screenshot({ path: '/Users/tilmanrumpf/Desktop/scout2retire/screenshot-after-login.png', fullPage: true });
  }

  console.log('3. Waiting for Live Algorithm Testing section to be visible...');

  // Wait for the testing section heading to be visible
  try {
    await page.waitForSelector('text=Live Algorithm Testing', { timeout: 5000 });
    console.log('   ✅ Testing section is visible');
  } catch (e) {
    console.log('   ⚠️ Testing section heading not found, but continuing...');
  }

  // Wait a bit for React to render
  await page.waitForTimeout(1000);

  console.log('4. Looking for user search input...');

  // The input should be the second text input on the page based on the JSX
  // Line 777-792 in AlgorithmManager.jsx shows the user input
  const allTextInputs = await page.$$('input[type="text"]');
  console.log(`   Found ${allTextInputs.length} text inputs on the page`);

  // Log all inputs to identify them
  for (let i = 0; i < allTextInputs.length; i++) {
    const placeholder = await allTextInputs[i].getAttribute('placeholder');
    const className = await allTextInputs[i].getAttribute('class');
    console.log(`   Input ${i}: placeholder="${placeholder}"`);
  }

  // Try to find by placeholder text
  let userInput = null;
  for (const input of allTextInputs) {
    const placeholder = await input.getAttribute('placeholder');
    if (placeholder && placeholder.toLowerCase().includes('email')) {
      userInput = input;
      console.log(`   ✅ Found user input by placeholder: "${placeholder}"`);
      break;
    }
  }

  if (!userInput && allTextInputs.length >= 2) {
    // Fallback: assume second input is user input based on JSX structure
    userInput = allTextInputs[1];
    console.log('   ⚠️ Using second input as fallback');
  }

  if (!userInput) {
    console.log('ERROR: Could not find user search input field!');
    await page.screenshot({ path: '/Users/tilmanrumpf/Desktop/scout2retire/screenshot-error-no-input.png', fullPage: true });
    await browser.close();
    return;
  }

  console.log('5. Found user input field');
  console.log('6. Clicking on input field...');
  await userInput.click();
  await page.waitForTimeout(500);

  console.log('7. Typing "tobias" slowly...');
  await userInput.type('tobias', { delay: 100 });
  await page.waitForTimeout(1000);

  console.log('8. Taking screenshot after typing...');
  await page.screenshot({ path: '/Users/tilmanrumpf/Desktop/scout2retire/screenshot-after-typing.png', fullPage: true });

  console.log('9. Checking dropdown state via JavaScript...');
  const dropdownInfo = await page.evaluate(() => {
    const results = {
      dropdownElements: [],
      inputValues: [],
      allDivs: [],
      absoluteElements: []
    };

    // Find all text inputs
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach((input, i) => {
      results.inputValues.push({
        index: i,
        value: input.value,
        placeholder: input.placeholder
      });
    });

    // Find all potential dropdown elements (based on JSX: absolute z-10)
    const absoluteEls = document.querySelectorAll('.absolute.z-10');
    absoluteEls.forEach((el, i) => {
      const styles = window.getComputedStyle(el);
      results.absoluteElements.push({
        index: i,
        tagName: el.tagName,
        className: el.className,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
        innerHTML: el.innerHTML.substring(0, 300),
        childCount: el.children.length,
        hasChildren: el.children.length > 0
      });
    });

    // Also look for divs with bg-white border that might be dropdowns
    const whiteDivs = document.querySelectorAll('div.bg-white.border');
    whiteDivs.forEach((el, i) => {
      const styles = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentClasses = parent?.className || 'no-parent';

      results.allDivs.push({
        index: i,
        className: el.className,
        parentClasses: parentClasses,
        display: styles.display,
        visibility: styles.visibility,
        position: styles.position,
        innerHTML: el.innerHTML.substring(0, 200),
        childCount: el.children.length
      });
    });

    return results;
  });

  console.log('10. Dropdown state:', JSON.stringify(dropdownInfo, null, 2));

  console.log('11. Waiting to see if dropdown appears...');
  // Wait a bit more to see if dropdown appears
  await page.waitForTimeout(2000);

  console.log('12. Taking final screenshot...');
  await page.screenshot({ path: '/Users/tilmanrumpf/Desktop/scout2retire/screenshot-final.png', fullPage: true });

  console.log('13. Browser console logs collected:', consoleLogs.length);

  console.log('\n=== SUMMARY ===');
  console.log(`User input found: ${!!userInput}`);
  console.log(`Input values after typing:`, dropdownInfo.inputValues);
  console.log(`Absolute positioned elements (potential dropdowns): ${dropdownInfo.absoluteElements.length}`);
  console.log(`White bordered divs (potential dropdowns): ${dropdownInfo.allDivs.length}`);

  if (dropdownInfo.absoluteElements.length > 0) {
    console.log('\n🔍 Absolute elements (z-10):');
    dropdownInfo.absoluteElements.forEach(el => {
      console.log(`  ${el.index}: ${el.tagName} display=${el.display}, children=${el.childCount}, visible=${el.visibility}`);
      console.log(`     First 100 chars: ${el.innerHTML.substring(0, 100)}`);
    });
  } else {
    console.log('\n❌ NO ABSOLUTE POSITIONED ELEMENTS FOUND (dropdown should be .absolute.z-10)');
  }

  if (dropdownInfo.allDivs.length > 0) {
    console.log('\n🔍 White bordered divs:');
    dropdownInfo.allDivs.forEach(div => {
      console.log(`  ${div.index}: display=${div.display}, children=${div.childCount}`);
    });
  }

  console.log('\nScreenshots saved:');
  console.log('  - screenshot-initial.png');
  console.log('  - screenshot-after-typing.png');
  console.log('  - screenshot-final.png');

  // Keep browser open for manual inspection
  console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
})();
