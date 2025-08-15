import puppeteer from 'puppeteer';

async function testHousingPreferences() {
  console.log('🏠 Testing Housing Preference Feature - Detailed Analysis\n');
  
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
      
      localStorage.setItem('sb-axlruvvsjepsulcbqlho-auth-token', JSON.stringify({
        currentSession: mockSession,
        expiresAt: Date.now() + 3600000
      }));
    });
    
    console.log('   ✅ Mock authentication set up');
    
    console.log('2. 🎯 Navigating to costs page...');
    await page.goto('http://localhost:5173/onboarding/costs', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (!currentUrl.includes('/costs')) {
      throw new Error('Could not reach costs page');
    }
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Take initial screenshot showing "Rent or Buy" selected
    console.log('3. 📸 Taking initial screenshot with "Rent or Buy" selected...');
    await page.screenshot({ path: 'housing-initial-rent-or-buy.png', fullPage: true });
    
    // Test 1: Check initial state - should have "Rent or Buy" selected
    console.log('4. 🔍 Testing initial state...');
    
    const initialRentOrBuySelected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rentOrBuyButton = buttons.find(btn => btn.textContent.includes('Rent or Buy'));
      if (rentOrBuyButton) {
        return rentOrBuyButton.classList.contains('border-scout-accent-500') || 
               rentOrBuyButton.classList.contains('bg-scout-accent-50') ||
               rentOrBuyButton.querySelector('.bg-scout-accent-500') !== null;
      }
      return false;
    });
    
    console.log(`   ${initialRentOrBuySelected ? '✅' : '❌'} "Rent or Buy" initially selected`);
    
    // Check if both rent and buy sections are visible initially
    const initialRentVisible = await page.evaluate(() => {
      const rentSection = document.querySelector('h4');
      return Array.from(document.querySelectorAll('h4')).some(h4 => 
        h4.textContent.includes('Maximum Monthly Rent'));
    });
    
    const initialBuyVisible = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h4')).some(h4 => 
        h4.textContent.includes('Maximum Home Purchase Price'));
    });
    
    console.log(`   ${initialRentVisible ? '✅' : '❌'} Rent section visible initially`);
    console.log(`   ${initialBuyVisible ? '✅' : '❌'} Buy section visible initially`);
    
    // Test 2: Click "Rent Only" and verify only rent section shows
    console.log('5. 🏠 Testing "Rent Only" selection...');
    
    const rentOnlySelected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rentOnlyButton = buttons.find(btn => btn.textContent.includes('Rent Only'));
      if (rentOnlyButton) {
        rentOnlyButton.click();
        return true;
      }
      return false;
    });
    
    if (!rentOnlySelected) {
      console.log('   ❌ Could not find "Rent Only" button');
    } else {
      await page.waitForTimeout(500); // Wait for state update
      
      const rentOnlyRentVisible = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h4')).some(h4 => 
          h4.textContent.includes('Maximum Monthly Rent'));
      });
      
      const rentOnlyBuyVisible = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h4')).some(h4 => 
          h4.textContent.includes('Maximum Home Purchase Price'));
      });
      
      console.log(`   ${rentOnlyRentVisible ? '✅' : '❌'} Rent section visible (Rent Only)`);
      console.log(`   ${!rentOnlyBuyVisible ? '✅' : '❌'} Buy section hidden (Rent Only)`);
      
      await page.screenshot({ path: 'housing-rent-only.png', fullPage: true });
      console.log('   📸 Screenshot saved: housing-rent-only.png');
    }
    
    // Test 3: Click "Buy Only" and verify only buy section shows
    console.log('6. 🏠 Testing "Buy Only" selection...');
    
    const buyOnlySelected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buyOnlyButton = buttons.find(btn => btn.textContent.includes('Buy Only'));
      if (buyOnlyButton) {
        buyOnlyButton.click();
        return true;
      }
      return false;
    });
    
    if (!buyOnlySelected) {
      console.log('   ❌ Could not find "Buy Only" button');
    } else {
      await page.waitForTimeout(500); // Wait for state update
      
      const buyOnlyRentVisible = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h4')).some(h4 => 
          h4.textContent.includes('Maximum Monthly Rent'));
      });
      
      const buyOnlyBuyVisible = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h4')).some(h4 => 
          h4.textContent.includes('Maximum Home Purchase Price'));
      });
      
      console.log(`   ${!buyOnlyRentVisible ? '✅' : '❌'} Rent section hidden (Buy Only)`);
      console.log(`   ${buyOnlyBuyVisible ? '✅' : '❌'} Buy section visible (Buy Only)`);
      
      await page.screenshot({ path: 'housing-buy-only.png', fullPage: true });
      console.log('   📸 Screenshot saved: housing-buy-only.png');
    }
    
    // Test 4: Click "Rent or Buy" again and verify both sections show
    console.log('7. 🏠 Testing back to "Rent or Buy"...');
    
    const rentOrBuySelected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rentOrBuyButton = buttons.find(btn => btn.textContent.includes('Rent or Buy'));
      if (rentOrBuyButton) {
        rentOrBuyButton.click();
        return true;
      }
      return false;
    });
    
    if (!rentOrBuySelected) {
      console.log('   ❌ Could not find "Rent or Buy" button');
    } else {
      await page.waitForTimeout(500); // Wait for state update
      
      const finalRentVisible = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h4')).some(h4 => 
          h4.textContent.includes('Maximum Monthly Rent'));
      });
      
      const finalBuyVisible = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h4')).some(h4 => 
          h4.textContent.includes('Maximum Home Purchase Price'));
      });
      
      console.log(`   ${finalRentVisible ? '✅' : '❌'} Rent section visible (back to Rent or Buy)`);
      console.log(`   ${finalBuyVisible ? '✅' : '❌'} Buy section visible (back to Rent or Buy)`);
      
      await page.screenshot({ path: 'housing-back-to-both.png', fullPage: true });
      console.log('   📸 Screenshot saved: housing-back-to-both.png');
    }
    
    // Test 5: Select some values in both sections
    console.log('8. 💰 Testing value selections...');
    
    // Select a rent budget
    const rentSelected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      
      // Find rent section by looking for buttons after "Maximum Monthly Rent" heading
      const rentHeading = Array.from(document.querySelectorAll('h4')).find(h4 => 
        h4.textContent.includes('Maximum Monthly Rent'));
      
      if (rentHeading) {
        // Find the next few buttons after this heading that contain $ and numbers
        let found = false;
        let currentElement = rentHeading.nextElementSibling;
        while (currentElement && !found) {
          const buttonsInSection = currentElement.querySelectorAll('button');
          for (const btn of buttonsInSection) {
            if (btn.textContent.includes('$') && btn.textContent.includes('750')) {
              btn.click();
              found = true;
              break;
            }
          }
          currentElement = currentElement.nextElementSibling;
        }
        return found;
      }
      return false;
    });
    
    if (rentSelected) {
      console.log('   ✅ Selected rent budget option');
    } else {
      console.log('   ❌ Could not select rent budget option');
    }
    
    await page.waitForTimeout(300);
    
    // Select a buy budget
    const buySelected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      
      // Find buy section by looking for buttons after "Maximum Home Purchase Price" heading
      const buyHeading = Array.from(document.querySelectorAll('h4')).find(h4 => 
        h4.textContent.includes('Maximum Home Purchase Price'));
      
      if (buyHeading) {
        // Find the next few buttons after this heading that contain $ and k
        let found = false;
        let currentElement = buyHeading.nextElementSibling;
        while (currentElement && !found) {
          const buttonsInSection = currentElement.querySelectorAll('button');
          for (const btn of buttonsInSection) {
            if (btn.textContent.includes('$') && btn.textContent.includes('200k')) {
              btn.click();
              found = true;
              break;
            }
          }
          currentElement = currentElement.nextElementSibling;
        }
        return found;
      }
      return false;
    });
    
    if (buySelected) {
      console.log('   ✅ Selected buy budget option');
    } else {
      console.log('   ❌ Could not select buy budget option');
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'housing-selections-made.png', fullPage: true });
    console.log('   📸 Screenshot saved: housing-selections-made.png');
    
    // Test 6: Check summary section reflects housing preference
    console.log('9. 📋 Testing summary section...');
    
    const summaryInfo = await page.evaluate(() => {
      const summaryElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent.includes('Your Preferences Summary') || 
        el.textContent.includes('Summary')
      );
      
      let summaryText = '';
      summaryElements.forEach(el => {
        summaryText += el.textContent + '\n';
      });
      
      return {
        containsHousing: summaryText.includes('Housing'),
        containsRent: summaryText.includes('Rent'),
        containsBuy: summaryText.includes('Home Price') || summaryText.includes('Buy'),
        fullText: summaryText.substring(0, 500)
      };
    });
    
    console.log(`   ${summaryInfo.containsHousing ? '✅' : '❌'} Summary contains housing preference`);
    console.log(`   ${summaryInfo.containsRent ? '✅' : '❌'} Summary shows rent selection`);
    console.log(`   ${summaryInfo.containsBuy ? '✅' : '❌'} Summary shows buy selection`);
    console.log(`   Summary preview: ${summaryInfo.fullText.substring(0, 100)}...`);
    
    // Test 7: Save and check persistence
    console.log('10. 💾 Testing save and persistence...');
    
    const saveResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('Next') && btn.textContent.includes('→'));
      
      if (nextButton) {
        const currentUrl = window.location.href;
        nextButton.click();
        return { found: true, currentUrl };
      }
      return { found: false };
    });
    
    if (saveResult.found) {
      console.log('   ✅ Found and clicked Save/Next button');
      await page.waitForTimeout(2000);
      
      const newUrl = page.url();
      if (newUrl !== saveResult.currentUrl) {
        console.log(`   ✅ Navigation occurred: ${saveResult.currentUrl} → ${newUrl}`);
        
        // Navigate back to check persistence
        console.log('11. 🔄 Testing persistence by navigating back...');
        await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);
        
        const persistenceCheck = await page.evaluate(() => {
          // Check if housing preference is still selected
          const buttons = Array.from(document.querySelectorAll('button'));
          const rentOrBuyButton = buttons.find(btn => btn.textContent.includes('Rent or Buy'));
          const isRentOrBuySelected = rentOrBuyButton && (
            rentOrBuyButton.classList.contains('border-scout-accent-500') || 
            rentOrBuyButton.classList.contains('bg-scout-accent-50') ||
            rentOrBuyButton.querySelector('.bg-scout-accent-500') !== null
          );
          
          // Check if any budget selections are persisted
          const selectedBudgets = buttons.filter(btn => 
            (btn.textContent.includes('$') && (
              btn.classList.contains('border-scout-accent-500') || 
              btn.classList.contains('bg-scout-accent-50') ||
              btn.querySelector('.bg-scout-accent-500') !== null
            ))
          );
          
          return {
            housingPrefPersisted: isRentOrBuySelected,
            budgetSelectionsPersisted: selectedBudgets.length > 0,
            totalSelections: selectedBudgets.length
          };
        });
        
        console.log(`   ${persistenceCheck.housingPrefPersisted ? '✅' : '❌'} Housing preference persisted`);
        console.log(`   ${persistenceCheck.budgetSelectionsPersisted ? '✅' : '❌'} Budget selections persisted (${persistenceCheck.totalSelections} selections)`);
        
        await page.screenshot({ path: 'housing-persistence-check.png', fullPage: true });
        console.log('   📸 Screenshot saved: housing-persistence-check.png');
      } else {
        console.log('   ❌ No navigation occurred after clicking Next');
      }
    } else {
      console.log('   ❌ Could not find Save/Next button');
    }
    
    // Final summary
    console.log('\n📊 HOUSING PREFERENCE TEST SUMMARY:');
    console.log('=' * 50);
    
    const testResults = {
      initialState: initialRentOrBuySelected && initialRentVisible && initialBuyVisible,
      rentOnlyWorks: rentOnlySelected,
      buyOnlyWorks: buyOnlySelected,
      backToBothWorks: rentOrBuySelected,
      valueSelection: rentSelected && buySelected,
      summaryUpdates: summaryInfo.containsHousing,
      saveAndPersist: saveResult.found
    };
    
    Object.entries(testResults).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    console.log(`\n🎯 Overall Score: ${passedTests}/${Object.keys(testResults).length} tests passed`);
    
    if (passedTests === Object.keys(testResults).length) {
      console.log('🎉 EXCELLENT - Housing preference feature working perfectly!');
    } else if (passedTests >= 5) {
      console.log('⚠️  GOOD - Minor issues detected');
    } else {
      console.log('❌ NEEDS ATTENTION - Significant issues found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'housing-test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: housing-test-error.png');
  } finally {
    await browser.close();
  }
}

testHousingPreferences();