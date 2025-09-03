import { test, expect } from '@playwright/test';

// Test credentials - you'll need to update these
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

test.describe('Hobbies Onboarding Debug', () => {
  test('manual login and hobby selection', async ({ page }) => {
    // Enable console logging to see what's happening
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`Browser ${msg.type()}: ${msg.text()}`);
      }
    });

    // Go to login page
    await page.goto('/login');
    
    // Wait for you to manually login
    console.log('\n🔴 MANUAL STEP REQUIRED:');
    console.log('1. Enter your email and password');
    console.log('2. Click login');
    console.log('3. The test will continue automatically after login\n');
    
    // Wait for navigation away from login page (indicates successful login)
    await page.waitForURL((url) => !url.toString().includes('/login'), {
      timeout: 60000 // 60 seconds to login manually
    });
    
    console.log('✅ Login successful, navigating to hobbies page...');
    
    // Go directly to hobbies onboarding
    await page.goto('/onboarding/hobbies');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of initial state
    await page.screenshot({ 
      path: 'test-results/hobbies-1-initial.png',
      fullPage: true 
    });
    
    // Find and click some hobby checkboxes
    console.log('🎯 Looking for hobby checkboxes...');
    
    // Try to find hobby elements - adjust selector based on actual HTML
    const hobbyCheckboxes = page.locator('input[type="checkbox"]');
    const hobbyCount = await hobbyCheckboxes.count();
    console.log(`Found ${hobbyCount} hobby checkboxes`);
    
    if (hobbyCount > 0) {
      // Click first 3 hobbies
      for (let i = 0; i < Math.min(3, hobbyCount); i++) {
        await hobbyCheckboxes.nth(i).click();
        await page.waitForTimeout(500); // Small delay to see the selection
      }
      
      console.log('✅ Selected 3 hobbies');
      
      // Take screenshot after selection
      await page.screenshot({ 
        path: 'test-results/hobbies-2-selected.png',
        fullPage: true 
      });
    }
    
    // Look for save/continue button
    const saveButton = page.locator('button').filter({ hasText: /save|continue|next/i }).first();
    
    if (await saveButton.count() > 0) {
      console.log('📝 Clicking save/continue button...');
      
      // Intercept the API call to see what's being sent
      page.on('request', request => {
        if (request.url().includes('/api') || request.url().includes('supabase')) {
          console.log(`API Call: ${request.method()} ${request.url()}`);
          if (request.postData()) {
            console.log(`Request body: ${request.postData()}`);
          }
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('/api') || response.url().includes('supabase')) {
          console.log(`API Response: ${response.status()} ${response.url()}`);
        }
      });
      
      await saveButton.click();
      
      // Wait a bit to see what happens
      await page.waitForTimeout(3000);
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'test-results/hobbies-3-after-save.png',
        fullPage: true 
      });
      
      console.log('✅ Test complete! Check test-results/ folder for screenshots');
    } else {
      console.log('❌ Could not find save/continue button');
    }
    
    // Keep browser open for manual inspection
    await page.pause();
  });
});