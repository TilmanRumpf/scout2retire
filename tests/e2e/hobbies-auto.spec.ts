import { test, expect } from '@playwright/test';

// Your credentials
const EMAIL = 'tilman.rumpf@gmail.com';
const PASSWORD = 'Schoko2005';

test.describe('Hobbies Automated Test', () => {
  test('login and check hobbies display correctly', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`Browser: ${msg.text()}`);
      }
    });

    // AUTOMATIC LOGIN
    console.log('🔐 Logging in as tilman.rumpf@gmail.com...');
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    
    // Click login
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL((url) => !url.toString().includes('/login'), {
      timeout: 10000
    });
    
    console.log('✅ Logged in successfully');
    
    // Navigate to hobbies page
    await page.goto('/onboarding/hobbies');
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load AND RENDER
    await page.waitForTimeout(3000);
    
    // Wait for at least one selection to be visible
    await page.waitForSelector('text="Surfing"', { timeout: 5000 }).catch(() => {
      console.log('Warning: Surfing text not found');
    });
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'test-results/hobbies-current-state.png',
      fullPage: true 
    });
    
    // DEBUG: Print ALL text content on the page
    const allText = await page.textContent('body');
    console.log('\n📄 PAGE CONTAINS:', allText?.slice(0, 500));
    
    // DEBUG: Find ALL "Add More" buttons and their content
    const addMoreButtons = await page.locator('text="Add More"').all();
    console.log(`\n🔍 Found ${addMoreButtons.length} "Add More" buttons`);
    for (let i = 0; i < addMoreButtons.length; i++) {
      const parent = await addMoreButtons[i].evaluateHandle(el => el.parentElement);
      const text = await parent.evaluate(el => el?.textContent || '');
      console.log(`   Button ${i + 1}: ${text}`);
    }
    
    // DEBUG: Look for any element containing "Surfing" or "snorkeling"
    const surfingElements = await page.locator('text=/surfing/i').count();
    const snorkelingElements = await page.locator('text=/snorkeling/i').count();
    console.log(`\n🏄 Elements with "surfing": ${surfingElements}`);
    console.log(`🤿 Elements with "snorkeling": ${snorkelingElements}`);
    
    // Check selected cards with simpler selector
    const greenBorders = await page.locator('[class*="border-green"]').count();
    const greenBackgrounds = await page.locator('[class*="bg-green"]').count();
    console.log(`\n✅ Green borders: ${greenBorders}, Green backgrounds: ${greenBackgrounds}`);
    
    // Check "Add More" Physical Activities content - look for the whole card
    const physicalCard = await page.locator('div:has-text("Add More"):has-text("Surfing")').first();
    const physicalContent = await physicalCard.textContent().catch(() => 'Not found');
    console.log(`\n📌 PHYSICAL "Add More" card contains: ${physicalContent}`);
    
    // Check "Add More" Hobbies content  
    const hobbiesAddMore = await page.locator('text="Add More"').last();
    const hobbiesParent = await hobbiesAddMore.locator('..');
    const hobbiesContent = await hobbiesParent.textContent();
    console.log(`📌 HOBBIES "Add More" shows: ${hobbiesContent}`);
    
    // Check summary section
    const summaryExists = await page.locator('text="Your Activities & Preferences"').count() > 0;
    if (summaryExists) {
      const summary = await page.locator('text="Your Activities & Preferences"').locator('..').textContent();
      console.log(`\n📊 SUMMARY SECTION:\n${summary}`);
      
      // Verify expected content
      const hasGolf = summary.includes('Golf');
      const hasSurfing = summary.includes('Surfing') || summary.includes('surfing');
      const hasSnorkeling = summary.includes('Snorkeling') || summary.includes('snorkeling');
      const hasScuba = summary.includes('Scuba') || summary.includes('scuba');
      
      console.log(`\n✅ VERIFICATION:`);
      console.log(`  Golf: ${hasGolf ? '✅' : '❌'}`);
      console.log(`  Surfing: ${hasSurfing ? '✅' : '❌'}`);
      console.log(`  Snorkeling: ${hasSnorkeling ? '✅' : '❌'}`);
      console.log(`  Scuba: ${hasScuba ? '✅' : '❌'}`);
    } else {
      console.log('❌ NO SUMMARY SECTION FOUND!');
    }
    
    console.log('\n✅ Test complete - check test-results/hobbies-current-state.png');
  });
});