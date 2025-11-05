import { chromium } from 'playwright';

async function testInlinePercentages() {
  console.log('Testing inline match percentages in Algorithm Manager...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate directly to Algorithm Manager (assuming you're already logged in)
    console.log('1. Navigating to Algorithm Manager...');
    await page.goto('http://localhost:5173/admin/algorithm');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check if we're on the Algorithm Manager page
    const pageTitle = await page.$('h1:has-text("Algorithm Manager")');
    if (!pageTitle) {
      console.log('❌ Not on Algorithm Manager page - may need to log in first');
      await browser.close();
      return;
    }
    console.log('✅ On Algorithm Manager page');

    // Check if Live Testing section is expanded
    const testingSection = await page.$('text="Live Algorithm Testing"');
    if (testingSection) {
      const isExpanded = await page.$('[class*="rotate-180"]');
      if (!isExpanded) {
        console.log('2. Expanding Live Algorithm Testing section...');
        await testingSection.click();
        await page.waitForTimeout(500);
      }
    }

    // Check if town and user are already selected
    const townValue = await page.$eval('input[placeholder="Type town name..."]', el => el.value).catch(() => '');
    const userValue = await page.$eval('input[placeholder="Type user email or name..."]', el => el.value).catch(() => '');

    console.log(`3. Current selections:`);
    console.log(`   Town: ${townValue || 'None'}`);
    console.log(`   User: ${userValue || 'None'}`);

    // Wait a moment for auto-calculation if both are selected
    if (townValue && userValue) {
      console.log('4. Both town and user selected - waiting for auto-calculation...');
      await page.waitForTimeout(3000);
    } else {
      console.log('4. Need to select town and/or user for testing');
    }

    // Scroll down to scoring sections
    console.log('5. Scrolling to scoring sections...');
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);

    // Check for percentages in section headers
    console.log('\n6. Checking for inline percentages:\n');

    const sections = [
      'Region Scoring Settings',
      'Climate Scoring Settings',
      'Culture Scoring Settings',
      'Hobbies Scoring Settings',
      'Administration Scoring Settings',
      'Budget Scoring Settings'
    ];

    for (const sectionName of sections) {
      // Find the section by looking for its container div
      const sectionDiv = await page.$(`div:has(> div > h2:has-text("${sectionName}"))`);

      if (sectionDiv) {
        // Get the header content including any percentage
        const headerContent = await sectionDiv.$eval('h2', el => el.textContent.trim());

        // Check if there's a percentage span
        const hasPercentage = await sectionDiv.$('h2 span:has-text("%")');

        if (hasPercentage) {
          const percentage = await hasPercentage.textContent();
          console.log(`✅ ${sectionName}: ${percentage}`);
        } else {
          console.log(`❌ ${sectionName}: No percentage displayed`);
        }
      } else {
        console.log(`⚠️ ${sectionName}: Section not found`);
      }
    }

    // Check if testResults exists in React DevTools (if available)
    console.log('\n7. Checking for test results...');
    const hasResults = await page.evaluate(() => {
      // Check if any percentage is visible
      const percentageElements = document.querySelectorAll('span:has-text("%")');
      return percentageElements.length > 0;
    });

    if (hasResults) {
      console.log('✅ Some percentages are displayed');
    } else {
      console.log('❌ No percentages found - test may not have run');
      console.log('\nTroubleshooting:');
      console.log('- Ensure both a town AND user are selected');
      console.log('- Check browser console for errors');
      console.log('- Verify auto-calculation is triggering');
    }

    // Take screenshot
    await page.screenshot({ path: 'algorithm-percentages.png' });
    console.log('\n📸 Screenshot saved as algorithm-percentages.png');

    // Keep browser open
    console.log('\n🔍 Browser will remain open for manual inspection.');
    console.log('Check the browser console for any errors.');
    console.log('Press Ctrl+C to exit.');
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
  }
}

testInlinePercentages();