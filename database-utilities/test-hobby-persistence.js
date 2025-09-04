#!/usr/bin/env node

import { chromium } from 'playwright';

async function testHobbyPersistence() {
  console.log('🔍 TESTING HOBBY BUTTON PERSISTENCE');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to hobbies page
    console.log('\n1️⃣ Navigating to hobbies page...');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForTimeout(2000);
    
    // Check initial state by looking for selected cards
    console.log('\n2️⃣ Checking initial button states...');
    
    // Count selected activity buttons (they have specific styling when selected)
    const selectedBeforeCount = await page.$$eval(
      '.ring-2.ring-scout-primary-500',
      elements => elements.length
    ).catch(() => 0);
    
    console.log(`Selected buttons BEFORE refresh: ${selectedBeforeCount}`);
    
    // Take screenshot before refresh
    await page.screenshot({ 
      path: 'before-refresh.png',
      fullPage: false 
    });
    console.log('📸 Screenshot saved: before-refresh.png');
    
    // Refresh the page
    console.log('\n3️⃣ Refreshing page...');
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Check state after refresh
    console.log('\n4️⃣ Checking button states after refresh...');
    
    const selectedAfterCount = await page.$$eval(
      '.ring-2.ring-scout-primary-500',
      elements => elements.length
    ).catch(() => 0);
    
    console.log(`Selected buttons AFTER refresh: ${selectedAfterCount}`);
    
    // Take screenshot after refresh
    await page.screenshot({ 
      path: 'after-refresh.png',
      fullPage: false 
    });
    console.log('📸 Screenshot saved: after-refresh.png');
    
    // Compare
    console.log('\n📊 RESULTS:');
    if (selectedBeforeCount === selectedAfterCount && selectedBeforeCount > 0) {
      console.log(`✅ Selections PERSIST! ${selectedBeforeCount} buttons stay selected`);
    } else if (selectedAfterCount === 0) {
      console.log('❌ ALL selections LOST after refresh!');
    } else {
      console.log(`⚠️ Selection count changed: ${selectedBeforeCount} → ${selectedAfterCount}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testHobbyPersistence().catch(console.error);