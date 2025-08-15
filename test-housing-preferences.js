import playwright from 'playwright';

async function testHousingPreferences() {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigating to onboarding costs page...');
    await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: 'housing-prefs-initial.png', fullPage: true });
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="housing-preference"]', { timeout: 10000 });
    
    console.log('✅ Page loaded successfully');
    
    // 1. Initial state - "Rent or Buy" selected
    console.log('1️⃣ Testing initial state with "Rent or Buy" selected...');
    const rentOrBuyButton = page.locator('button:has-text("Rent or Buy")');
    await rentOrBuyButton.click();
    await page.waitForTimeout(500);
    
    // Check if both rent and buy sections are visible
    const rentSection = page.locator('[data-testid="rent-section"]');
    const buySection = page.locator('[data-testid="buy-section"]');
    
    const rentVisible = await rentSection.isVisible();
    const buyVisible = await buySection.isVisible();
    
    console.log(`Rent section visible: ${rentVisible}`);
    console.log(`Buy section visible: ${buyVisible}`);
    
    await page.screenshot({ path: 'housing-prefs-rent-or-buy.png', fullPage: true });
    
    // 2. Test "Rent Only"
    console.log('2️⃣ Testing "Rent Only" selection...');
    const rentOnlyButton = page.locator('button:has-text("Rent Only")');
    await rentOnlyButton.click();
    await page.waitForTimeout(500);
    
    const rentOnlyRentVisible = await rentSection.isVisible();
    const rentOnlyBuyVisible = await buySection.isVisible();
    
    console.log(`Rent section visible (Rent Only): ${rentOnlyRentVisible}`);
    console.log(`Buy section visible (Rent Only): ${rentOnlyBuyVisible}`);
    
    await page.screenshot({ path: 'housing-prefs-rent-only.png', fullPage: true });
    
    // 3. Test "Buy Only"
    console.log('3️⃣ Testing "Buy Only" selection...');
    const buyOnlyButton = page.locator('button:has-text("Buy Only")');
    await buyOnlyButton.click();
    await page.waitForTimeout(500);
    
    const buyOnlyRentVisible = await rentSection.isVisible();
    const buyOnlyBuyVisible = await buySection.isVisible();
    
    console.log(`Rent section visible (Buy Only): ${buyOnlyRentVisible}`);
    console.log(`Buy section visible (Buy Only): ${buyOnlyBuyVisible}`);
    
    await page.screenshot({ path: 'housing-prefs-buy-only.png', fullPage: true });
    
    // 4. Back to "Rent or Buy"
    console.log('4️⃣ Testing back to "Rent or Buy"...');
    await rentOrBuyButton.click();
    await page.waitForTimeout(500);
    
    const finalRentVisible = await rentSection.isVisible();
    const finalBuyVisible = await buySection.isVisible();
    
    console.log(`Rent section visible (back to Rent or Buy): ${finalRentVisible}`);
    console.log(`Buy section visible (back to Rent or Buy): ${finalBuyVisible}`);
    
    // 5. Select some values and save
    console.log('5️⃣ Selecting values and testing save...');
    
    // Select rent budget
    const rentBudgetOptions = page.locator('[data-testid="rent-section"] button');
    const rentBudgetCount = await rentBudgetOptions.count();
    if (rentBudgetCount > 0) {
      await rentBudgetOptions.first().click();
      console.log('Selected first rent budget option');
    }
    
    // Select buy budget
    const buyBudgetOptions = page.locator('[data-testid="buy-section"] button');
    const buyBudgetCount = await buyBudgetOptions.count();
    if (buyBudgetCount > 0) {
      await buyBudgetOptions.first().click();
      console.log('Selected first buy budget option');
    }
    
    await page.screenshot({ path: 'housing-prefs-selections-made.png', fullPage: true });
    
    // Save and continue
    const saveButton = page.locator('button:has-text("Save and Continue")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      console.log('Clicked Save and Continue');
      await page.waitForTimeout(2000);
    }
    
    // 6. Navigate back to verify persistence
    console.log('6️⃣ Testing persistence by navigating back...');
    await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'housing-prefs-persistence-check.png', fullPage: true });
    
    // 7. Check summary section
    console.log('7️⃣ Checking summary section...');
    const summarySection = page.locator('[data-testid="summary-section"]');
    if (await summarySection.isVisible()) {
      const summaryText = await summarySection.textContent();
      console.log(`Summary section content: ${summaryText}`);
    } else {
      console.log('Summary section not found');
    }
    
    await page.screenshot({ path: 'housing-prefs-final.png', fullPage: true });
    
    console.log('✅ Housing preference testing completed');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'housing-prefs-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testHousingPreferences().catch(console.error);