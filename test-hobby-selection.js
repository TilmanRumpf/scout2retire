import { chromium } from 'playwright';

// Mock a Supabase auth session for testing
const mockAuthSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'f263b6d9-ec0a-4aa7-8227-b2702937cbc6', // Real user ID from database
    email: 'test@example.com',
    created_at: new Date().toISOString()
  }
};

async function testHobbySelection() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📍 1. Navigating to main page first...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    // Set up authentication by injecting localStorage data
    console.log('🔐 2. Setting up authentication...');
    await page.evaluate((session) => {
      // Set Supabase auth session in localStorage
      const supabaseKey = `sb-axlruvvsjepsulcbqlho-auth-token`;
      localStorage.setItem(supabaseKey, JSON.stringify(session));
      
      // Also set session storage for immediate access
      sessionStorage.setItem(supabaseKey, JSON.stringify(session));
    }, mockAuthSession);
    
    // Check if we can go directly to hobbies
    console.log('🔍 3. Checking current page...');
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Try to navigate directly to hobbies page
    console.log('📍 4. Navigating to hobbies page...');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for auth to be processed
    await page.waitForTimeout(2000);
    
    // Check if we successfully reached the hobbies page
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);
    
    if (!finalUrl.includes('/onboarding/hobbies')) {
      console.log('⚠️  Not on hobbies page - trying to handle auth redirect...');
      const pageTitle = await page.title();
      const bodyText = await page.locator('body').textContent();
      console.log(`   Page title: ${pageTitle}`);
      console.log(`   Body contains "Physical Activities": ${bodyText.includes('Physical Activities')}`);
      console.log(`   Body contains "Get Started": ${bodyText.includes('Get Started')}`);
      
      if (bodyText.includes('Get Started')) {
        // Try clicking Get Started to trigger auth flow
        console.log('🚪 Clicking Get Started...');
        try {
          await page.click('button:has-text("Get Started")');
          await page.waitForTimeout(2000);
          
          // Try navigating to hobbies again
          await page.goto('http://localhost:5173/onboarding/hobbies');
          await page.waitForLoadState('networkidle');
          
          const afterAuthUrl = page.url();
          console.log(`   After auth attempt: ${afterAuthUrl}`);
          
          if (!afterAuthUrl.includes('/onboarding/hobbies')) {
            console.log('❌ Could not reach hobbies page - stopping test');
            return;
          }
        } catch (e) {
          console.log('❌ Authentication flow failed:', e.message);
          return;
        }
      }
    }
    
    console.log('📷 4. Taking screenshot of initial state...');
    await page.screenshot({ path: 'initial-state.png', fullPage: true });
    
    // Check what buttons are actually available
    console.log('🔍 5. Looking for hobby buttons...');
    const allButtons = await page.locator('button').count();
    console.log(`   Total buttons found: ${allButtons}`);
    
    // Look for specific text patterns
    const physicalText = await page.locator('text=Physical Activities').count();
    const walkingText = await page.locator('text=Walking & Cycling').count();
    const golfText = await page.locator('text=Golf & Tennis').count();
    const artsText = await page.locator('text=Arts & Crafts').count();
    
    console.log(`   "Physical Activities" found: ${physicalText} times`);
    console.log(`   "Walking & Cycling" found: ${walkingText} times`);
    console.log(`   "Golf & Tennis" found: ${golfText} times`);
    console.log(`   "Arts & Crafts" found: ${artsText} times`);
    
    // Count selected buttons initially with different selectors
    console.log('🔢 6. Counting initially selected buttons...');
    const selectedByBorder = await page.locator('[class*="border-scout-accent-500"]').count();
    const selectedByBg = await page.locator('[class*="bg-scout-accent-50"]').count();
    console.log(`   Selected by border: ${selectedByBorder} buttons`);
    console.log(`   Selected by background: ${selectedByBg} buttons`);
    
    if (walkingText === 0) {
      console.log('❌ No hobby buttons found - page might not be loaded correctly');
      const pageContent = await page.textContent('body');
      console.log(`   Page content preview: ${pageContent.substring(0, 200)}...`);
      return;
    }
    
    // Select some buttons
    console.log('👆 7. Clicking on compound activity buttons...');
    
    // Try different selectors for the buttons
    const walkingSelectors = [
      'text=Walking & Cycling',
      'button:has-text("Walking & Cycling")',
      '[title*="Walking"]',
      'button:has-text("Walking")'
    ];
    
    let walkingClicked = false;
    for (const selector of walkingSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          console.log(`   ✅ Clicked Walking & Cycling using selector: ${selector}`);
          walkingClicked = true;
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        console.log(`   ❌ Failed with selector: ${selector}`);
      }
    }
    
    if (!walkingClicked) {
      console.log('   ⚠️  Could not click Walking & Cycling button');
    }
    
    // Try Golf & Tennis
    try {
      const golfButton = page.locator('button:has-text("Golf & Tennis")').first();
      if (await golfButton.isVisible()) {
        await golfButton.click();
        console.log('   ✅ Clicked Golf & Tennis');
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('   ❌ Could not click Golf & Tennis');
    }
    
    // Try Arts & Crafts
    try {
      const artsButton = page.locator('button:has-text("Arts & Crafts")').first();
      if (await artsButton.isVisible()) {
        await artsButton.click();
        console.log('   ✅ Clicked Arts & Crafts');
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('   ❌ Could not click Arts & Crafts');
    }
    
    console.log('📷 8. Taking screenshot after selections...');
    await page.screenshot({ path: 'after-selections.png', fullPage: true });
    
    // Count selected buttons after clicking with multiple selectors
    console.log('🔢 9. Counting selected buttons after clicking...');
    const afterBorder = await page.locator('[class*="border-scout-accent-500"]').count();
    const afterBg = await page.locator('[class*="bg-scout-accent-50"]').count();
    console.log(`   After clicking - border: ${afterBorder}, background: ${afterBg}`);
    
    // Wait a bit for any auto-save
    await page.waitForTimeout(2000);
    
    console.log('🔄 10. Refreshing the page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('📷 11. Taking screenshot after refresh...');
    await page.screenshot({ path: 'after-refresh.png', fullPage: true });
    
    // Count selected buttons after refresh
    console.log('🔢 12. Counting selected buttons after refresh...');
    const afterRefreshBorder = await page.locator('[class*="border-scout-accent-500"]').count();
    const afterRefreshBg = await page.locator('[class*="bg-scout-accent-50"]').count();
    console.log(`   After refresh - border: ${afterRefreshBorder}, background: ${afterRefreshBg}`);
    
    console.log('\n📊 RESULTS:');
    console.log(`   Initial - border: ${selectedByBorder}, background: ${selectedByBg}`);
    console.log(`   After clicking - border: ${afterBorder}, background: ${afterBg}`);
    console.log(`   After refresh - border: ${afterRefreshBorder}, background: ${afterRefreshBg}`);
    
    const bestInitial = Math.max(selectedByBorder, selectedByBg);
    const bestAfterClick = Math.max(afterBorder, afterBg);
    const bestAfterRefresh = Math.max(afterRefreshBorder, afterRefreshBg);
    
    if (bestAfterRefresh === bestAfterClick && bestAfterClick > bestInitial) {
      console.log('   ✅ SUCCESS: Selections persist across refresh!');
    } else if (bestAfterRefresh === bestInitial) {
      console.log('   ❌ FAILURE: Selections were lost on refresh');
    } else {
      console.log('   ⚠️  PARTIAL: Some selections may have been lost');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testHobbySelection().catch(console.error);