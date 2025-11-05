import { chromium } from 'playwright';

async function testTownCards() {
  console.log('Testing town card display...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Clear cache and navigate
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    await page.goto('http://localhost:5173/towns');
    await page.waitForLoadState('networkidle');

    // Wait for town cards to load
    await page.waitForTimeout(5000);

    // Scroll down to see town cards
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(2000);

    // Get town card content
    const townCards = await page.evaluate(() => {
      // Look for actual town cards
      const cards = document.querySelectorAll('[class*="rounded"]');
      const townData = [];

      cards.forEach(card => {
        const h3 = card.querySelector('h3');
        const h4 = card.querySelector('h4');
        const p = card.querySelector('p');

        if (h3 || h4) {
          townData.push({
            heading: h3?.textContent || h4?.textContent || 'No heading',
            description: p?.textContent || 'No description',
            hasImage: !!card.querySelector('img')
          });
        }
      });

      return townData;
    });

    console.log('Town cards found:');
    if (townCards.length > 0) {
      townCards.forEach((card, i) => {
        console.log(`\nCard ${i+1}:`);
        console.log(`  Heading: ${card.heading}`);
        console.log(`  Has image: ${card.hasImage}`);
        if (card.description) {
          console.log(`  Description: ${card.description.substring(0, 50)}...`);
        }
      });

      // Check if town names are present
      const hasTownNames = townCards.some(card =>
        card.heading &&
        !card.heading.includes('Personalized') &&
        !card.heading.includes('Compare') &&
        !card.heading.includes('Connect') &&
        card.heading.length > 2
      );

      if (hasTownNames) {
        console.log('\n✅ SUCCESS: Town names are being displayed!');
      } else {
        console.log('\n❌ ISSUE: No actual town names found, only feature cards');
      }
    } else {
      console.log('  ❌ No town cards found!');
    }

    // Take screenshot
    await page.screenshot({ path: 'town-cards-test.png', fullPage: true });
    console.log('\nFull page screenshot saved as town-cards-test.png');

    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to exit.');
    await new Promise(() => {}); // Keep process running

  } catch (error) {
    console.error('Error:', error);
    await browser.close();
  }
}

testTownCards();