import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function verifyFarmersMarkets() {
  console.log('🚀 Starting Farmers Markets UI Verification...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to Discover page
    console.log('1️⃣  Navigating to Discover page...');
    await page.goto('http://localhost:5173/discover', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/01-discover-page.png', fullPage: true });
    console.log('   ✅ Screenshot saved: /tmp/01-discover-page.png\n');

    // Cities to test
    const citiesToTest = ['Vienna', 'Paris', 'Bangkok', 'Rome'];

    for (let i = 0; i < citiesToTest.length; i++) {
      const cityName = citiesToTest[i];
      console.log(`${i + 2}️⃣  Testing ${cityName}...`);

      try {
        // Navigate back to discover if not first iteration
        if (i > 0) {
          await page.goto('http://localhost:5173/discover', { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(2000);
        }

        // Find and click the city card
        console.log(`   🔍 Looking for ${cityName}...`);

        // Try multiple selectors to find the city
        const citySelectors = [
          `text="${cityName}"`,
          `text=${cityName}`,
          `h3:has-text("${cityName}")`,
          `div:has-text("${cityName}")`
        ];

        let cityElement = null;
        for (const selector of citySelectors) {
          try {
            cityElement = page.locator(selector).first();
            await cityElement.waitFor({ timeout: 5000 });
            break;
          } catch (e) {
            continue;
          }
        }

        if (!cityElement) {
          console.log(`   ⚠️  Could not find ${cityName} on the page`);
          continue;
        }

        await cityElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        console.log(`   👆 Clicking ${cityName}...`);
        await cityElement.click();
        await page.waitForTimeout(4000);

        // Take screenshot of the town profile
        const screenshotNum = String(i + 2).padStart(2, '0');
        await page.screenshot({ path: `/tmp/${screenshotNum}-${cityName.toLowerCase()}-profile.png`, fullPage: true });
        console.log(`   📸 Screenshot saved: /tmp/${screenshotNum}-${cityName.toLowerCase()}-profile.png`);

        // Check if farmers markets text is present
        const pageContent = await page.content();
        const hasFarmersMarkets = pageContent.toLowerCase().includes('farmers market');

        if (hasFarmersMarkets) {
          console.log(`   ✅ "Farmers markets" text FOUND in ${cityName} profile!`);
        } else {
          console.log(`   ❌ "Farmers markets" text NOT FOUND in ${cityName} profile`);
        }

        // Try to find the exact text element
        try {
          const farmersMarketsElement = page.locator('text=/Farmers markets:/i').first();
          const isVisible = await farmersMarketsElement.isVisible({ timeout: 2000 });
          if (isVisible) {
            const farmersText = await farmersMarketsElement.textContent();
            console.log(`   📝 Found element: "${farmersText}"`);
          }
        } catch (e) {
          console.log(`   ℹ️  Could not locate specific farmers markets element`);
        }

        console.log('');

      } catch (error) {
        console.error(`   ❌ Error testing ${cityName}:`, error.message);
        await page.screenshot({ path: `/tmp/error-${cityName.toLowerCase()}.png`, fullPage: true });
        console.log('');
      }
    }

    console.log('✨ Verification complete! Check screenshots in /tmp/');
    console.log('📁 Screenshots:');
    console.log('   - /tmp/01-discover-page.png');
    console.log('   - /tmp/02-vienna-profile.png');
    console.log('   - /tmp/03-paris-profile.png');
    console.log('   - /tmp/04-bangkok-profile.png');
    console.log('   - /tmp/05-rome-profile.png');

  } catch (error) {
    console.error('💥 Error during verification:', error);
    await page.screenshot({ path: '/tmp/error-general.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

verifyFarmersMarkets().catch(console.error);