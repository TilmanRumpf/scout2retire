import { chromium } from 'playwright';
import crypto from 'crypto';

async function testHobbyPersistenceComplete() {
  console.log('🎯 Starting complete hobby persistence test with authentication...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to the app
    console.log('1. Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 2: Click "Get Started" to begin onboarding
    console.log('2. Clicking "Get Started" to begin onboarding...');
    await page.click('text=Get Started');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 3: Sign up with a test email
    console.log('3. Signing up with test credentials...');
    const testEmail = `test_${crypto.randomUUID().substring(0, 8)}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    console.log(`   Using test email: ${testEmail}`);
    
    // Wait for signup to complete and redirect
    await page.waitForTimeout(3000);
    
    // Step 4: Navigate through onboarding to reach hobbies
    console.log('4. Navigating through onboarding steps to reach hobbies...');
    
    // Skip through the onboarding steps until we reach hobbies
    let currentUrl = page.url();
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!currentUrl.includes('hobbies') && attempts < maxAttempts) {
      console.log(`   Current URL: ${currentUrl}`);
      
      // Look for "Next" or "Skip" buttons to advance
      const nextButton = page.locator('button:has-text("Next")').first();
      const skipButton = page.locator('button:has-text("Skip")').first();
      const continueButton = page.locator('button:has-text("Continue")').first();
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        console.log('   Clicked Next button');
      } else if (await skipButton.isVisible()) {
        await skipButton.click();
        console.log('   Clicked Skip button');
      } else if (await continueButton.isVisible()) {
        await continueButton.click();
        console.log('   Clicked Continue button');
      } else {
        // Try to navigate directly to hobbies if we're stuck
        console.log('   No navigation buttons found, trying direct navigation...');
        await page.goto('http://localhost:5173/onboarding/hobbies');
      }
      
      await page.waitForTimeout(2000);
      currentUrl = page.url();
      attempts++;
    }
    
    if (!currentUrl.includes('hobbies')) {
      console.log('❌ Could not reach hobbies page after multiple attempts');
      // Take a screenshot to see where we ended up
      await page.screenshot({ path: 'stuck_at.png', fullPage: true });
      return;
    }
    
    console.log('✅ Successfully reached hobbies page!');
    
    // Step 5: Take screenshot of initial hobbies page
    console.log('5. Taking screenshot of initial hobbies state...');
    await page.screenshot({ path: 'hobbies_initial_state.png', fullPage: true });
    console.log('   ✅ Screenshot saved as hobbies_initial_state.png');
    
    // Step 6: Test hobby selections
    console.log('6. Testing hobby selections...');
    
    // Look for Walking & Cycling
    const walkingCycling = page.locator('text=Walking & Cycling').first();
    if (await walkingCycling.isVisible()) {
      await walkingCycling.click();
      console.log('   ✅ Clicked "Walking & Cycling"');
    } else {
      console.log('   ❌ "Walking & Cycling" not found');
    }
    
    // Look for Golf & Tennis
    const golfTennis = page.locator('text=Golf & Tennis').first();
    if (await golfTennis.isVisible()) {
      await golfTennis.click();
      console.log('   ✅ Clicked "Golf & Tennis"');
    } else {
      console.log('   ❌ "Golf & Tennis" not found');
    }
    
    await page.waitForTimeout(1000);
    
    // Step 7: Click "Add More" button for Physical Activities
    console.log('7. Looking for "Add More" button under Physical Activities...');
    const addMoreButtons = page.locator('text=Add More');
    const addMoreCount = await addMoreButtons.count();
    console.log(`   Found ${addMoreCount} "Add More" buttons`);
    
    if (addMoreCount > 0) {
      // Click the first "Add More" button (should be for Physical Activities)
      await addMoreButtons.first().click();
      console.log('   ✅ Clicked first "Add More" button');
      await page.waitForTimeout(2000);
      
      // Step 8: In the modal, select some activities
      console.log('8. Selecting activities in the modal...');
      
      // Look for Mountain biking
      const mountainBiking = page.locator('text=Mountain biking').first();
      if (await mountainBiking.isVisible()) {
        await mountainBiking.click();
        console.log('   ✅ Selected "Mountain biking"');
      } else {
        console.log('   ❌ "Mountain biking" not found');
      }
      
      // Look for Rock climbing
      const rockClimbing = page.locator('text=Rock climbing').first();
      if (await rockClimbing.isVisible()) {
        await rockClimbing.click();
        console.log('   ✅ Selected "Rock climbing"');
      } else {
        console.log('   ❌ "Rock climbing" not found');
      }
      
      await page.waitForTimeout(1000);
      
      // Step 9: Save the modal selections
      console.log('9. Saving modal selections...');
      const saveButton = page.locator('text=Save & Close').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        console.log('   ✅ Clicked "Save & Close"');
      } else {
        // Try other close buttons
        const closeButtons = ['text=Save', 'text=Close', 'button:has-text("Save")', 'button:has-text("Close")'];
        let closed = false;
        
        for (const selector of closeButtons) {
          const button = page.locator(selector).first();
          if (await button.isVisible()) {
            await button.click();
            console.log(`   ✅ Clicked ${selector}`);
            closed = true;
            break;
          }
        }
        
        if (!closed) {
          console.log('   ❌ No save/close button found, pressing Escape');
          await page.keyboard.press('Escape');
        }
      }
      
      await page.waitForTimeout(2000);
    }
    
    // Step 10: Take screenshot after selections
    console.log('10. Taking screenshot after selections...');
    await page.screenshot({ path: 'hobbies_after_selections.png', fullPage: true });
    console.log('    ✅ Screenshot saved as hobbies_after_selections.png');
    
    // Check the "Add More" button subtitle to see if it shows selected activities
    console.log('11. Checking "Add More" button subtitle...');
    const addMoreAfterSelections = page.locator('text=Add More');
    const count = await addMoreAfterSelections.count();
    console.log(`    Found ${count} "Add More" buttons after selections`);
    
    // Get all text content to see what's shown
    for (let i = 0; i < count; i++) {
      try {
        const buttonText = await addMoreAfterSelections.nth(i).textContent();
        const parentContainer = addMoreAfterSelections.nth(i).locator('..');
        const containerText = await parentContainer.textContent();
        console.log(`    "Add More" button ${i + 1}: "${buttonText}"`);
        console.log(`    Full container text: "${containerText}"`);
      } catch (e) {
        console.log(`    Could not read button ${i + 1} text`);
      }
    }
    
    // Step 12: Refresh the page to test persistence
    console.log('12. Refreshing the page to test persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('    ✅ Page refreshed');
    
    // Step 13: Take screenshot after refresh
    console.log('13. Taking screenshot after refresh...');
    await page.screenshot({ path: 'hobbies_after_refresh.png', fullPage: true });
    console.log('    ✅ Screenshot saved as hobbies_after_refresh.png');
    
    // Step 14: Check if selections persisted
    console.log('14. Checking if selections persisted after refresh...');
    
    // Check if the quick selections are still selected
    const walkingCyclingAfterRefresh = page.locator('text=Walking & Cycling').first();
    const golfTennisAfterRefresh = page.locator('text=Golf & Tennis').first();
    
    try {
      const walkingCyclingSelected = await walkingCyclingAfterRefresh.getAttribute('class');
      const golfTennisSelected = await golfTennisAfterRefresh.getAttribute('class');
      
      console.log(`    Walking & Cycling classes: ${walkingCyclingSelected}`);
      console.log(`    Golf & Tennis classes: ${golfTennisSelected}`);
      
      // Check if classes indicate selection (look for selected/active/highlighted classes)
      const walkingPersisted = walkingCyclingSelected?.includes('selected') || 
                               walkingCyclingSelected?.includes('active') || 
                               walkingCyclingSelected?.includes('accent') ||
                               walkingCyclingSelected?.includes('highlighted');
      
      const golfPersisted = golfTennisSelected?.includes('selected') || 
                           golfTennisSelected?.includes('active') || 
                           golfTennisSelected?.includes('accent') ||
                           golfTennisSelected?.includes('highlighted');
      
      console.log(`    Walking & Cycling persisted: ${walkingPersisted ? '✅' : '❌'}`);
      console.log(`    Golf & Tennis persisted: ${golfPersisted ? '✅' : '❌'}`);
    } catch (e) {
      console.log('    ❌ Could not check selection classes:', e.message);
    }
    
    // Check the "Add More" button subtitle after refresh
    console.log('15. Checking "Add More" button subtitle after refresh...');
    const addMoreAfterRefresh = page.locator('text=Add More');
    const countAfterRefresh = await addMoreAfterRefresh.count();
    console.log(`    Found ${countAfterRefresh} "Add More" buttons after refresh`);
    
    // Get all text content to see what's shown after refresh
    for (let i = 0; i < countAfterRefresh; i++) {
      try {
        const buttonText = await addMoreAfterRefresh.nth(i).textContent();
        const parentContainer = addMoreAfterRefresh.nth(i).locator('..');
        const containerText = await parentContainer.textContent();
        console.log(`    "Add More" button ${i + 1} after refresh: "${buttonText}"`);
        console.log(`    Full container text after refresh: "${containerText}"`);
      } catch (e) {
        console.log(`    Could not read button ${i + 1} text after refresh`);
      }
    }
    
    console.log('\n🎯 Test completed! Check the screenshots for visual confirmation:');
    console.log('   - hobbies_initial_state.png: Initial page state');
    console.log('   - hobbies_after_selections.png: After making selections');
    console.log('   - hobbies_after_refresh.png: After page refresh');
    console.log('\n📊 Summary:');
    console.log('   The test checked hobby selection persistence by:');
    console.log('   1. Authenticating and navigating to the hobbies page');
    console.log('   2. Selecting quick options (Walking & Cycling, Golf & Tennis)');
    console.log('   3. Opening the "Add More" modal and selecting additional activities');
    console.log('   4. Saving the modal selections');
    console.log('   5. Refreshing the page');
    console.log('   6. Checking if both quick selections and "Add More" subtitle persist');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    
    // Take a screenshot of the error state
    try {
      await page.screenshot({ path: 'error_state.png', fullPage: true });
      console.log('   📸 Error screenshot saved as error_state.png');
    } catch (screenshotError) {
      console.error('   Could not take error screenshot:', screenshotError);
    }
  } finally {
    await browser.close();
  }
}

testHobbyPersistenceComplete();