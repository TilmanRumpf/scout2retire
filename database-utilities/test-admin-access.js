#!/usr/bin/env node

import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Testing admin access for tilman.rumpf@gmail.com...\n');

  const browser = await chromium.launch({
    headless: false,
    timeout: 30000
  });

  try {
    const page = await browser.newPage();

    // Navigate to localhost
    console.log('📍 Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for initial load
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: '/tmp/admin-test-1.png' });
    console.log('📸 Initial screenshot saved to /tmp/admin-test-1.png');

    // Check for admin gear icon in header
    console.log('\n🔍 Checking for admin gear icon in header...');
    const adminGearIcon = await page.locator('svg.w-6.h-6').first().isVisible().catch(() => false);
    console.log(adminGearIcon ? '✅ Admin gear icon is VISIBLE!' : '❌ Admin gear icon NOT visible');

    // Check hamburger menu for Admin Panel
    console.log('\n🔍 Checking QuickNav menu for Admin Panel...');
    try {
      const hamburger = page.locator('button[aria-label="Toggle menu"]').first();
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await page.waitForTimeout(1000);

        const adminPanelLink = await page.locator('text="Admin Panel"').isVisible().catch(() => false);
        console.log(adminPanelLink ? '✅ Admin Panel link is VISIBLE in menu!' : '❌ Admin Panel link NOT visible in menu');

        await page.screenshot({ path: '/tmp/admin-test-2-menu.png' });
        console.log('📸 Menu screenshot saved to /tmp/admin-test-2-menu.png');
      }
    } catch (e) {
      console.log('⚠️ Could not check hamburger menu:', e.message);
    }

    // Try direct navigation to admin
    console.log('\n🔍 Attempting direct navigation to /admin...');
    await page.goto('http://localhost:5173/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const onAdminPage = currentUrl.includes('/admin');
    console.log(onAdminPage
      ? `✅ Successfully accessed admin panel! URL: ${currentUrl}`
      : `❌ Redirected away from admin. Current URL: ${currentUrl}`);

    await page.screenshot({ path: '/tmp/admin-test-3-admin.png' });
    console.log('📸 Admin page screenshot saved to /tmp/admin-test-3-admin.png');

    // Check for Towns Manager content if on admin page
    if (onAdminPage) {
      const hasTownsManager = await page.locator('text="Towns Manager"').count() > 0;
      console.log(hasTownsManager ? '✅ Towns Manager content loaded!' : '❌ Towns Manager content not found');
    }

    console.log('\n📊 SUMMARY:');
    console.log('- Admin gear icon:', adminGearIcon ? '✅ VISIBLE' : '❌ NOT VISIBLE');
    console.log('- Admin panel access:', onAdminPage ? '✅ SUCCESS' : '❌ FAILED');
    console.log('\nScreenshots saved to /tmp/admin-test-*.png');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
})();