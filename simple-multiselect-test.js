import puppeteer from 'puppeteer';

async function testMultiSelectBudgetSimple() {
  console.log('🚀 Simple multi-select budget test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 1024 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. 📱 Navigating to costs page...');
    await page.goto('http://localhost:5173/onboarding/costs', { 
      waitUntil: 'domcontentloaded' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take initial screenshot regardless of auth state
    await page.screenshot({ 
      path: 'simple-multiselect-initial.png', 
      fullPage: true 
    });
    console.log('2. 📸 Initial screenshot saved');
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/costs')) {
      console.log('✅ On costs page - testing multi-select functionality');
      
      // Look for all buttons on the page
      const allButtons = await page.$$('button');
      console.log(`   Found ${allButtons.length} buttons on page`);
      
      // Try to find and click budget buttons
      let budgetClicks = 0;
      for (let i = 0; i < allButtons.length && budgetClicks < 3; i++) {
        try {
          const text = await page.evaluate(el => el.textContent, allButtons[i]);
          
          // Look for budget-related buttons
          if (text.includes('$2,000') || text.includes('$3,000') || text.includes('$4,000')) {
            await allButtons[i].click();
            await new Promise(resolve => setTimeout(resolve, 500));
            budgetClicks++;
            console.log(`   ✅ Clicked budget option: ${text.trim()}`);
            
            // Check if button shows as selected
            const hasCheckmark = await page.evaluate(btn => {
              const checkIcon = btn.querySelector('[class*="Check"]');
              const hasAccentBorder = btn.classList.contains('border-scout-accent-500');
              const hasAccentBg = btn.classList.contains('bg-scout-accent-50');
              return checkIcon !== null || hasAccentBorder || hasAccentBg;
            }, allButtons[i]);
            
            console.log(`     ${hasCheckmark ? '✅' : '❌'} Shows visual selection indicator`);
          }
        } catch (e) {
          // Continue if interaction fails
        }
      }
      
      // Take screenshot after selections
      await page.screenshot({ 
        path: 'simple-multiselect-selections.png', 
        fullPage: true 
      });
      console.log('3. 📸 Selections screenshot saved');
      
      // Look for summary text
      const bodyText = await page.evaluate(() => document.body.textContent);
      const hasMultipleBudgetSelections = (bodyText.match(/\$2,000|\$3,000|\$4,000/g) || []).length > 2;
      console.log(`   ${hasMultipleBudgetSelections ? '✅' : '❌'} Multiple budget selections visible in content`);
      
      // Try to submit form
      const nextButtons = await page.$$('button[type="submit"], button');
      for (const btn of nextButtons) {
        try {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text.includes('Next') || text.includes('→')) {
            await btn.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('4. ✅ Clicked Next button');
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      const finalUrl = page.url();
      console.log(`   Final URL: ${finalUrl}`);
      
      if (finalUrl !== currentUrl) {
        console.log('5. ✅ Form submission caused navigation');
        
        // Test persistence by going back
        await page.goto('http://localhost:5173/onboarding/costs');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.screenshot({ 
          path: 'simple-multiselect-persistence.png', 
          fullPage: true 
        });
        console.log('6. 📸 Persistence screenshot saved');
        
        // Check for persisted selections
        const persistedButtons = await page.evaluate(() => {
          const selected = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.classList.contains('border-scout-accent-500') ||
            btn.querySelector('[class*="Check"]') !== null ||
            btn.classList.contains('bg-scout-accent-50')
          );
          return selected.length;
        });
        
        console.log(`   ${persistedButtons > 0 ? '✅' : '❌'} Found ${persistedButtons} persisted selections`);
      }
      
    } else {
      console.log('❌ Not on costs page - authentication may be required');
      console.log('   The page likely redirected to welcome/login');
      
      // Check if we can see any form elements
      const formElements = await page.$$('input, button, select');
      console.log(`   Found ${formElements.length} form elements (may be login form)`);
    }
    
    console.log('\n🎉 Simple test completed!');
    console.log('\n📸 Screenshots generated:');
    console.log('  - simple-multiselect-initial.png');
    console.log('  - simple-multiselect-selections.png (if on costs page)');
    console.log('  - simple-multiselect-persistence.png (if form submitted)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    try {
      await page.screenshot({ 
        path: 'simple-multiselect-error.png', 
        fullPage: true 
      });
      console.log('📸 Error screenshot saved');
    } catch (e) {
      console.log('Failed to take error screenshot');
    }
  } finally {
    await browser.close();
  }
}

testMultiSelectBudgetSimple();