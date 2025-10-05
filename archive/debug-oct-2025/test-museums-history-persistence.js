#!/usr/bin/env node

/**
 * Focused test for Museums & History button persistence issue
 * This test will:
 * 1. Navigate to hobbies page
 * 2. Click Museums & History button
 * 3. Wait for auto-save
 * 4. Refresh browser
 * 5. Check if button is still selected
 * 6. Also check console logs for debugging
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
    // Navigate to hobbies page
    console.log('\n📍 Navigating to hobbies page...');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/museums-before-click.png' });
    console.log('  ✓ Saved screenshot: museums-before-click.png');
    
    // Find Museums & History button
    console.log('\n🔍 Looking for Museums & History button...');
    const museumsButton = await page.locator('text="Museums & History"').first();
    
    if (await museumsButton.isVisible()) {
      console.log('  ✓ Found Museums & History button');
      
      // Check initial state
      const initialSelected = await museumsButton.evaluate(el => {
        return el.className.includes('ring-2') || 
               el.className.includes('border-scout-accent');
      });
      console.log(`  Initial state: ${initialSelected ? 'SELECTED' : 'NOT SELECTED'}`);
      
      // Click the button
      await museumsButton.click();
      console.log('  ✓ Clicked Museums & History button');
      
      // Wait for auto-save (1 second delay + processing time)
      console.log('  ⏳ Waiting for auto-save...');
      await page.waitForTimeout(2500);
      
      // Check state after click
      const afterClickSelected = await museumsButton.evaluate(el => {
        return el.className.includes('ring-2') || 
               el.className.includes('border-scout-accent');
      });
      console.log(`  After click: ${afterClickSelected ? '✅ SELECTED' : '❌ NOT SELECTED'}`);
      
      // Take screenshot after selection
      await page.screenshot({ path: 'test-results/museums-after-click.png' });
      console.log('  ✓ Saved screenshot: museums-after-click.png');
      
      // Now refresh the page
      console.log('\n🔄 Refreshing browser...');
      await page.reload();
      await page.waitForTimeout(3000);
      
      // Find button again after refresh
      const buttonAfterRefresh = await page.locator('text="Museums & History"').first();
      
      if (await buttonAfterRefresh.isVisible()) {
        // Check state after refresh
        const afterRefreshSelected = await buttonAfterRefresh.evaluate(el => {
          return el.className.includes('ring-2') || 
                 el.className.includes('border-scout-accent');
        });
        
        // Take final screenshot
        await page.screenshot({ path: 'test-results/museums-after-refresh.png' });
        console.log('  ✓ Saved screenshot: museums-after-refresh.png');
        
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST RESULTS:');
        console.log('=' .repeat(60));
        console.log(`  Before click: ${initialSelected ? 'SELECTED' : 'NOT SELECTED'}`);
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
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    console.log('\nBrowser will remain open for inspection...');
    console.log('Check the DevTools console for debug logs.');
    console.log('Press Ctrl+C to close when done.');
    
    // Keep browser open for inspection
    await new Promise(() => {});
  }
}

testMuseumsHistoryPersistence().catch(console.error);