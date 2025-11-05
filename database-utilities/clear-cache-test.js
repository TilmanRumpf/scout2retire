import { chromium } from 'playwright';

async function clearCacheAndTest() {
  console.log('Testing with cache cleared...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the page
    await page.goto('http://localhost:5173/towns');

    // Clear session storage (where cache is stored)
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Reload the page
    console.log('Cache cleared, reloading page...');
    await page.reload();

    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Check for town names
    const townData = await page.evaluate(() => {
      // Get all h3 elements (where town names are displayed)
      const h3Elements = document.querySelectorAll('h3');
      const townInfo = [];

      h3Elements.forEach(el => {
        const text = el.textContent?.trim();
        townInfo.push({
          text: text || 'EMPTY',
          hasContent: !!text && text.length > 0
        });
      });

      // Also check for any data attributes
      const cards = document.querySelectorAll('[class*="town"]');
      const cardData = [];
      cards.forEach(card => {
        cardData.push({
          innerHTML: card.innerHTML.substring(0, 200),
          textContent: card.textContent?.substring(0, 100)
        });
      });

      return { h3Elements: townInfo, cards: cardData.slice(0, 3) };
    });

    console.log('\nTown name elements found:');
    if (townData.h3Elements.length > 0) {
      townData.h3Elements.forEach((el, i) => {
        console.log(`  ${i+1}. "${el.text}" (has content: ${el.hasContent})`);
      });
    } else {
      console.log('  No h3 elements found!');
    }

    if (townData.cards.length > 0) {
      console.log('\nFirst 3 card elements:');
      townData.cards.forEach((card, i) => {
        console.log(`  Card ${i+1} text: "${card.textContent}"`);
      });
    }

    // Take a screenshot
    await page.screenshot({ path: 'cache-cleared-test.png' });
    console.log('\nScreenshot saved as cache-cleared-test.png');

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

clearCacheAndTest();