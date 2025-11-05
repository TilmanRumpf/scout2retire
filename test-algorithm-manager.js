import { chromium } from 'playwright';

async function testAlgorithmManager() {
  console.log('Testing Algorithm Manager inline percentages...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to Algorithm Manager
    await page.goto('http://localhost:5173/admin/algorithm');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Expand the testing section if collapsed
    const testingButton = await page.$('button:has-text("Live Algorithm Testing")');
    if (testingButton) {
      await testingButton.click();
      await page.waitForTimeout(1000);
    }

    // Select a town (Valencia, Spain)
    const townInput = await page.$('input[placeholder="Type town name..."]');
    if (townInput) {
      await townInput.fill('Valencia');
      await page.waitForTimeout(1000);

      // Click on Valencia from dropdown
      const valenciaOption = await page.$('button:has-text("Valencia, Spain")');
      if (valenciaOption) {
        await valenciaOption.click();
        await page.waitForTimeout(500);
      }
    }

    // Select a user
    const userInput = await page.$('input[placeholder="Type user email or name..."]');
    if (userInput) {
      await userInput.click();
      await page.waitForTimeout(500);

      // Select first available user
      const firstUser = await page.$('.absolute.z-10 button');
      if (firstUser) {
        await firstUser.click();
        await page.waitForTimeout(500);
      }
    }

    // Click Test Scoring button
    const testButton = await page.$('button:has-text("Test Scoring")');
    if (testButton) {
      console.log('Running test scoring...');
      await testButton.click();
      await page.waitForTimeout(3000); // Wait for scoring to complete
    }

    // Scroll down to see the scoring sections
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);

    // Check for inline percentages
    const sections = [
      'Region Scoring Settings',
      'Climate Scoring Settings',
      'Culture Scoring Settings',
      'Hobbies Scoring Settings',
      'Administration Scoring Settings',
      'Budget Scoring Settings'
    ];

    console.log('\nChecking for inline percentages:');
    for (const section of sections) {
      const sectionHeader = await page.$(`h2:has-text("${section}")`);
      if (sectionHeader) {
        const headerText = await sectionHeader.textContent();
        if (headerText.includes('%')) {
          console.log(`✅ ${section}: Found percentage in header`);
        } else {
          console.log(`❌ ${section}: No percentage found`);
        }
      } else {
        console.log(`⚠️ ${section}: Section not found`);
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'algorithm-manager-test.png', fullPage: false });
    console.log('\nScreenshot saved as algorithm-manager-test.png');

    // Scroll more to see all sections
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);

    // Take another screenshot
    await page.screenshot({ path: 'algorithm-manager-test2.png', fullPage: false });
    console.log('Second screenshot saved as algorithm-manager-test2.png');

    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to exit.');
    await new Promise(() => {}); // Keep process running

  } catch (error) {
    console.error('Error:', error);
    await browser.close();
  }
}

testAlgorithmManager();