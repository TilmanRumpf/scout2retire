import puppeteer from 'puppeteer';

async function testWithExistingUser() {
  console.log('🚀 Testing multi-select with existing user session...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 1024 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. 📱 Setting up user session...');
    
    // Mock a user session by setting localStorage 
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    
    // Inject user session
    await page.evaluate(() => {
      // Mock Supabase auth
      const mockSession = {
        user: {
          id: '83d285b2-b21b-4d13-a1a1-6d51b6733d52', // User with multi-select mobility
          email: 'test@scout2retire.com',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        access_token: 'mock-token',
        expires_at: Date.now() + 3600000,
        token_type: 'bearer'
      };
      
      localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
      localStorage.setItem('sb-axlruvvsjepsulcbqlho-auth-token', JSON.stringify(mockSession));
    });
    
    console.log('2. 🔄 Navigating to costs page with user session...');
    await page.goto('http://localhost:5173/onboarding/costs', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot of costs page
    await page.screenshot({ 
      path: 'costs-page-with-user.png', 
      fullPage: true 
    });
    console.log('3. 📸 Costs page screenshot saved');
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/costs')) {
      console.log('✅ Successfully reached costs page with user session!');
      
      // Test multi-select functionality
      console.log('4. 💰 Testing budget multi-select functionality...');
      
      // Look for Total Monthly Budget section
      const budgetSectionExists = await page.$('h3, h4, h2');
      if (budgetSectionExists) {
        const headingText = await page.evaluate(el => el.textContent, budgetSectionExists);
        console.log(`   Found section heading: ${headingText}`);
      }
      
      // Find budget tier buttons
      const budgetButtons = await page.$$('button');
      console.log(`   Found ${budgetButtons.length} total buttons on page`);
      
      let budgetSelections = [];
      
      // Try to click multiple budget options
      for (let i = 0; i < budgetButtons.length; i++) {
        try {
          const buttonText = await page.evaluate(el => el.textContent, budgetButtons[i]);
          
          // Look for budget amounts - target $2k-3k and $3k-4k
          if ((buttonText.includes('$2,000') && buttonText.includes('3,000')) ||
              (buttonText.includes('$3,000') && buttonText.includes('4,000'))) {
            
            console.log(`   🎯 Found budget button: ${buttonText.trim()}`);
            
            // Click the button
            await budgetButtons[i].click();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if button shows as selected
            const isSelected = await page.evaluate(btn => {
              const hasCheckmark = btn.querySelector('[class*="Check"]') !== null;
              const hasAccentBorder = btn.classList.contains('border-scout-accent-500');
              const hasAccentBg = btn.classList.contains('bg-scout-accent-50');
              return hasCheckmark || hasAccentBorder || hasAccentBg;
            }, budgetButtons[i]);
            
            budgetSelections.push({
              text: buttonText.trim(),
              selected: isSelected
            });
            
            console.log(`   ${isSelected ? '✅' : '❌'} Selection ${budgetSelections.length}: ${buttonText.trim()}`);
            
            if (budgetSelections.length >= 2) break; // Stop after 2 selections
          }
        } catch (e) {
          // Continue on error
        }
      }
      
      // Take screenshot after selections
      await page.screenshot({ 
        path: 'costs-page-budget-selections.png', 
        fullPage: true 
      });
      console.log('5. 📸 Budget selections screenshot saved');
      
      // Check summary section
      console.log('6. 📋 Checking summary section...');
      const summaryText = await page.evaluate(() => {
        const summaryElements = document.querySelectorAll('div');
        for (const elem of summaryElements) {
          const text = elem.textContent;
          if (text.includes('Total Budget') || text.includes('Preferences Summary')) {
            return text;
          }
        }
        return null;
      });
      
      if (summaryText) {
        console.log(`   ✅ Found summary section`);
        const hasMultipleBudgets = (summaryText.match(/\$2,000|\$3,000|\$4,000/g) || []).length > 1;
        console.log(`   ${hasMultipleBudgets ? '✅' : '❌'} Summary shows multiple budget selections`);
        console.log(`   📝 Summary excerpt: ${summaryText.substring(0, 200)}...`);
      } else {
        console.log('   ❌ No summary section found');
      }
      
      // Test form submission
      console.log('7. 💾 Testing form submission...');
      const nextButton = await page.$('button[type="submit"], button:contains("Next")');
      if (!nextButton) {
        // Look for any button with "Next" text
        const allButtons = await page.$$('button');
        for (const btn of allButtons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text.includes('Next') || text.includes('→')) {
            await btn.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('   ✅ Clicked Next button');
            break;
          }
        }
      } else {
        await nextButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('   ✅ Clicked submit button');
      }
      
      const afterSubmitUrl = page.url();
      console.log(`   Post-submit URL: ${afterSubmitUrl}`);
      
      if (afterSubmitUrl !== currentUrl) {
        console.log('   ✅ Form submission caused navigation');
        
        // Test persistence
        console.log('8. 🔄 Testing data persistence...');
        await page.goto('http://localhost:5173/onboarding/costs', { 
          waitUntil: 'networkidle0' 
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for persisted selections
        const persistedSelections = await page.evaluate(() => {
          const selectedButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.classList.contains('border-scout-accent-500') ||
            btn.querySelector('[class*="Check"]') !== null ||
            btn.classList.contains('bg-scout-accent-50')
          );
          return selectedButtons.map(btn => btn.textContent.trim().substring(0, 50));
        });
        
        console.log(`   ${persistedSelections.length > 0 ? '✅' : '❌'} Found ${persistedSelections.length} persisted selections`);
        persistedSelections.forEach((selection, i) => {
          console.log(`     ${i + 1}. ${selection}...`);
        });
        
        await page.screenshot({ 
          path: 'costs-page-persistence-test.png', 
          fullPage: true 
        });
        console.log('9. 📸 Persistence test screenshot saved');
      } else {
        console.log('   ❌ Form submission did not cause navigation');
      }
      
      // Final report
      console.log('\n📊 Multi-Select Budget Test Results:');
      console.log(`   ✅ Successfully accessed costs page with user session`);
      console.log(`   ${budgetSelections.length > 0 ? '✅' : '❌'} Found and clicked ${budgetSelections.length} budget options`);
      budgetSelections.forEach((selection, i) => {
        console.log(`     ${i + 1}. ${selection.text}: ${selection.selected ? '✅ Selected' : '❌ Not visually selected'}`);
      });
      console.log(`   ${summaryText ? '✅' : '❌'} Summary section found and updated`);
      console.log(`   ${afterSubmitUrl !== currentUrl ? '✅' : '❌'} Form submission and navigation`);
      
    } else {
      console.log('❌ Still not on costs page - authentication issues persist');
      console.log(`   Final URL: ${currentUrl}`);
      
      // Check what page we're on
      const pageTitle = await page.title();
      const bodyText = await page.evaluate(() => document.body.textContent.substring(0, 200));
      console.log(`   Page title: ${pageTitle}`);
      console.log(`   Page content: ${bodyText}...`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    try {
      await page.screenshot({ 
        path: 'costs-page-user-test-error.png', 
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

testWithExistingUser();