#!/usr/bin/env node

import { chromium } from 'playwright';

async function testHobbyPersistence() {
  console.log('🧪 TESTING HOBBY BUTTON PERSISTENCE FIX');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  const page = await browser.newPage();
  
  try {
    // Navigate to hobbies page
    console.log('\n1️⃣ Navigating to hobbies page...');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForTimeout(2000);
    
    // Clear any existing selections first
    console.log('\n2️⃣ Clearing existing selections...');
    
    // Count initially selected buttons
    const initialCount = await page.$$eval(
      'button.ring-2.ring-scout-primary-500, button[class*="border-scout-accent-500"]',
      elements => elements.length
    ).catch(() => 0);
    console.log(`Initially selected: ${initialCount} buttons`);
    
    // Select specific compound buttons
    console.log('\n3️⃣ Selecting compound buttons...');
    
    // Click Water Sports button
    const waterSportsBtn = page.locator('text=Water Sports').first();
    if (await waterSportsBtn.isVisible()) {
      await waterSportsBtn.click();
      console.log('   ✅ Clicked Water Sports');
      await page.waitForTimeout(1500); // Wait for auto-save
    }
    
    // Click Golf & Tennis button
    const golfBtn = page.locator('text=Golf & Tennis').first();
    if (await golfBtn.isVisible()) {
      await golfBtn.click();
      console.log('   ✅ Clicked Golf & Tennis');
      await page.waitForTimeout(1500); // Wait for auto-save
    }
    
    // Count selected buttons after clicking
    const afterClickCount = await page.$$eval(
      'button.ring-2.ring-scout-primary-500, button[class*="border-scout-accent-500"]',
      elements => elements.length
    ).catch(() => 0);
    console.log(`\nAfter clicking: ${afterClickCount} buttons selected`);
    
    // Take screenshot before refresh
    await page.screenshot({ 
      path: 'test-results/before-refresh.png',
      fullPage: false 
    });
    console.log('📸 Screenshot saved: before-refresh.png');
    
    // Wait for auto-save to complete
    console.log('\n4️⃣ Waiting for auto-save to complete...');
    await page.waitForTimeout(2000);
    
    // Refresh the page
    console.log('\n5️⃣ Refreshing page...');
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Count selected buttons after refresh
    const afterRefreshCount = await page.$$eval(
      'button.ring-2.ring-scout-primary-500, button[class*="border-scout-accent-500"]',
      elements => elements.length
    ).catch(() => 0);
    console.log(`\nAfter refresh: ${afterRefreshCount} buttons selected`);
    
    // Take screenshot after refresh
    await page.screenshot({ 
      path: 'test-results/after-refresh.png',
      fullPage: false 
    });
    console.log('📸 Screenshot saved: after-refresh.png');
    
    // Check specific buttons
    console.log('\n6️⃣ Checking specific buttons...');
    const waterSportsAfter = await page.locator('text=Water Sports').first()
      .evaluate(el => el.className.includes('ring-2') || el.className.includes('border-scout-accent'));
    const golfAfter = await page.locator('text=Golf & Tennis').first()
      .evaluate(el => el.className.includes('ring-2') || el.className.includes('border-scout-accent'));
    
    console.log(`   Water Sports selected: ${waterSportsAfter ? '✅' : '❌'}`);
    console.log(`   Golf & Tennis selected: ${golfAfter ? '✅' : '❌'}`);
    
    // Final results
    console.log('\n📊 RESULTS:');
    console.log('=' .repeat(60));
    
    if (afterRefreshCount === afterClickCount && afterRefreshCount > 0) {
      console.log(`✅ SUCCESS! Selections persist across refresh`);
      console.log(`   ${afterRefreshCount} buttons remain selected`);
    } else if (afterRefreshCount === 0) {
      console.log('❌ FAILURE: All selections lost after refresh!');
    } else {
      console.log(`⚠️  PARTIAL: Selection count changed`);
      console.log(`   Before: ${afterClickCount} → After: ${afterRefreshCount}`);
    }
    
    // Check console errors
    console.log('\n7️⃣ Checking console for errors...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   ❌ Console error:', msg.text());
      }
    });
    
    // Navigate away and back to test full navigation
    console.log('\n8️⃣ Testing full navigation...');
    await page.goto('http://localhost:5173/onboarding/culture');
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForTimeout(2000);
    
    const afterNavCount = await page.$$eval(
      'button.ring-2.ring-scout-primary-500, button[class*="border-scout-accent-500"]',
      elements => elements.length
    ).catch(() => 0);
    
    console.log(`After full navigation: ${afterNavCount} buttons selected`);
    
    if (afterNavCount === afterRefreshCount && afterNavCount > 0) {
      console.log('✅ Selections persist across full navigation!');
    } else {
      console.log('❌ Selections lost during navigation');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    console.log('\n9️⃣ Test complete. Browser will close in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Create test-results directory if it doesn't exist
import { mkdir } from 'fs/promises';
await mkdir('test-results', { recursive: true }).catch(() => {});

testHobbyPersistence().catch(console.error);