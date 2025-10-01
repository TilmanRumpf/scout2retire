import { chromium } from 'playwright';

async function verifyFarmersMarkets() {
  console.log('🚀 Farmers Markets UI Verification - V2\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Navigate directly to a town profile URL (if available) or Discover
    console.log('1️⃣  Navigating to home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/home-page.png', fullPage: false });
    console.log('   📸 Screenshot: /tmp/home-page.png\n');

    // Try to navigate to discover
    console.log('2️⃣  Checking Discover page...');
    await page.goto('http://localhost:5173/discover', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const pageUrl = page.url();
    console.log(`   Current URL: ${pageUrl}`);

    // Check if we need to authenticate
    if (pageUrl.includes('/signin') || pageUrl.includes('/login')) {
      console.log('   ⚠️  Authentication required. Please sign in manually...\n');
      console.log('   Waiting 30 seconds for manual login...');
      await page.waitForTimeout(30000);

      // Try to go to discover again
      await page.goto('http://localhost:5173/discover', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
    }

    // Take screenshot of discover page
    await page.screenshot({ path: '/tmp/discover-authenticated.png', fullPage: false });
    console.log('   📸 Screenshot: /tmp/discover-authenticated.png\n');

    // Cities to test
    const citiesToTest = [
      { name: 'Vienna', country: 'Austria' },
      { name: 'Paris', country: 'France' },
      { name: 'Bangkok', country: 'Thailand' },
      { name: 'Rome', country: 'Italy' }
    ];

    for (let i = 0; i < citiesToTest.length; i++) {
      const city = citiesToTest[i];
      console.log(`${i + 3}️⃣  Testing ${city.name}, ${city.country}...`);

      try {
        // Use search or direct navigation
        // Try clicking on city name
        const cityLocator = page.locator(`text="${city.name}"`).first();

        try {
          await cityLocator.waitFor({ timeout: 5000 });
          await cityLocator.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);

          console.log(`   👆 Clicking ${city.name}...`);
          await cityLocator.click();
          await page.waitForTimeout(3000);

          // Take screenshot
          const filename = `/tmp/${String(i + 3).padStart(2, '0')}-${city.name.toLowerCase()}-profile.png`;
          await page.screenshot({ path: filename, fullPage: true });
          console.log(`   📸 Screenshot: ${filename}`);

          // Check for farmers markets in the page content
          const content = await page.content();
          const hasFarmersMarkets = content.toLowerCase().includes('farmers market');

          if (hasFarmersMarkets) {
            console.log(`   ✅ "Farmers markets" text FOUND!`);

            // Try to extract the exact text
            try {
              const farmersElement = await page.locator('text=/farmers market/i').first().textContent({ timeout: 2000 });
              console.log(`   📝 Text: "${farmersElement}"`);
            } catch (e) {
              // Element not found but text is in page
            }
          } else {
            console.log(`   ❌ "Farmers markets" text NOT FOUND`);
          }

          console.log('');

          // Go back to discover
          await page.goto('http://localhost:5173/discover', { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);

        } catch (error) {
          console.log(`   ⚠️  Could not find or click ${city.name}: ${error.message}`);
          console.log('');
        }

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        console.log('');
      }
    }

    console.log('✨ Verification complete!');
    console.log('\n📁 Check screenshots in /tmp/');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    await page.screenshot({ path: '/tmp/fatal-error.png', fullPage: true });
  } finally {
    console.log('\n⏰ Browser will close in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

verifyFarmersMarkets().catch(console.error);