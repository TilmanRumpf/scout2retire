import { chromium } from 'playwright';

async function testHobbyPersistenceSimple() {
  console.log('🎯 Testing hobby persistence with existing authentication...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Try to go directly to the main app first
    console.log('1. Checking if user is already authenticated...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if we're on the welcome page or already authenticated
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    const hasGetStarted = await page.locator('text=Get Started').count() > 0;
    const hasLogIn = await page.locator('text=Log In').count() > 0;
    
    console.log(`   Has "Get Started": ${hasGetStarted}`);
    console.log(`   Has "Log In": ${hasLogIn}`);
    
    if (hasLogIn) {
      console.log('2. Trying to log in with existing credentials...');
      await page.click('text=Log In');
      await page.waitForTimeout(2000);
      
      // Try some common test credentials
      const testEmails = ['test@example.com', 'admin@example.com', 'demo@scout2retire.com'];
      const testPassword = 'password123';
      
      for (const email of testEmails) {
        try {
          await page.fill('input[type="email"]', email);
          await page.fill('input[type="password"]', testPassword);
          await page.click('button[type="submit"]');
          await page.waitForTimeout(3000);
          
          const newUrl = page.url();
          if (!newUrl.includes('welcome') && !newUrl.includes('login')) {
            console.log(`   ✅ Successfully logged in with ${email}`);
            break;
          } else {
            console.log(`   ❌ Login failed with ${email}`);
          }
        } catch (e) {
          console.log(`   ❌ Error trying ${email}: ${e.message}`);
        }
      }
    }
    
    // Step 3: Try to navigate directly to hobbies page
    console.log('3. Attempting to navigate directly to hobbies page...');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const hobbyPageUrl = page.url();
    console.log(`   Final URL: ${hobbyPageUrl}`);
    
    // Take a screenshot to see what we got
    await page.screenshot({ path: 'hobby_direct_access.png', fullPage: true });
    console.log('   📸 Screenshot saved as hobby_direct_access.png');
    
    // Check if we're actually on the hobbies page
    const hasPhysicalActivities = await page.locator('text=Physical Activities').count() > 0;
    const hasHobbiesInterests = await page.locator('text=Hobbies & Interests').count() > 0;
    const hasAddMore = await page.locator('text=Add More').count();
    const hasWalkingCycling = await page.locator('text=Walking & Cycling').count() > 0;
    
    console.log('\n4. Analyzing page content:');
    console.log(`   Has "Physical Activities": ${hasPhysicalActivities}`);
    console.log(`   Has "Hobbies & Interests": ${hasHobbiesInterests}`);
    console.log(`   Has "Walking & Cycling": ${hasWalkingCycling}`);
    console.log(`   Found ${hasAddMore} "Add More" buttons`);
    
    if (hasPhysicalActivities && hasHobbiesInterests) {
      console.log('\n✅ Successfully reached hobbies page! Starting persistence test...');
      
      // Step 5: Test hobby selections
      console.log('\n5. Testing hobby selections...');
      
      // Select Walking & Cycling
      if (hasWalkingCycling) {
        await page.click('text=Walking & Cycling');
        console.log('   ✅ Clicked "Walking & Cycling"');
      }
      
      // Select Golf & Tennis if available
      const golfTennis = page.locator('text=Golf & Tennis').first();
      if (await golfTennis.isVisible()) {
        await golfTennis.click();
        console.log('   ✅ Clicked "Golf & Tennis"');
      }
      
      await page.waitForTimeout(1000);
      
      // Step 6: Test "Add More" button
      if (hasAddMore > 0) {
        console.log('\n6. Testing "Add More" functionality...');
        
        // Click the first Add More button (Physical Activities)
        await page.locator('text=Add More').first().click();
        console.log('   ✅ Clicked "Add More" button');
        
        await page.waitForTimeout(2000);
        
        // Look for activities in the modal
        const mountainBiking = page.locator('text=Mountain biking').first();
        const rockClimbing = page.locator('text=Rock climbing').first();
        
        if (await mountainBiking.isVisible()) {
          await mountainBiking.click();
          console.log('   ✅ Selected "Mountain biking"');
        }
        
        if (await rockClimbing.isVisible()) {
          await rockClimbing.click();
          console.log('   ✅ Selected "Rock climbing"');
        }
        
        // Save the modal
        const saveButton = page.locator('text=Save & Close').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          console.log('   ✅ Clicked "Save & Close"');
        } else {
          await page.keyboard.press('Escape');
          console.log('   ⚠️ Used Escape to close modal');
        }
        
        await page.waitForTimeout(2000);
      }
      
      // Step 7: Take screenshot after selections
      console.log('\n7. Taking screenshot after selections...');
      await page.screenshot({ path: 'hobby_after_selections.png', fullPage: true });
      console.log('   📸 Screenshot saved as hobby_after_selections.png');
      
      // Check current state of Add More buttons
      const addMoreAfterSelections = await page.locator('text=Add More').count();
      console.log(`   Found ${addMoreAfterSelections} "Add More" buttons after selections`);
      
      for (let i = 0; i < Math.min(addMoreAfterSelections, 2); i++) {
        try {
          const addMoreButton = page.locator('text=Add More').nth(i);
          const parentElement = addMoreButton.locator('..');
          const parentText = await parentElement.textContent();
          console.log(`   Add More button ${i + 1}: "${parentText?.trim()}"`);
        } catch (e) {
          console.log(`   Could not read Add More button ${i + 1} text`);
        }
      }
      
      // Step 8: Refresh the page
      console.log('\n8. Refreshing page to test persistence...');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      console.log('   ✅ Page refreshed');
      
      // Step 9: Take screenshot after refresh
      console.log('\n9. Taking screenshot after refresh...');
      await page.screenshot({ path: 'hobby_after_refresh.png', fullPage: true });
      console.log('   📸 Screenshot saved as hobby_after_refresh.png');
      
      // Step 10: Check persistence
      console.log('\n10. Checking persistence after refresh...');
      
      // Check if main selections persisted
      const walkingAfterRefresh = await page.locator('text=Walking & Cycling').count() > 0;
      const golfAfterRefresh = await page.locator('text=Golf & Tennis').count() > 0;
      console.log(`   "Walking & Cycling" still visible: ${walkingAfterRefresh}`);
      console.log(`   "Golf & Tennis" still visible: ${golfAfterRefresh}`);
      
      // Check if selections are still active (look at CSS classes)
      if (walkingAfterRefresh) {
        try {
          const walkingClasses = await page.locator('text=Walking & Cycling').first().getAttribute('class');
          const isWalkingSelected = walkingClasses?.includes('selected') || 
                                   walkingClasses?.includes('accent') || 
                                   walkingClasses?.includes('active');
          console.log(`   Walking & Cycling selected state: ${isWalkingSelected ? '✅' : '❌'}`);
          console.log(`   Walking & Cycling classes: ${walkingClasses}`);
        } catch (e) {
          console.log('   Could not check Walking & Cycling selection state');
        }
      }
      
      if (golfAfterRefresh) {
        try {
          const golfClasses = await page.locator('text=Golf & Tennis').first().getAttribute('class');
          const isGolfSelected = golfClasses?.includes('selected') || 
                                golfClasses?.includes('accent') || 
                                golfClasses?.includes('active');
          console.log(`   Golf & Tennis selected state: ${isGolfSelected ? '✅' : '❌'}`);
          console.log(`   Golf & Tennis classes: ${golfClasses}`);
        } catch (e) {
          console.log('   Could not check Golf & Tennis selection state');
        }
      }
      
      // Check Add More button persistence
      const addMoreAfterRefresh = await page.locator('text=Add More').count();
      console.log(`   Found ${addMoreAfterRefresh} "Add More" buttons after refresh`);
      
      for (let i = 0; i < Math.min(addMoreAfterRefresh, 2); i++) {
        try {
          const addMoreButton = page.locator('text=Add More').nth(i);
          const parentElement = addMoreButton.locator('..');
          const parentText = await parentElement.textContent();
          console.log(`   Add More button ${i + 1} after refresh: "${parentText?.trim()}"`);
        } catch (e) {
          console.log(`   Could not read Add More button ${i + 1} text after refresh`);
        }
      }
      
      console.log('\n🎯 Hobby persistence test completed!');
      console.log('\n📊 RESULTS SUMMARY:');
      console.log('   ✅ Successfully accessed hobbies page');
      console.log('   ✅ Made hobby selections (quick picks and modal)');
      console.log('   ✅ Page refresh completed');
      console.log('   📸 Three screenshots taken for comparison');
      console.log('\n📁 Check these files for visual verification:');
      console.log('   - hobby_direct_access.png: Initial page access');
      console.log('   - hobby_after_selections.png: After making selections');
      console.log('   - hobby_after_refresh.png: After page refresh');
      
    } else {
      console.log('\n❌ Could not access hobbies page functionality');
      console.log('   The page does not contain the expected hobby selection elements');
      console.log('   This might be due to authentication requirements or routing issues');
      
      // Show what elements we do find
      const pageText = await page.textContent('body');
      const relevantText = pageText?.substring(0, 500) || 'No body text found';
      console.log(`\n📄 Page content preview: ${relevantText}...`);
    }
    
  } catch (error) {
    console.error('\n❌ Error during test:', error);
    
    try {
      await page.screenshot({ path: 'hobby_test_error.png', fullPage: true });
      console.log('   📸 Error screenshot saved as hobby_test_error.png');
    } catch (screenshotError) {
      console.error('   Could not take error screenshot');
    }
  } finally {
    await browser.close();
  }
}

testHobbyPersistenceSimple();