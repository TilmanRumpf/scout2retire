import { chromium } from 'playwright';

async function testAlgorithmInlineScores() {
  console.log('Testing Algorithm Manager inline match percentages...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // First, go to the home page
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // Check if we need to login
    const loginButton = await page.$('button:has-text("Log In")');
    if (loginButton) {
      console.log('Need to log in first...');
      await loginButton.click();
      await page.waitForTimeout(1000);

      // Fill in login credentials (you'll need to provide admin credentials)
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');

      if (emailInput && passwordInput) {
        // Replace with actual admin credentials
        await emailInput.fill('tilmanrumpf@gmail.com');
        await passwordInput.fill('password123'); // Replace with actual password

        const submitButton = await page.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    // Now navigate directly to Algorithm Manager
    console.log('Navigating to Algorithm Manager...');
    await page.goto('http://localhost:5173/admin/algorithm');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if we're on the Algorithm Manager page
    const pageTitle = await page.$('h1:has-text("Algorithm Manager")');
    if (!pageTitle) {
      console.log('⚠️ Not on Algorithm Manager page. May need executive admin access.');

      // Take screenshot to see what page we're on
      await page.screenshot({ path: 'algorithm-access-issue.png' });
      console.log('Screenshot saved as algorithm-access-issue.png');
    } else {
      console.log('✅ Successfully reached Algorithm Manager page');

      // Expand the testing section if collapsed
      const testingButton = await page.$('button:has-text("Live Algorithm Testing")');
      if (testingButton) {
        console.log('Expanding Live Algorithm Testing section...');
        await testingButton.click();
        await page.waitForTimeout(1000);
      }

      // Select a town
      console.log('Selecting a test town...');
      const townInput = await page.$('input[placeholder="Type town name..."]');
      if (townInput) {
        await townInput.fill('Valencia');
        await page.waitForTimeout(1500);

        // Click on Valencia from dropdown
        const valenciaOption = await page.$('button:has-text("Valencia, Spain")');
        if (valenciaOption) {
          await valenciaOption.click();
          await page.waitForTimeout(500);
          console.log('✅ Selected Valencia, Spain');
        }
      }

      // Select a user
      console.log('Selecting a test user...');
      const userInput = await page.$('input[placeholder="Type user email or name..."]');
      if (userInput) {
        await userInput.click();
        await page.waitForTimeout(500);

        // Select first available user
        const firstUser = await page.$$('.absolute.z-10 button');
        if (firstUser && firstUser.length > 0) {
          await firstUser[0].click();
          await page.waitForTimeout(500);
          console.log('✅ Selected a test user');
        }
      }

      // Click Test Scoring button
      const testButton = await page.$('button:has-text("Test Scoring")');
      if (testButton) {
        console.log('Running test scoring...');
        await testButton.click();
        await page.waitForTimeout(4000); // Wait for scoring to complete
      }

      // Scroll down to see the scoring sections
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(1000);

      // Check for inline percentages
      console.log('\n🔍 Checking for inline match percentages:\n');

      // Get all h2 headers and check for percentages
      const headers = await page.$$eval('h2', headers =>
        headers.map(h => ({
          text: h.textContent.trim(),
          hasPercentage: h.textContent.includes('%')
        }))
      );

      const scoringSections = headers.filter(h => h.text.includes('Scoring Settings'));

      if (scoringSections.length > 0) {
        scoringSections.forEach(section => {
          if (section.hasPercentage) {
            console.log(`✅ ${section.text}`);
          } else {
            console.log(`❌ ${section.text.split(/\s+/).slice(0, 3).join(' ')} - No percentage displayed`);
          }
        });
      } else {
        console.log('❌ No scoring sections found');
      }

      // Take screenshots
      await page.screenshot({ path: 'algorithm-inline-scores1.png', fullPage: false });
      console.log('\nScreenshot 1 saved as algorithm-inline-scores1.png');

      // Scroll more to see all sections
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'algorithm-inline-scores2.png', fullPage: false });
      console.log('Screenshot 2 saved as algorithm-inline-scores2.png');
    }

    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will remain open for manual inspection.');
    console.log('Please check the inline percentages next to each section header.');
    console.log('Press Ctrl+C to exit.');
    await new Promise(() => {}); // Keep process running

  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
  }
}

testAlgorithmInlineScores();