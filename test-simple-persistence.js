#!/usr/bin/env node

// Simple test to verify hobby button persistence
import { chromium } from 'playwright';

async function testPersistence() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('📍 Navigating to localhost:5173...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    // Check if we need to login
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/welcome') || currentUrl.includes('/auth')) {
      console.log('⚠️  Need to authenticate first');
      console.log('Please login manually in the browser');
      console.log('Then navigate to /onboarding/hobbies');
      console.log('Waiting 30 seconds for manual login...');
      await page.waitForTimeout(30000);
    }
    
    // Try to navigate to hobbies
    console.log('📍 Going to hobbies page...');
    await page.goto('http://localhost:5173/onboarding/hobbies');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ 
      path: 'test-results/hobbies-initial.png',
      fullPage: true 
    });
    
    // Look for any button that contains activity keywords
    console.log('🔍 Looking for activity buttons...');
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons total`);
    
    // Try to find and click a button containing "Walk" or "Golf"
    let clicked = false;
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && (text.includes('Walk') || text.includes('Golf') || text.includes('Water'))) {
        console.log(`👆 Clicking button: "${text}"`);
        await button.click();
        clicked = true;
        await page.waitForTimeout(2000); // Wait for save
        break;
      }
    }
    
    if (!clicked) {
      console.log('❌ No activity buttons found');
    }
    
    // Take screenshot after click
    await page.screenshot({ 
      path: 'test-results/hobbies-after-click.png',
      fullPage: true 
    });
    
    // Refresh
    console.log('🔄 Refreshing page...');
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/hobbies-after-refresh.png',
      fullPage: true 
    });
    
    console.log('✅ Test complete!');
    console.log('Check test-results/ folder for screenshots');
    console.log('Browser will remain open for inspection...');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

// Create test-results directory
import { mkdir } from 'fs/promises';
await mkdir('test-results', { recursive: true }).catch(() => {});

testPersistence();