import puppeteer from 'puppeteer';

async function testCostsPageDirect() {
  console.log('🚀 Direct costs page testing...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 1024 }
  });
  
  const page = await browser.newPage();
  
  try {
    // First, let's see what happens when we go to welcome
    console.log('1. 📱 Going to welcome page to understand auth flow...');
    await page.goto('http://localhost:5173/welcome', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'welcome-page.png', fullPage: true });
    console.log('   📸 Welcome page screenshot saved');
    
    // Look for Get Started button using simpler selectors
    const buttons = await page.$$('button');
    let getStartedFound = false;
    
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      console.log(`   Found button: "${text}"`);
      if (text.includes('Get Started')) {
        console.log('   🎯 Clicking Get Started...');
        await button.click();
        await page.waitForTimeout(2000);
        getStartedFound = true;
        break;
      }
    }
    
    if (!getStartedFound) {
      console.log('   📋 Available buttons:');
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        console.log(`     - "${text}"`);
      }
    }
    
    // Check where we are now
    const currentUrl = page.url();
    console.log(`   Current URL after button click: ${currentUrl}`);
    
    // If we're on signup, let's try to fill it out
    if (currentUrl.includes('signup') || currentUrl.includes('sign-up')) {
      console.log('2. 📝 Attempting to fill signup form...');
      
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');
      
      if (emailInput && passwordInput) {
        await emailInput.type('test.user@example.com');
        await passwordInput.type('TestPassword123!');
        
        // Look for signup button
        const submitButtons = await page.$$('button[type="submit"], button');
        for (const btn of submitButtons) {
          const btnText = await page.evaluate(el => el.textContent, btn);
          if (btnText.includes('Sign') || btnText.includes('Create') || btnText.includes('Register')) {
            console.log(`   🎯 Clicking signup button: "${btnText}"`);
            await btn.click();
            await page.waitForTimeout(3000);
            break;
          }
        }
      }
    }
    
    // Now try to navigate directly to costs page
    console.log('3. 🎯 Attempting direct navigation to costs page...');
    await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle0' });
    
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);
    
    // Take screenshot of whatever we get
    await page.screenshot({ path: 'costs-page-attempt.png', fullPage: true });
    console.log('   📸 Costs page attempt screenshot saved');
    
    if (finalUrl.includes('/costs')) {
      console.log('✅ SUCCESS: Reached costs page!');
      await runCostsPageTests(page);
    } else if (finalUrl.includes('/onboarding')) {
      console.log('🔄 On onboarding flow, trying to navigate through...');
      
      // Look for navigation buttons to get to costs
      const navButtons = await page.$$('button, a');
      for (const btn of navButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Next') || text.includes('Skip') || text.includes('→')) {
          console.log(`   🎯 Clicking: "${text}"`);
          await btn.click();
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          if (newUrl.includes('/costs')) {
            console.log('✅ Reached costs page through navigation!');
            await runCostsPageTests(page);
            break;
          }
        }
      }
    } else {
      console.log('❌ Could not reach costs page');
      console.log(`   Currently at: ${finalUrl}`);
      
      // Let's try a different approach - look for any navigation that mentions costs or budget
      const allLinks = await page.$$('a, button');
      console.log('   🔍 Looking for costs/budget related navigation...');
      
      for (const link of allLinks) {
        const text = await page.evaluate(el => el.textContent.toLowerCase(), link);
        if (text.includes('cost') || text.includes('budget') || text.includes('money') || text.includes('$')) {
          console.log(`   Found potential costs link: "${text}"`);
          try {
            await link.click();
            await page.waitForTimeout(2000);
            const newUrl = page.url();
            if (newUrl.includes('/costs')) {
              console.log('✅ Found costs page through content navigation!');
              await runCostsPageTests(page);
              break;
            }
          } catch (e) {
            console.log(`   Failed to click link: ${e.message}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function runCostsPageTests(page) {
  console.log('\n🧪 Running costs page functionality tests...');
  
  // Take initial screenshot
  await page.screenshot({ path: 'costs-page-loaded.png', fullPage: true });
  console.log('📸 Costs page screenshot saved');
  
  // Test 1: Check for SelectionCard layout
  console.log('1. 🔍 Checking SelectionCard layout...');
  const cards = await page.$$('button[type="button"]');
  const grids = await page.$$('.grid');
  console.log(`   Found ${cards.length} interactive cards and ${grids.length} grid layouts`);
  
  // Test 2: Budget tier selection
  console.log('2. 💰 Testing budget tier selection...');
  let budgetSelected = false;
  for (const card of cards) {
    const text = await page.evaluate(el => el.textContent, card);
    if (text.includes('$') && (text.includes('2,000') || text.includes('3,000'))) {
      console.log(`   🎯 Clicking budget tier: "${text.substring(0, 40)}..."`);
      await card.click();
      await page.waitForTimeout(500);
      budgetSelected = true;
      break;
    }
  }
  
  // Test 3: Mobility options
  console.log('3. 🚗 Testing mobility options...');
  let mobilitySelected = 0;
  for (const card of cards) {
    const text = await page.evaluate(el => el.textContent, card);
    if ((text.includes('Walk') || text.includes('Car') || text.includes('Transit')) && mobilitySelected < 3) {
      console.log(`   🎯 Clicking mobility option: "${text.substring(0, 30)}..."`);
      await card.click();
      await page.waitForTimeout(300);
      mobilitySelected++;
    }
  }
  
  // Test 4: Tax considerations
  console.log('4. 💸 Testing tax considerations...');
  let taxSelected = 0;
  for (const card of cards) {
    const text = await page.evaluate(el => el.textContent, card);
    if (text.includes('Tax') && taxSelected < 2) {
      console.log(`   🎯 Clicking tax option: "${text.substring(0, 30)}..."`);
      await card.click();
      await page.waitForTimeout(300);
      taxSelected++;
    }
  }
  
  // Test 5: Check summary section
  console.log('5. 📋 Checking summary section...');
  const summaryElements = await page.$$('*');
  let summaryFound = false;
  for (const el of summaryElements) {
    const text = await page.evaluate(el => el.textContent, el);
    if (text.includes('Summary') || text.includes('Preferences Summary')) {
      console.log('   ✅ Found summary section');
      summaryFound = true;
      break;
    }
  }
  
  // Take screenshot after interactions
  await page.screenshot({ path: 'costs-page-after-tests.png', fullPage: true });
  console.log('📸 Post-interaction screenshot saved');
  
  // Test 6: Form submission
  console.log('6. 📝 Testing form submission...');
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Next') || text.includes('→') || text.includes('Save')) {
      console.log(`   🎯 Clicking submission button: "${text}"`);
      await btn.click();
      await page.waitForTimeout(2000);
      
      const newUrl = page.url();
      if (newUrl !== page.url()) {
        console.log(`   ✅ Navigation occurred: ${newUrl}`);
        
        // Test persistence
        console.log('7. 🔄 Testing data persistence...');
        await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: 'costs-page-persistence-test.png', fullPage: true });
        console.log('   📸 Persistence test screenshot saved');
      }
      break;
    }
  }
  
  console.log('\n✅ Costs page testing completed!');
  console.log('📊 Test Results Summary:');
  console.log(`   - Cards found: ${cards.length}`);
  console.log(`   - Grids found: ${grids.length}`);
  console.log(`   - Budget selection: ${budgetSelected ? 'Working' : 'Not tested'}`);
  console.log(`   - Mobility selections: ${mobilitySelected}`);
  console.log(`   - Tax selections: ${taxSelected}`);
  console.log(`   - Summary section: ${summaryFound ? 'Found' : 'Not found'}`);
}

testCostsPageDirect();