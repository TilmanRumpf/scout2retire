import { chromium } from 'playwright';

async function testResponsiveDropdown() {
  const browser = await chromium.launch({ headless: false });
  
  const tests = [
    { name: 'iPhone 14', width: 393, height: 852 },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
    { name: 'Desktop', width: 1280, height: 720 }
  ];

  for (const test of tests) {
    console.log(`\n=== Testing ${test.name} (${test.width}x${test.height}) ===`);
    
    const page = await browser.newPage();
    await page.setViewportSize({ width: test.width, height: test.height });
    
    try {
      console.log('Starting onboarding flow...');
      
      // Go to the welcome page
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      
      // Take screenshot of welcome page
      await page.screenshot({ 
        path: `dropdown-${test.name.toLowerCase().replace(' ', '-')}-welcome.png`,
        fullPage: true 
      });
      
      // Click "Get Started" button to begin onboarding
      console.log('Clicking Get Started button...');
      const getStartedButton = page.locator('button:has-text("Get Started")');
      if (await getStartedButton.count() > 0) {
        await getStartedButton.click();
        await page.waitForTimeout(2000);
      } else {
        console.log('Get Started button not found, trying alternative navigation...');
        // Try clicking any signup/start related buttons
        const altButtons = page.locator('button, a').filter({ hasText: /start|signup|begin|onboard/i });
        if (await altButtons.count() > 0) {
          await altButtons.first().click();
          await page.waitForTimeout(2000);
        }
      }
      
      // Check current URL after clicking
      let currentUrl = page.url();
      console.log(`After Get Started click, URL: ${currentUrl}`);
      
      // Navigate through onboarding steps to reach current-status
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!currentUrl.includes('/current-status') && attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts}: Looking for way to reach current-status page...`);
        
        // If we're on a form page, try to skip or continue
        const skipButton = page.locator('button:has-text("Skip")');
        const nextButton = page.locator('button:has-text("Next")');
        const continueButton = page.locator('button:has-text("Continue")');
        
        if (await skipButton.count() > 0) {
          console.log('Found Skip button, clicking...');
          await skipButton.first().click();
          await page.waitForTimeout(1500);
        } else if (await nextButton.count() > 0) {
          console.log('Found Next button, clicking...');
          await nextButton.first().click();
          await page.waitForTimeout(1500);
        } else if (await continueButton.count() > 0) {
          console.log('Found Continue button, clicking...');
          await continueButton.first().click();
          await page.waitForTimeout(1500);
        } else {
          // Try direct navigation
          console.log('No navigation buttons found, trying direct URL...');
          await page.goto('http://localhost:5173/onboarding/current-status', { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
        }
        
        currentUrl = page.url();
        console.log(`Current URL after step ${attempts}: ${currentUrl}`);
        
        // If we end up on welcome again, we might need to restart
        if (currentUrl.includes('/welcome') || currentUrl === 'http://localhost:5173/') {
          console.log('Back on welcome page, restarting onboarding flow...');
          const getStartedAgain = page.locator('button:has-text("Get Started")');
          if (await getStartedAgain.count() > 0) {
            await getStartedAgain.click();
            await page.waitForTimeout(2000);
          }
        }
      }
      
      if (!currentUrl.includes('/current-status')) {
        console.log(`Could not reach current-status page after ${attempts} attempts. Final URL: ${currentUrl}`);
        await page.screenshot({ 
          path: `dropdown-${test.name.toLowerCase().replace(' ', '-')}-navigation-failed.png`,
          fullPage: true 
        });
        continue; // Skip this test iteration
      }
      
      console.log('Successfully reached current-status page!');
      
      // Wait for the page to load completely
      await page.waitForTimeout(3000);
      
      // Take initial screenshot
      await page.screenshot({ 
        path: `dropdown-${test.name.toLowerCase().replace(' ', '-')}-initial.png`,
        fullPage: true 
      });
      
      // Wait for page to fully load including components
      await page.waitForTimeout(3000);
      
      // Look for citizenship dropdown button (CustomDropdown component)
      const citizenshipSelectors = [
        'button:has-text("United States")',
        'button:has-text("Select citizenship")',
        'text=United States >> xpath=..',
        'text=You >> xpath=.. >> button',
        '[role="button"]:has-text("United States")'
      ];
      
      let citizenshipDropdown = null;
      let foundSelector = '';
      
      for (const selector of citizenshipSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            citizenshipDropdown = element.first();
            foundSelector = selector;
            console.log(`Found citizenship dropdown with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      // If no obvious citizenship dropdown found, look for any CustomDropdown component
      if (!citizenshipDropdown) {
        console.log('No citizenship dropdown found, checking for CustomDropdown buttons...');
        const allButtons = page.locator('button[type="button"]');
        const buttonCount = await allButtons.count();
        console.log(`Found ${buttonCount} buttons on page`);
        
        for (let i = 0; i < buttonCount; i++) {
          const button = allButtons.nth(i);
          const text = await button.textContent();
          console.log(`Button ${i + 1}: "${text}"`);
          
          // Check if this might be a citizenship dropdown
          if (text && (text.includes('United States') || text.includes('Select citizenship') || text.includes('America'))) {
            citizenshipDropdown = button;
            foundSelector = `button containing "${text}"`;
            console.log(`Found citizenship dropdown at button ${i + 1}: ${text}`);
            break;
          }
        }
      }
      
      if (citizenshipDropdown) {
        // Get the button's current text content and check for truncation
        const buttonText = await citizenshipDropdown.textContent();
        console.log(`Button text before click: "${buttonText}"`);
        
        // Check for truncation in the button text (ellipsis or cut-off)
        const isButtonTextTruncated = buttonText && (buttonText.includes('...') || buttonText.includes('…'));
        console.log(`Button text truncated: ${isButtonTextTruncated}`);
        
        // Get button's bounding box before opening dropdown
        const buttonBox = await citizenshipDropdown.boundingBox();
        console.log(`Button width: ${buttonBox.width}px`);
        console.log(`Viewport width: ${test.width}px`);
        console.log(`Button width percentage: ${(buttonBox.width / test.width * 100).toFixed(1)}%`);
        
        // Click on the dropdown to open it
        await citizenshipDropdown.click();
        await page.waitForTimeout(1000);
        
        // Check if dropdown opened (look for mobile or desktop dropdown)
        let dropdownOpened = false;
        let dropdownType = '';
        
        // Mobile dropdown (bottom sheet)
        const mobileDropdown = page.locator('.sm\\:hidden.fixed.left-0.right-0.bottom-0');
        if (await mobileDropdown.count() > 0) {
          dropdownOpened = true;
          dropdownType = 'mobile';
          console.log('Mobile dropdown (bottom sheet) opened');
          
          // Check if it's full-width
          const mobileBox = await mobileDropdown.boundingBox();
          console.log(`Mobile dropdown width: ${mobileBox.width}px (should be full viewport width)`);
          console.log(`Mobile dropdown is full-width: ${mobileBox.width >= test.width * 0.95}`);
        }
        
        // Desktop dropdown
        const desktopDropdown = page.locator('.hidden.sm\\:block.absolute');
        if (await desktopDropdown.count() > 0) {
          dropdownOpened = true;
          dropdownType = 'desktop';
          console.log('Desktop dropdown opened');
          
          // Check desktop dropdown width
          const desktopBox = await desktopDropdown.boundingBox();
          console.log(`Desktop dropdown width: ${desktopBox.width}px`);
          console.log(`Desktop dropdown width percentage: ${(desktopBox.width / test.width * 100).toFixed(1)}%`);
          
          // Desktop should NOT be full-width
          const isNarrow = (desktopBox.width / test.width) < 0.8;
          console.log(`Desktop dropdown is appropriately narrow: ${isNarrow}`);
        }
        
        // Take screenshot with dropdown open
        await page.screenshot({ 
          path: `dropdown-${test.name.toLowerCase().replace(' ', '-')}-open.png`,
          fullPage: true 
        });
        
        if (!dropdownOpened) {
          console.log('Warning: Dropdown did not appear to open after clicking');
        }
        
        // Look for "United States" option in the dropdown
        const usOption = page.locator('text="United States"');
        const usOptionCount = await usOption.count();
        console.log(`Found ${usOptionCount} "United States" options`);
        
        if (usOptionCount > 0) {
          // Check if any US option text is truncated
          for (let i = 0; i < usOptionCount; i++) {
            const optionText = await usOption.nth(i).textContent();
            const isOptionTruncated = optionText && (optionText.includes('...') || optionText.includes('…') || !optionText.includes('America'));
            console.log(`US option ${i + 1}: "${optionText}" - truncated: ${isOptionTruncated}`);
          }
        }
        
        // Close dropdown by clicking outside
        await page.click('body');
        await page.waitForTimeout(500);
        
      } else {
        console.log('Could not find citizenship dropdown on this page');
        
        // Debug: show all buttons
        const allButtons = await page.locator('button').all();
        console.log(`\nAll buttons found (${allButtons.length}):`);
        for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
          const button = allButtons[i];
          const text = await button.textContent();
          const type = await button.getAttribute('type') || 'no-type';
          console.log(`${i + 1}. Button: "${text}" type="${type}"`);
        }
      }
      
    } catch (error) {
      console.error(`Error testing ${test.name}:`, error.message);
      await page.screenshot({ 
        path: `dropdown-${test.name.toLowerCase().replace(' ', '-')}-error.png`,
        fullPage: true 
      });
    }
    
    await page.close();
  }
  
  await browser.close();
}

// Run the test
testResponsiveDropdown().catch(console.error);