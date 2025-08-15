const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testCostsPage() {
  let browser;
  let results = {
    screenshots: [],
    tests: [],
    success: true,
    errors: []
  };

  try {
    console.log('🚀 Starting costs page testing...');
    
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1280, height: 1024 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set up error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
        results.errors.push(`Console Error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
      results.errors.push(`Page Error: ${error.message}`);
    });

    console.log('📱 Navigating to costs page...');
    await page.goto('http://localhost:5173/onboarding/costs', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });

    // Wait for page to load
    await page.waitForSelector('main', { timeout: 5000 });
    
    // 1. Take initial screenshot
    console.log('📸 Taking initial screenshot...');
    const screenshotPath = path.join(__dirname, 'test-results', `costs-page-initial-${Date.now()}.png`);
    await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    results.screenshots.push(screenshotPath);
    results.tests.push('✅ Initial page load and screenshot');

    // 2. Check SelectionCard-based layout
    console.log('🔍 Checking SelectionCard layout...');
    const budgetCards = await page.$$('[data-testid="selection-card"], .grid button[type="button"]');
    if (budgetCards.length > 0) {
      results.tests.push(`✅ Found ${budgetCards.length} SelectionCard components`);
    } else {
      results.tests.push('❌ No SelectionCard components found');
      results.success = false;
    }

    // 3. Test budget tier selection
    console.log('💰 Testing budget tier selection...');
    const budgetTierCards = await page.$$('form > div:first-of-type .grid button');
    if (budgetTierCards.length >= 5) {
      // Click the $3,000-4,000 tier
      await budgetTierCards[2].click();
      await page.waitForTimeout(500);
      
      const isSelected = await budgetTierCards[2].evaluate(el => 
        el.classList.contains('border-scout-accent-500') || 
        el.querySelector('.bg-scout-accent-500')
      );
      
      if (isSelected) {
        results.tests.push('✅ Budget tier selection works');
      } else {
        results.tests.push('❌ Budget tier selection not working');
        results.success = false;
      }
    }

    // 4. Test mobility options - single selection per category
    console.log('🚗 Testing mobility options...');
    
    // Test local mobility
    const localMobilityCards = await page.$$('[data-mobility-type="local"] button, .grid button:has-text("Walk/Bike"), h4:has-text("Local Mobility") + .grid button');
    if (localMobilityCards.length > 0) {
      // Click first option
      await localMobilityCards[0].click();
      await page.waitForTimeout(300);
      
      // Try clicking second option - should deselect first
      if (localMobilityCards[1]) {
        await localMobilityCards[1].click();
        await page.waitForTimeout(300);
        
        const firstSelected = await localMobilityCards[0].evaluate(el => 
          el.classList.contains('border-scout-accent-500')
        );
        const secondSelected = await localMobilityCards[1].evaluate(el => 
          el.classList.contains('border-scout-accent-500')
        );
        
        if (!firstSelected && secondSelected) {
          results.tests.push('✅ Single selection per mobility category works');
        } else {
          results.tests.push('❌ Multiple mobility selections allowed (should be single)');
          results.success = false;
        }
      }
    }

    // 5. Test tax consideration toggles
    console.log('💸 Testing tax consideration toggles...');
    const taxCards = await page.$$('h2:has-text("Tax Considerations") ~ .grid button, [data-tax-type] button');
    if (taxCards.length >= 3) {
      // Toggle property tax
      await taxCards[0].click();
      await page.waitForTimeout(300);
      
      // Toggle sales tax
      await taxCards[1].click();
      await page.waitForTimeout(300);
      
      const propertyTaxSelected = await taxCards[0].evaluate(el => 
        el.classList.contains('border-scout-accent-500')
      );
      const salesTaxSelected = await taxCards[1].evaluate(el => 
        el.classList.contains('border-scout-accent-500')
      );
      
      if (propertyTaxSelected && salesTaxSelected) {
        results.tests.push('✅ Tax consideration toggles work (multiple selection allowed)');
      } else {
        results.tests.push('❌ Tax consideration toggles not working');
        results.success = false;
      }
    }

    // 6. Check summary section updates
    console.log('📋 Checking summary section...');
    const summarySection = await page.$('.p-3.lg\\:p-4, [data-summary], .bg-gray-50');
    if (summarySection) {
      const summaryText = await summarySection.textContent();
      if (summaryText.includes('Your Preferences Summary') && summaryText.includes('Total Budget')) {
        results.tests.push('✅ Summary section present and contains expected content');
      } else {
        results.tests.push('❌ Summary section missing or incomplete');
        results.success = false;
      }
    }

    // 7. Take screenshot after interactions
    console.log('📸 Taking post-interaction screenshot...');
    const postInteractionPath = path.join(__dirname, 'test-results', `costs-page-after-selections-${Date.now()}.png`);
    await page.screenshot({ path: postInteractionPath, fullPage: true });
    results.screenshots.push(postInteractionPath);

    // 8. Test form submission
    console.log('📝 Testing form submission...');
    const nextButton = await page.$('button[type="submit"], button:has-text("Next")');
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Check if we navigated to review page
      const currentUrl = page.url();
      if (currentUrl.includes('/onboarding/review')) {
        results.tests.push('✅ Form submission works - navigated to review page');
        
        // 9. Navigate back to costs page to test persistence
        console.log('🔄 Testing data persistence...');
        await page.goto('http://localhost:5173/onboarding/costs', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);
        
        // Check if selections are still there
        const persistedSelections = await page.$$('.border-scout-accent-500');
        if (persistedSelections.length > 0) {
          results.tests.push('✅ Data persistence works - selections maintained after navigation');
        } else {
          results.tests.push('❌ Data persistence not working - selections lost');
          results.success = false;
        }
        
        // Take final screenshot
        const finalPath = path.join(__dirname, 'test-results', `costs-page-persistence-${Date.now()}.png`);
        await page.screenshot({ path: finalPath, fullPage: true });
        results.screenshots.push(finalPath);
        
      } else {
        results.tests.push('❌ Form submission failed - did not navigate to review page');
        results.success = false;
      }
    } else {
      results.tests.push('❌ Next button not found');
      results.success = false;
    }

    // 10. Check consistency with other onboarding pages
    console.log('🎨 Checking design consistency...');
    
    // Check for consistent UI elements
    const hasProTip = await page.$('.bg-scout-accent\\/10, [data-pro-tip]');
    const hasBottomNav = await page.$('.fixed.bottom-0, .sticky');
    const hasSelectionSections = await page.$$('label.text-base.lg\\:text-lg').length > 0;
    
    let consistencyScore = 0;
    if (hasProTip) consistencyScore++;
    if (hasBottomNav) consistencyScore++;
    if (hasSelectionSections) consistencyScore++;
    
    if (consistencyScore >= 2) {
      results.tests.push('✅ UI consistency with other onboarding pages (ProTip, navigation, sections)');
    } else {
      results.tests.push('❌ UI inconsistency detected with other onboarding pages');
      results.success = false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.errors.push(`Test Error: ${error.message}`);
    results.success = false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}

// Run the test
testCostsPage().then(results => {
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('=' * 50);
  
  results.tests.forEach(test => console.log(test));
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => console.log(`  ${error}`));
  }
  
  if (results.screenshots.length > 0) {
    console.log('\n📸 SCREENSHOTS:');
    results.screenshots.forEach(path => console.log(`  ${path}`));
  }
  
  console.log(`\n${results.success ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  process.exit(results.success ? 0 : 1);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});