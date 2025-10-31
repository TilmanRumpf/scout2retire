import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to localhost:5173...');
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(2000);

    console.log('2. Looking for login button...');
    const loginButton = page.locator('button:has-text("Log In")').first();
    const hasLoginButton = await loginButton.isVisible().catch(() => false);

    if (hasLoginButton) {
      console.log('3. Clicking Log In button...');
      await loginButton.click();
      await page.waitForTimeout(1000);

      console.log('4. Filling in credentials...');
      await page.fill('input[type="email"]', 'tilman.rumpf@gmail.com');
      await page.fill('input[type="password"]', 'Schoko2005');

      console.log('5. Submitting login form...');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    } else {
      console.log('3. Already logged in');
    }

    console.log('6. Navigating to Towns Manager...');
    await page.goto('http://localhost:5173/admin/towns');
    await page.waitForTimeout(4000);

    console.log('7. Taking screenshot of Towns Manager...');
    await page.screenshot({ path: 'screenshot-towns-manager.png', fullPage: true });

    console.log('8. Looking for town list items...');
    // Look for divs in the towns list that contain town names
    // Based on the screenshot, I can see town cards with images
    const townListItem = page.locator('div.divide-y > div').first();
    await townListItem.waitFor({ state: 'visible', timeout: 5000 });

    console.log('9. Clicking on first town in list...');
    await townListItem.click();
    await page.waitForTimeout(2000);

    console.log('10. Taking screenshot after clicking town...');
    await page.screenshot({ path: 'screenshot-town-detail-opened.png', fullPage: true });

    console.log('11. Looking for category tabs...');
    // Try clicking on Overview category first
    const overviewTab = page.locator('button').filter({ hasText: 'Overview' }).first();
    const hasOverviewTab = await overviewTab.isVisible().catch(() => false);

    if (hasOverviewTab) {
      console.log('12. Clicking Overview tab...');
      await overviewTab.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'screenshot-after-overview-click.png', fullPage: true });

    console.log('13. Looking for pencil edit icons...');
    // Look for any pencil SVG icon
    const editIcons = page.locator('svg').filter({ has: page.locator('line') });
    const editIconCount = await editIcons.count();
    console.log(`Found ${editIconCount} potential edit icons`);

    if (editIconCount > 0) {
      console.log('14. Clicking first edit icon...');
      await editIcons.first().click();
      await page.waitForTimeout(2000);

      console.log('15. Taking screenshot of modal...');
      await page.screenshot({ path: 'screenshot-modal-opened.png', fullPage: true });

      // Check for the structure
      const step1 = page.locator('text=Step 1').first();
      const step2 = page.locator('text=Step 2').first();
      const step3 = page.locator('text=Step 3').first();

      const hasStep1 = await step1.isVisible().catch(() => false);
      const hasStep2 = await step2.isVisible().catch(() => false);
      const hasStep3 = await step3.isVisible().catch(() => false);

      console.log(`\n=== MODAL STRUCTURE ===`);
      console.log(`Step 1 visible: ${hasStep1}`);
      console.log(`Step 2 visible: ${hasStep2}`);
      console.log(`Step 3 visible: ${hasStep3}`);

      // Check for research buttons - look for buttons containing "Claude" or "Google"
      const allButtons = await page.locator('button').filter({ hasText: /Claude|Google/ }).all();
      console.log(`\n=== RESEARCH BUTTONS ===`);
      console.log(`Found ${allButtons.length} buttons with "Claude" or "Google" text`);

      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`  Button ${i + 1}: "${buttonText.trim()}"`);
      }

      // Check specifically for the two research buttons
      const claudeResearchBtn = page.locator('button').filter({ hasText: 'Claude' }).filter({ hasText: 'Research' });
      const googleResearchBtn = page.locator('button').filter({ hasText: 'Google' }).filter({ hasText: 'Research' });

      const hasClaudeBtn = await claudeResearchBtn.count() > 0;
      const hasGoogleBtn = await googleResearchBtn.count() > 0;

      console.log(`Claude Research button exists: ${hasClaudeBtn}`);
      console.log(`Google Research button exists: ${hasGoogleBtn}`);
      console.log(`Both buttons present (side-by-side): ${hasClaudeBtn && hasGoogleBtn}`);

      if (hasStep3) {
        // Check if Step 3 is collapsible
        const step3Header = page.locator('button').filter({ hasText: 'Step 3: Manage Query Template' }).first();
        const templateSection = page.locator('textarea').filter({ has: page.locator('[placeholder*="query"]') }).or(page.locator('textarea').filter({ has: page.locator('[placeholder*="template"]') }));

        console.log(`\n=== STEP 3 COLLAPSIBLE ===`);

        // Check initial state
        const initiallyVisible = await page.locator('textarea').first().isVisible().catch(() => false);
        console.log(`Step 3 textarea initially visible: ${initiallyVisible}`);

        // Try clicking the Step 3 header
        console.log('16. Clicking Step 3 header to toggle...');
        await step3Header.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'screenshot-step3-toggle1.png', fullPage: true });

        const afterToggle1 = await page.locator('textarea').first().isVisible().catch(() => false);
        console.log(`Step 3 textarea after 1st toggle: ${afterToggle1}`);

        // Toggle again
        console.log('17. Clicking Step 3 header again...');
        await step3Header.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'screenshot-step3-toggle2.png', fullPage: true });

        const afterToggle2 = await page.locator('textarea').first().isVisible().catch(() => false);
        console.log(`Step 3 textarea after 2nd toggle: ${afterToggle2}`);

        console.log(`\n=== COLLAPSIBLE RESULT ===`);
        const isCollapsible = (initiallyVisible !== afterToggle1) && (afterToggle1 !== afterToggle2);
        console.log(`Collapsible feature working: ${isCollapsible}`);

        if (isCollapsible) {
          console.log('✅ Step 3 collapsible functionality is WORKING');
        } else {
          console.log('❌ Step 3 collapsible functionality may NOT be working');
          console.log(`   Initial: ${initiallyVisible}, After 1st: ${afterToggle1}, After 2nd: ${afterToggle2}`);
        }
      } else {
        console.log('⚠️  Step 3 not visible - may require admin permissions');
      }

      console.log('\n=== SUMMARY ===');
      console.log('Screenshots saved:');
      console.log('  - screenshot-towns-manager.png');
      console.log('  - screenshot-town-detail-opened.png');
      console.log('  - screenshot-after-overview-click.png');
      console.log('  - screenshot-modal-opened.png');
      console.log('  - screenshot-step3-toggle1.png');
      console.log('  - screenshot-step3-toggle2.png');
    } else {
      console.log('⚠️  No edit icons found!');
      await page.screenshot({ path: 'screenshot-no-edit-icons.png', fullPage: true });
    }

    // Keep browser open briefly for inspection
    console.log('\nKeeping browser open for 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'screenshot-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
