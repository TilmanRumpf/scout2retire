#!/usr/bin/env node

/**
 * Focused test for Museums & History button persistence issue
 * This version includes login
 */

import { chromium } from 'playwright';

async function testMuseumsHistoryPersistence() {
  console.log('🧪 TESTING MUSEUMS & HISTORY BUTTON PERSISTENCE');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    devtools: true // Open devtools to see console logs
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console messages from the page
  page.on('console', msg => {
    const text = msg.text();
    // Filter for our debug messages
    if (text.includes('HISTORY') || text.includes('history') || 
        text.includes('DEBUG') || text.includes('SAVE') || 
        text.includes('LOADING') || text.includes('interest_')) {
      console.log(`  [BROWSER]: ${text}`);
    }
  });
  
  try {
    // First, navigate to login page
    console.log('\n📍 Navigating to login page...');
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(2000);
    
    // Click Log In button
    const loginButton = await page.locator('text="Log In"');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      console.log('  ✓ Clicked Log In button');
      await page.waitForTimeout(2000);
      
      // Fill in login credentials
      console.log('  📝 Entering credentials...');
      await page.fill('input[type="email"]', 'tobiasrumpf@gmx.de');
      await page.fill('input[type="password"]', 'password123');
      
      // Submit login form
      const submitButton = await page.locator('button[type="submit"]');
      await submitButton.click();
      console.log('  ✓ Submitted login form');
      
      // Wait for navigation
      await page.waitForTimeout(3000);
    }
    
    // Navigate to hobbies page
    console.log('\n📍 Navigating to hobbies page...');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/museums-logged-in.png', fullPage: true });
    console.log('  ✓ Saved screenshot: museums-logged-in.png');
    
    // Scroll down to find the Interests section
    console.log('\n🔍 Looking for Museums & History button...');
    
    // Try scrolling down to find interests section
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
    
    // Find Museums & History button - try different selectors
    let museumsButton = await page.locator('text="Museums & History"').first();
    
    // If not visible, try scrolling more
    if (!(await museumsButton.isVisible())) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      museumsButton = await page.locator('button:has-text("Museums & History")').first();
    }
    
    if (await museumsButton.isVisible()) {
      console.log('  ✓ Found Museums & History button');
      
      // Check initial state
      const initialSelected = await museumsButton.evaluate(el => {
        return el.className.includes('ring-2') || 
               el.className.includes('border-scout-accent') ||
               el.className.includes('border-2');
      });
      console.log(`  Initial state: ${initialSelected ? 'SELECTED' : 'NOT SELECTED'}`);
      
      // If already selected, deselect first
      if (initialSelected) {
        console.log('  Button already selected, deselecting first...');
        await museumsButton.click();
        await page.waitForTimeout(2000);
      }
      
      // Click to select the button
      await museumsButton.click();
      console.log('  ✓ Clicked Museums & History button to SELECT');
      
      // Wait for auto-save (1 second delay + processing time)
      console.log('  ⏳ Waiting for auto-save...');
      await page.waitForTimeout(2500);
      
      // Check state after click
      const afterClickSelected = await museumsButton.evaluate(el => {
        return el.className.includes('ring-2') || 
               el.className.includes('border-scout-accent') ||
               el.className.includes('border-2');
      });
      console.log(`  After click: ${afterClickSelected ? '✅ SELECTED' : '❌ NOT SELECTED'}`);
      
      // Take screenshot after selection
      await page.screenshot({ path: 'test-results/museums-after-select.png', fullPage: true });
      console.log('  ✓ Saved screenshot: museums-after-select.png');
      
      // Now refresh the page
      console.log('\n🔄 Refreshing browser...');
      await page.reload();
      await page.waitForTimeout(3000);
      
      // Scroll down again to find interests
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      
      // Find button again after refresh
      const buttonAfterRefresh = await page.locator('text="Museums & History"').first();
      
      if (await buttonAfterRefresh.isVisible()) {
        // Check state after refresh
        const afterRefreshSelected = await buttonAfterRefresh.evaluate(el => {
          return el.className.includes('ring-2') || 
                 el.className.includes('border-scout-accent') ||
                 el.className.includes('border-2');
        });
        
        // Take final screenshot
        await page.screenshot({ path: 'test-results/museums-after-refresh.png', fullPage: true });
        console.log('  ✓ Saved screenshot: museums-after-refresh.png');
        
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST RESULTS:');
        console.log('=' .repeat(60));
        console.log(`  Initial state: ${initialSelected ? 'SELECTED' : 'NOT SELECTED'}`);
        console.log(`  After click:  ${afterClickSelected ? 'SELECTED' : 'NOT SELECTED'}`);
        console.log(`  After refresh: ${afterRefreshSelected ? 'SELECTED' : 'NOT SELECTED'}`);
        
        if (afterClickSelected && afterRefreshSelected) {
          console.log('\n✅ SUCCESS: Museums & History button persists after refresh!');
        } else if (!afterClickSelected) {
          console.log('\n❌ FAIL: Button not selected after click');
        } else {
          console.log('\n❌ FAIL: Museums & History button does NOT persist after refresh');
          console.log('\nCheck the console logs above for debug information.');
          console.log('Look for:');
          console.log('  - "custom_activities being saved" should include "interest_history"');
          console.log('  - "loadedCompoundButtons" should include "interest_history" on refresh');
          console.log('  - "reconstructedInterests" should include "history" after processing');
        }
      } else {
        console.log('❌ Button not found after refresh!');
      }
    } else {
      console.log('❌ Museums & History button not found!');
      console.log('Check the screenshot to see what\'s on the page.');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    console.log('\nTest complete. Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testMuseumsHistoryPersistence().catch(console.error);