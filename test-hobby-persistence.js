import { chromium } from 'playwright';

async function testHobbyPersistence() {
  console.log('🎯 Starting hobby persistence test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to the page
    console.log('1. Navigating to http://localhost:5173/onboarding/hobbies');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Take initial screenshot
    console.log('2. Taking screenshot of initial state...');
    await page.screenshot({ path: 'initial_state.png', fullPage: true });
    console.log('   ✅ Screenshot saved as initial_state.png');
    
    // Wait a moment for page to fully load
    await page.waitForTimeout(2000);
    
    // Step 3: Select "Walking" and "Golf" from quick selections
    console.log('3. Looking for Walking and Golf in quick selections...');
    
    // Try to find and click Walking
    const walkingButton = page.locator('text=Walking').first();
    if (await walkingButton.isVisible()) {
      await walkingButton.click();
      console.log('   ✅ Clicked Walking');
    } else {
      console.log('   ❌ Walking button not found');
    }
    
    // Try to find and click Golf
    const golfButton = page.locator('text=Golf').first();
    if (await golfButton.isVisible()) {
      await golfButton.click();
      console.log('   ✅ Clicked Golf');
    } else {
      console.log('   ❌ Golf button not found');
    }
    
    await page.waitForTimeout(1000);
    
    // Step 4: Click "Add More" button under Physical Activities
    console.log('4. Looking for "Add More" button...');
    const addMoreButtons = page.locator('text=Add More');
    const addMoreCount = await addMoreButtons.count();
    console.log(`   Found ${addMoreCount} "Add More" buttons`);
    
    if (addMoreCount > 0) {
      await addMoreButtons.first().click();
      console.log('   ✅ Clicked first "Add More" button');
      await page.waitForTimeout(1000);
    } else {
      console.log('   ❌ No "Add More" buttons found');
    }
    
    // Step 5: In the modal, select "Mountain biking" and "Rock climbing"
    console.log('5. Looking for Mountain biking and Rock climbing in modal...');
    
    const mountainBikingButton = page.locator('text=Mountain biking').first();
    if (await mountainBikingButton.isVisible()) {
      await mountainBikingButton.click();
      console.log('   ✅ Clicked Mountain biking');
    } else {
      console.log('   ❌ Mountain biking not found');
    }
    
    const rockClimbingButton = page.locator('text=Rock climbing').first();
    if (await rockClimbingButton.isVisible()) {
      await rockClimbingButton.click();
      console.log('   ✅ Clicked Rock climbing');
    } else {
      console.log('   ❌ Rock climbing not found');
    }
    
    await page.waitForTimeout(1000);
    
    // Step 6: Click "Save & Close" or apply button
    console.log('6. Looking for Save/Close button...');
    const saveButtons = [
      page.locator('text=Save & Close'),
      page.locator('text=Save'),
      page.locator('text=Close'),
      page.locator('text=Apply'),
      page.locator('button:has-text("Save")'),
      page.locator('button:has-text("Close")')
    ];
    
    let buttonClicked = false;
    for (const button of saveButtons) {
      if (await button.isVisible()) {
        await button.click();
        console.log('   ✅ Clicked save/close button');
        buttonClicked = true;
        break;
      }
    }
    
    if (!buttonClicked) {
      console.log('   ❌ No save/close button found, trying Escape key');
      await page.keyboard.press('Escape');
    }
    
    await page.waitForTimeout(1000);
    
    // Step 7: Take screenshot showing the "Add More" button with subtitle
    console.log('7. Taking screenshot after selections...');
    await page.screenshot({ path: 'after_selections.png', fullPage: true });
    console.log('   ✅ Screenshot saved as after_selections.png');
    
    // Check what the Add More button subtitle shows
    const addMoreSubtitles = page.locator('text=Add More').locator('xpath=following-sibling::*');
    const subtitleCount = await addMoreSubtitles.count();
    console.log(`   Found ${subtitleCount} elements near "Add More" buttons`);
    
    // Step 8: Refresh the page
    console.log('8. Refreshing the page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('   ✅ Page refreshed');
    
    // Step 9: Take final screenshot
    console.log('9. Taking screenshot after refresh...');
    await page.screenshot({ path: 'after_refresh.png', fullPage: true });
    console.log('   ✅ Screenshot saved as after_refresh.png');
    
    // Check if selections persist
    console.log('10. Checking if selections persist...');
    
    // Check if Walking and Golf are still selected
    const walkingSelected = await page.locator('text=Walking').first().getAttribute('class');
    const golfSelected = await page.locator('text=Golf').first().getAttribute('class');
    
    console.log(`    Walking button class: ${walkingSelected}`);
    console.log(`    Golf button class: ${golfSelected}`);
    
    // Check Add More button subtitles
    const addMoreAfterRefresh = page.locator('text=Add More');
    const addMoreCountAfterRefresh = await addMoreAfterRefresh.count();
    console.log(`    Found ${addMoreCountAfterRefresh} "Add More" buttons after refresh`);
    
    console.log('\n🎯 Test completed! Check the screenshots for visual confirmation.');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await browser.close();
  }
}

testHobbyPersistence();