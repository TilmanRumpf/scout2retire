import puppeteer from 'puppeteer';

async function testCostsPageWithAuthBypass() {
  console.log('🚀 Testing costs page with auth bypass...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 1024 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. 🔑 Setting up authentication bypass...');
    
    // Go to the home page first to establish the domain
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    
    // Set up a mock Supabase session to bypass authentication
    await page.evaluate(() => {
      // Mock Supabase session
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: {
          id: '1665c069-5ecf-4616-9e81-4c62cc6e612c',
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated'
        }
      };
      
      // Set in localStorage (Supabase typically uses this)
      localStorage.setItem('sb-axlruvvsjepsulcbqlho-auth-token', JSON.stringify({
        currentSession: mockSession,
        expiresAt: Date.now() + 3600000
      }));
      
      // Also set in sessionStorage as backup
      sessionStorage.setItem('user-authenticated', 'true');
      sessionStorage.setItem('user-id', '1665c069-5ecf-4616-9e81-4c62cc6e612c');
      sessionStorage.setItem('user-email', 'test@example.com');
    });
    
    console.log('   ✅ Mock authentication set up');
    
    console.log('2. 🎯 Navigating to costs page...');
    await page.goto('http://localhost:5173/onboarding/costs', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Take initial screenshot
    await page.screenshot({ path: 'costs-page-with-auth.png', fullPage: true });
    console.log('   📸 Initial screenshot saved as costs-page-with-auth.png');
    
    if (currentUrl.includes('/costs')) {
      console.log('✅ SUCCESS: Reached costs page!');
      await runFullCostsPageTests(page);
    } else {
      console.log('🔄 Not on costs page, analyzing current page...');
      
      // Check what page we're actually on
      const pageTitle = await page.title();
      const heading = await page.$eval('h1, h2, h3', el => el.textContent).catch(() => 'No heading found');
      
      console.log(`   Page title: ${pageTitle}`);
      console.log(`   Main heading: ${heading}`);
      
      // If we're on an onboarding page, try to navigate through
      if (currentUrl.includes('/onboarding/')) {
        console.log('   🔄 On onboarding flow, attempting to navigate to costs...');
        await navigateToOnboardingCosts(page);
      } else {
        // Try direct URL manipulation
        console.log('   🔄 Trying alternative routes...');
        const alternativeUrls = [
          'http://localhost:5173/onboarding/budget',
          'http://localhost:5173/onboarding/financial',
          'http://localhost:5173/onboarding/money'
        ];
        
        for (const url of alternativeUrls) {
          await page.goto(url, { waitUntil: 'domcontentloaded' });
          if (page.url().includes('/costs') || page.url().includes('/budget')) {
            console.log(`   ✅ Found costs page at: ${page.url()}`);
            await runFullCostsPageTests(page);
            break;
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ path: 'costs-page-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as costs-page-error.png');
  } finally {
    await browser.close();
  }
}

async function navigateToOnboardingCosts(page) {
  console.log('   🧭 Attempting onboarding navigation...');
  
  // Look for navigation links or buttons that might lead to costs
  const links = await page.$$('a, button');
  
  for (const link of links) {
    const text = await page.evaluate(el => el.textContent.toLowerCase(), link);
    const href = await page.evaluate(el => el.href || el.onclick, link);
    
    if (text.includes('cost') || text.includes('budget') || text.includes('money') || 
        text.includes('financial') || href?.includes('/costs')) {
      console.log(`   🎯 Found potential costs link: "${text}"`);
      try {
        await link.click();
        await page.waitForTimeout(2000);
        
        if (page.url().includes('/costs')) {
          console.log('   ✅ Successfully navigated to costs page!');
          await runFullCostsPageTests(page);
          return;
        }
      } catch (e) {
        console.log(`   ❌ Failed to click link: ${e.message}`);
      }
    }
  }
  
  // If no direct links, try step navigation
  console.log('   🔄 Trying step-by-step navigation...');
  const nextButtons = await page.$$('button');
  
  for (let i = 0; i < 5; i++) { // Try up to 5 steps
    for (const btn of nextButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Next') || text.includes('→') || text.includes('Skip')) {
        console.log(`   📍 Step ${i + 1}: Clicking "${text}"`);
        await btn.click();
        await page.waitForTimeout(1500);
        
        const currentUrl = page.url();
        if (currentUrl.includes('/costs')) {
          console.log('   ✅ Reached costs page through step navigation!');
          await runFullCostsPageTests(page);
          return;
        }
        break;
      }
    }
  }
}

async function runFullCostsPageTests(page) {
  console.log('\n🧪 Running comprehensive costs page tests...\n');
  
  // Take initial costs page screenshot
  await page.screenshot({ path: 'costs-page-loaded-final.png', fullPage: true });
  console.log('📸 Costs page loaded screenshot saved');
  
  // Test 1: Analyze SelectionCard layout
  console.log('1. 🎨 Analyzing SelectionCard layout...');
  
  const selectionCards = await page.$$('button[type="button"]');
  const grids = await page.$$('.grid');
  const selectionSections = await page.$$('[class*="mb-6"], [class*="mb-8"]');
  
  console.log(`   ✅ Found ${selectionCards.length} selection cards`);
  console.log(`   ✅ Found ${grids.length} grid layouts`);
  console.log(`   ✅ Found ${selectionSections.length} section containers`);
  
  // Check for specific UI elements
  const hasProTip = await page.$('[class*="bg-scout-accent"], [class*="lightbulb"]');
  const hasIcons = await page.$$('svg').length;
  
  console.log(`   ${hasProTip ? '✅' : '❌'} ProTip styling present`);
  console.log(`   ✅ Found ${hasIcons} icons/SVG elements`);
  
  // Test 2: Budget tier selection
  console.log('\n2. 💰 Testing budget tier selection...');
  
  let budgetTierSelected = false;
  for (let i = 0; i < selectionCards.length; i++) {
    const text = await page.evaluate(el => el.textContent, selectionCards[i]);
    
    if (text.includes('$') && (text.includes('3,000') || text.includes('Flexible'))) {
      console.log(`   🎯 Selecting budget tier: "${text.trim().substring(0, 50)}..."`);
      await selectionCards[i].click();
      await page.waitForTimeout(500);
      
      // Check if it's visually selected
      const isSelected = await page.evaluate(el => {
        return el.classList.contains('border-scout-accent-500') || 
               el.querySelector('.bg-scout-accent-500') !== null ||
               el.classList.contains('bg-scout-accent-50');
      }, selectionCards[i]);
      
      console.log(`   ${isSelected ? '✅' : '❌'} Budget selection visual feedback`);
      budgetTierSelected = true;
      break;
    }
  }
  
  // Test 3: Mobility options (single selection per category)
  console.log('\n3. 🚗 Testing mobility options (single selection)...');
  
  let mobilityTestResults = {
    local: false,
    regional: false,
    international: false
  };
  
  // Test local mobility
  for (const card of selectionCards) {
    const text = await page.evaluate(el => el.textContent, card);
    if (text.includes('Walk') || text.includes('Public Transit')) {
      console.log(`   🎯 Selecting local mobility: "${text.trim().substring(0, 30)}..."`);
      await card.click();
      await page.waitForTimeout(300);
      
      // Try selecting another option in same category to test single selection
      for (const card2 of selectionCards) {
        const text2 = await page.evaluate(el => el.textContent, card2);
        if ((text2.includes('Own Vehicle') || text2.includes('Car')) && text2 !== text) {
          console.log(`   🔄 Testing single selection with: "${text2.trim().substring(0, 30)}..."`);
          await card2.click();
          await page.waitForTimeout(300);
          
          // Check if first selection was deselected
          const firstStillSelected = await page.evaluate(el => {
            return el.classList.contains('border-scout-accent-500') || 
                   el.querySelector('.bg-scout-accent-500') !== null;
          }, card);
          
          const secondSelected = await page.evaluate(el => {
            return el.classList.contains('border-scout-accent-500') || 
                   el.querySelector('.bg-scout-accent-500') !== null;
          }, card2);
          
          if (!firstStillSelected && secondSelected) {
            console.log(`   ✅ Single selection working correctly`);
            mobilityTestResults.local = true;
          } else {
            console.log(`   ❌ Single selection not working (multiple selected)`);
          }
          break;
        }
      }
      break;
    }
  }
  
  // Test 4: Tax consideration toggles (multiple allowed)
  console.log('\n4. 💸 Testing tax consideration toggles...');
  
  let taxOptionsSelected = 0;
  for (const card of selectionCards) {
    const text = await page.evaluate(el => el.textContent, card);
    if (text.includes('Property Tax') || text.includes('Sales Tax') || text.includes('Income Tax')) {
      console.log(`   🎯 Toggling tax option: "${text.trim().substring(0, 40)}..."`);
      await card.click();
      await page.waitForTimeout(300);
      
      const isSelected = await page.evaluate(el => {
        return el.classList.contains('border-scout-accent-500') || 
               el.querySelector('.bg-scout-accent-500') !== null;
      }, card);
      
      if (isSelected) {
        taxOptionsSelected++;
        console.log(`   ✅ Tax option ${taxOptionsSelected} selected`);
      }
      
      if (taxOptionsSelected >= 2) break; // Test multiple selections
    }
  }
  
  console.log(`   ${taxOptionsSelected >= 2 ? '✅' : '❌'} Multiple tax selections allowed: ${taxOptionsSelected} selected`);
  
  // Test 5: Summary section verification
  console.log('\n5. 📋 Checking summary section updates...');
  
  const summaryText = await page.evaluate(() => {
    const summaryElements = Array.from(document.querySelectorAll('*'))
      .filter(el => el.textContent.includes('Summary') || el.textContent.includes('Your Preferences'));
    return summaryElements.map(el => el.textContent).join(' ');
  });
  
  const summaryContainsBudget = summaryText.includes('Total Budget') || summaryText.includes('$');
  const summaryContainsTransport = summaryText.includes('Transportation') || summaryText.includes('Mobility');
  const summaryContainsTax = summaryText.includes('Tax') || summaryText.includes('concerns');
  
  console.log(`   ${summaryContainsBudget ? '✅' : '❌'} Summary shows budget information`);
  console.log(`   ${summaryContainsTransport ? '✅' : '❌'} Summary shows transportation preferences`);
  console.log(`   ${summaryContainsTax ? '✅' : '❌'} Summary shows tax considerations`);
  
  // Take screenshot after all interactions
  await page.screenshot({ path: 'costs-page-all-selections.png', fullPage: true });
  console.log('📸 Post-interaction screenshot saved');
  
  // Test 6: Form submission and navigation
  console.log('\n6. 📝 Testing form submission...');
  
  const submitButtons = await page.$$('button');
  let submitSuccess = false;
  
  for (const btn of submitButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Next') && text.includes('→')) {
      console.log(`   🎯 Clicking submit button: "${text.trim()}"`);
      
      const currentUrl = page.url();
      await btn.click();
      await page.waitForTimeout(2000);
      
      const newUrl = page.url();
      if (newUrl !== currentUrl) {
        console.log(`   ✅ Navigation successful: ${currentUrl} → ${newUrl}`);
        submitSuccess = true;
        
        // Test 7: Data persistence
        console.log('\n7. 🔄 Testing data persistence...');
        await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);
        
        // Check if any selections are still visible
        const persistedSelections = await page.$$('[class*="border-scout-accent-500"], [class*="bg-scout-accent-50"]');
        console.log(`   ${persistedSelections.length > 0 ? '✅' : '❌'} Data persistence: ${persistedSelections.length} selections maintained`);
        
        await page.screenshot({ path: 'costs-page-persistence-final.png', fullPage: true });
        console.log('   📸 Persistence test screenshot saved');
        
      } else {
        console.log(`   ❌ No navigation occurred after submit`);
      }
      break;
    }
  }
  
  // Test 8: UI consistency check
  console.log('\n8. 🎨 Checking UI consistency with other onboarding pages...');
  
  const consistencyChecks = {
    hasFixedBottomNav: await page.$('.fixed.bottom-0, .sticky') !== null,
    hasProTipStyling: await page.$('[class*="bg-scout-accent"]') !== null,
    hasIconsInSections: await page.$$('label svg, h2 svg, h3 svg').length > 0,
    hasResponsiveGrid: await page.$$('.grid.grid-cols-1.sm\\:grid-cols-2, .grid.grid-cols-1.lg\\:grid-cols-3').length > 0,
    hasSelectionCards: selectionCards.length > 10
  };
  
  console.log('   UI Consistency Results:');
  Object.entries(consistencyChecks).forEach(([check, passed]) => {
    console.log(`     ${passed ? '✅' : '❌'} ${check}`);
  });
  
  // Final summary
  console.log('\n📊 COMPREHENSIVE TEST SUMMARY:');
  console.log('=' * 50);
  console.log(`✅ Page Access: Successfully reached costs page`);
  console.log(`${budgetTierSelected ? '✅' : '❌'} Budget Selection: Working`);
  console.log(`${mobilityTestResults.local ? '✅' : '❌'} Mobility Single Selection: Working`);
  console.log(`${taxOptionsSelected >= 2 ? '✅' : '❌'} Tax Multiple Selection: Working (${taxOptionsSelected} selected)`);
  console.log(`${summaryContainsBudget || summaryContainsTransport ? '✅' : '❌'} Summary Updates: Working`);
  console.log(`${submitSuccess ? '✅' : '❌'} Form Submission: Working`);
  console.log(`UI Elements: ${selectionCards.length} cards, ${grids.length} grids, ${hasIcons} icons`);
  
  const overallScore = [
    budgetTierSelected,
    mobilityTestResults.local,
    taxOptionsSelected >= 2,
    summaryContainsBudget || summaryContainsTransport,
    submitSuccess,
    Object.values(consistencyChecks).filter(Boolean).length >= 3
  ].filter(Boolean).length;
  
  console.log(`\n🎯 Overall Score: ${overallScore}/6 tests passed`);
  console.log(overallScore >= 5 ? '🎉 EXCELLENT - Costs page working well!' : 
              overallScore >= 3 ? '⚠️  GOOD - Minor issues detected' : 
              '❌ POOR - Significant issues need attention');
}

testCostsPageWithAuthBypass();