import puppeteer from 'puppeteer';

async function testCostsPageWithAuth() {
  console.log('🚀 Starting authenticated Scout2Retire costs page testing...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 1024 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. 📱 First checking if we need authentication...');
    await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle0' });
    
    // Check if we were redirected to welcome/login
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/welcome') || currentUrl.includes('/login')) {
      console.log('   🔐 Authentication required, attempting to sign up/login...');
      
      // Look for "Get Started" or login button
      const getStartedBtn = await page.$('button:has-text("Get Started"), a:has-text("Get Started")');
      const loginBtn = await page.$('button:has-text("Log In"), a:has-text("Log In")');
      
      if (getStartedBtn) {
        await getStartedBtn.click();
        await page.waitForTimeout(2000);
        console.log('   ✅ Clicked Get Started');
      } else if (loginBtn) {
        await loginBtn.click();
        await page.waitForTimeout(2000);
        console.log('   ✅ Clicked Log In');
      }
      
      // Try to create a test account or login
      const emailField = await page.$('input[type="email"], input[name="email"]');
      const passwordField = await page.$('input[type="password"], input[name="password"]');
      
      if (emailField && passwordField) {
        await emailField.type('test@example.com');
        await passwordField.type('testpassword123');
        
        const submitBtn = await page.$('button[type="submit"], button:has-text("Sign"), button:has-text("Log")');
        if (submitBtn) {
          await submitBtn.click();
          await page.waitForTimeout(3000);
          console.log('   ✅ Attempted authentication');
        }
      }
      
      // Now try to navigate to costs page again
      console.log('   🔄 Attempting to navigate to costs page after auth...');
      await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle0' });
    }
    
    // Take screenshot of whatever page we're on
    await page.screenshot({ path: 'costs-page-auth-check.png', fullPage: true });
    console.log('2. 📸 Screenshot saved as costs-page-auth-check.png');
    
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/costs')) {
      console.log('✅ Successfully reached costs page!');
      
      // Test the actual costs page functionality
      console.log('3. 🔍 Testing SelectionCard layout...');
      
      // Look for selection cards/buttons
      const cards = await page.$$('button[type="button"]');
      console.log(`   Found ${cards.length} interactive elements`);
      
      // Look for specific grid layouts
      const grids = await page.$$('.grid');
      console.log(`   Found ${grids.length} grid layouts`);
      
      // Test budget selection
      console.log('4. 💰 Testing budget selection...');
      const budgetCards = await page.$$('button[type="button"]');
      if (budgetCards.length >= 5) {
        // Try to click a budget tier (looking for buttons that might contain budget amounts)
        for (let i = 0; i < Math.min(5, budgetCards.length); i++) {
          try {
            const buttonText = await budgetCards[i].textContent();
            if (buttonText.includes('$') || buttonText.includes('Essential') || buttonText.includes('Comfortable')) {
              await budgetCards[i].click();
              await page.waitForTimeout(500);
              console.log(`   ✅ Clicked budget option: ${buttonText.substring(0, 30)}...`);
              break;
            }
          } catch (e) {
            // Continue if button interaction fails
          }
        }
      }
      
      // Test mobility options
      console.log('5. 🚗 Testing mobility options...');
      const allButtons = await page.$$('button[type="button"]');
      let mobilityClicked = 0;
      for (let i = 0; i < allButtons.length && mobilityClicked < 3; i++) {
        try {
          const buttonText = await allButtons[i].textContent();
          if (buttonText.includes('Walk') || buttonText.includes('Car') || buttonText.includes('Transit') || buttonText.includes('Airport')) {
            await allButtons[i].click();
            await page.waitForTimeout(300);
            mobilityClicked++;
            console.log(`   ✅ Clicked mobility option: ${buttonText.substring(0, 30)}...`);
          }
        } catch (e) {
          // Continue if button interaction fails
        }
      }
      
      // Test tax options
      console.log('6. 💸 Testing tax options...');
      let taxClicked = 0;
      for (let i = 0; i < allButtons.length && taxClicked < 3; i++) {
        try {
          const buttonText = await allButtons[i].textContent();
          if (buttonText.includes('Tax') || buttonText.includes('Property') || buttonText.includes('Sales') || buttonText.includes('Income')) {
            await allButtons[i].click();
            await page.waitForTimeout(300);
            taxClicked++;
            console.log(`   ✅ Clicked tax option: ${buttonText.substring(0, 30)}...`);
          }
        } catch (e) {
          // Continue if button interaction fails
        }
      }
      
      // Take screenshot after interactions
      await page.screenshot({ path: 'costs-page-after-interactions.png', fullPage: true });
      console.log('7. 📸 Screenshot saved as costs-page-after-interactions.png');
      
      // Look for summary section
      console.log('8. 📋 Checking for summary section...');
      const summaryElements = await page.$$('.p-3, .p-4, [class*="summary"], [class*="Summary"]');
      if (summaryElements.length > 0) {
        console.log(`   ✅ Found ${summaryElements.length} potential summary elements`);
      }
      
      // Test form submission
      console.log('9. 📝 Testing form submission...');
      const nextButtons = await page.$$('button');
      let foundNext = false;
      for (const button of nextButtons) {
        try {
          const text = await button.textContent();
          if (text.includes('Next') || text.includes('→') || text.includes('Save')) {
            await button.click();
            await page.waitForTimeout(2000);
            foundNext = true;
            console.log(`   ✅ Clicked: ${text}`);
            break;
          }
        } catch (e) {
          // Continue if button interaction fails
        }
      }
      
      if (foundNext) {
        const afterSubmitUrl = page.url();
        console.log(`   Navigation result: ${afterSubmitUrl}`);
        
        if (afterSubmitUrl !== finalUrl) {
          console.log('   ✅ Form submission caused navigation');
          
          // Test persistence by going back
          console.log('10. 🔄 Testing data persistence...');
          await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle0' });
          await page.screenshot({ path: 'costs-page-persistence.png', fullPage: true });
          console.log('   📸 Persistence screenshot saved as costs-page-persistence.png');
        }
      }
      
      // Check for design consistency elements
      console.log('11. 🎨 Checking design consistency...');
      const hasProTip = await page.$('[class*="bg-scout"], [class*="pro-tip"], .lightbulb');
      const hasBottomNav = await page.$('.fixed, .sticky');
      const hasSections = await page.$$('label, h2, h3, h4').length;
      
      console.log(`   ${hasProTip ? '✅' : '❌'} ProTip or accent styling found`);
      console.log(`   ${hasBottomNav ? '✅' : '❌'} Fixed/sticky navigation found`);
      console.log(`   ${hasSections > 0 ? '✅' : '❌'} Section headers found (${hasSections})`);
      
    } else {
      console.log('❌ Could not reach costs page');
      console.log('   Possible issues:');
      console.log('   - Authentication required');
      console.log('   - Page redirect logic');
      console.log('   - Route protection');
    }
    
    console.log('\n🎉 Test completed!');
    console.log('\nGenerated screenshots:');
    console.log('  - costs-page-auth-check.png');
    console.log('  - costs-page-after-interactions.png (if costs page reached)');
    console.log('  - costs-page-persistence.png (if form submission worked)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCostsPageWithAuth();