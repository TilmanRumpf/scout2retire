#!/usr/bin/env node

/**
 * Test that all compound buttons persist correctly after browser refresh
 * Specifically testing Walking & Cycling which was reported as not persisting
 */

import { chromium } from 'playwright';

const BUTTONS_TO_TEST = [
  // Activities
  { id: 'walking_cycling', name: 'Walking & Cycling' },
  { id: 'golf_tennis', name: 'Golf & Tennis' },
  { id: 'water_sports', name: 'Water Sports' },
  { id: 'water_crafts', name: 'Water Crafts' },
  { id: 'winter_sports', name: 'Winter Sports' },
  // Interests  
  { id: 'gardening', name: 'Gardening & Pets' },
  { id: 'arts', name: 'Arts & Crafts' },
  { id: 'music_theater', name: 'Music & Theater' },
  { id: 'cooking_wine', name: 'Cooking & Wine' },
  { id: 'history', name: 'Museums & History' }
];

async function testButtonPersistence() {
  console.log('🧪 TESTING COMPOUND BUTTON PERSISTENCE');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  try {
    // Navigate to hobbies page
    console.log('\n📍 Navigating to hobbies page...');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForTimeout(3000);
    
    // Test each button
    for (const button of BUTTONS_TO_TEST) {
      console.log(`\n🔍 Testing: ${button.name}`);
      
      // Clear any existing selections first
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Find and click the button
      const buttonElement = await page.locator(`text="${button.name}"`).first();
      
      if (await buttonElement.isVisible()) {
        // Click the button
        await buttonElement.click();
        console.log(`   ✓ Clicked ${button.name}`);
        
        // Wait for auto-save
        await page.waitForTimeout(2000);
        
        // Check if button shows as selected (has ring-2 or border-scout-accent class)
        const isSelectedBefore = await buttonElement.evaluate(el => {
          return el.className.includes('ring-2') || 
                 el.className.includes('border-scout-accent');
        });
        
        console.log(`   ✓ Selected state before refresh: ${isSelectedBefore ? '✅' : '❌'}`);
        
        // Refresh the page
        await page.reload();
        await page.waitForTimeout(2000);
        
        // Find the button again after refresh
        const buttonAfter = await page.locator(`text="${button.name}"`).first();
        
        // Check if still selected
        const isSelectedAfter = await buttonAfter.evaluate(el => {
          return el.className.includes('ring-2') || 
                 el.className.includes('border-scout-accent');
        });
        
        console.log(`   ✓ Selected state after refresh: ${isSelectedAfter ? '✅' : '❌'}`);
        
        // Record result
        const persists = isSelectedBefore && isSelectedAfter;
        results.push({
          button: button.name,
          persists: persists
        });
        
        if (persists) {
          console.log(`   ✅ PASS: ${button.name} persists correctly`);
        } else {
          console.log(`   ❌ FAIL: ${button.name} does NOT persist`);
        }
        
        // Deselect for next test
        if (isSelectedAfter) {
          await buttonAfter.click();
          await page.waitForTimeout(1500);
        }
      } else {
        console.log(`   ⚠️ Button not found: ${button.name}`);
        results.push({
          button: button.name,
          persists: false,
          error: 'Not found'
        });
      }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));
    
    const passed = results.filter(r => r.persists).length;
    const failed = results.filter(r => !r.persists).length;
    
    results.forEach(r => {
      const icon = r.persists ? '✅' : '❌';
      const status = r.error ? `(${r.error})` : r.persists ? 'PERSISTS' : 'FAILS';
      console.log(`${icon} ${r.button}: ${status}`);
    });
    
    console.log(`\nTotal: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('\n🎉 SUCCESS: All buttons persist correctly!');
    } else {
      console.log(`\n⚠️ ISSUES: ${failed} buttons don't persist`);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    console.log('\nBrowser will close in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testButtonPersistence().catch(console.error);