import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testNotificationFlow() {
  console.log('🚀 Starting notification flow test...\n');

  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
  });

  // Listen for errors
  page.on('pageerror', error => {
    console.log('BROWSER ERROR:', error.message);
  });

  const results = {
    steps: []
  };

  try {
    // Step 1: Navigate to homepage
    console.log('📍 Step 1: Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 2: Check notification bell badge
    console.log('📍 Step 2: Checking notification bell badge...');
    await page.screenshot({
      path: path.join(screenshotsDir, '01-initial-bell.png'),
      fullPage: false
    });

    const bellBadge = await page.locator('[data-testid="notification-badge"], .notification-badge, .badge').first();
    const hasBadge = await bellBadge.isVisible().catch(() => false);
    const badgeCount = hasBadge ? await bellBadge.textContent() : '0';

    results.steps.push({
      step: 2,
      description: 'Bell shows badge',
      result: hasBadge ? 'YES' : 'NO',
      badgeCount: badgeCount
    });
    console.log(`   Badge visible: ${hasBadge}, Count: ${badgeCount}\n`);

    // Step 3: Click the bell icon
    console.log('📍 Step 3: Clicking notification bell...');
    const bellIcon = await page.locator('button[aria-label*="notification" i], button:has-text("🔔"), .notification-bell, [data-testid="notification-bell"]').first();
    await bellIcon.click();
    await page.waitForTimeout(1000);

    results.steps.push({
      step: 3,
      description: 'Clicked bell icon',
      result: 'YES'
    });

    // Step 4: Take screenshot of dropdown
    console.log('📍 Step 4: Checking dropdown for "New Friend Request"...');
    await page.screenshot({
      path: path.join(screenshotsDir, '02-dropdown-open.png'),
      fullPage: false
    });

    const friendRequestNotification = await page.locator('text="New Friend Request"').first();
    const hasNotification = await friendRequestNotification.isVisible().catch(() => false);

    results.steps.push({
      step: 5,
      description: 'Dropdown shows "New Friend Request"',
      result: hasNotification ? 'YES' : 'NO'
    });
    console.log(`   Friend request notification visible: ${hasNotification}\n`);

    if (!hasNotification) {
      console.log('❌ No friend request notification found. Checking what notifications are visible...');
      const notifications = await page.locator('.notification-item, [role="menuitem"]').all();
      console.log(`   Found ${notifications.length} notification items\n`);
      throw new Error('No friend request notification found');
    }

    // Step 6: Click on the notification
    console.log('📍 Step 6: Clicking "New Friend Request" notification...');
    await friendRequestNotification.click();
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const navigatedToChat = currentUrl.includes('/chat');

    results.steps.push({
      step: 7,
      description: 'Navigated to /chat page',
      result: navigatedToChat ? 'YES' : 'NO',
      url: currentUrl
    });
    console.log(`   Navigated to: ${currentUrl}`);
    console.log(`   Is /chat page: ${navigatedToChat}\n`);

    // Step 7: Check if Requests tab is open
    console.log('📍 Step 8: Checking if Requests tab opened automatically...');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '03-requests-tab.png'),
      fullPage: false
    });

    const requestsTab = await page.locator('button:has-text("Requests"), [data-tab="requests"]').first();
    const requestsTabActive = await requestsTab.getAttribute('class').then(c => c.includes('active') || c.includes('selected')).catch(() => false);

    results.steps.push({
      step: 8,
      description: 'Requests tab opened (not Friends)',
      result: requestsTabActive ? 'YES' : 'NO'
    });
    console.log(`   Requests tab active: ${requestsTabActive}\n`);

    // Step 9: Check for Accept/Decline buttons
    console.log('📍 Step 10: Looking for Accept/Decline buttons...');
    const acceptButton = await page.locator('button:has-text("Accept")').first();
    const declineButton = await page.locator('button:has-text("Decline")').first();
    const hasButtons = await acceptButton.isVisible().catch(() => false) && await declineButton.isVisible().catch(() => false);

    results.steps.push({
      step: 10,
      description: 'Accept/Decline buttons visible',
      result: hasButtons ? 'YES' : 'NO'
    });
    console.log(`   Accept/Decline buttons visible: ${hasButtons}\n`);

    if (!hasButtons) {
      console.log('❌ No Accept/Decline buttons found');
      throw new Error('No Accept/Decline buttons found');
    }

    // Step 10: Click Accept button
    console.log('📍 Step 11: Clicking Accept button...');
    await acceptButton.click();
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '04-after-accept.png'),
      fullPage: false
    });

    // Step 11: Check if switched to Friends tab
    console.log('📍 Step 12: Checking if switched to Friends tab...');
    const friendsTab = await page.locator('button:has-text("Friends"), [data-tab="friends"]').first();
    const friendsTabActive = await friendsTab.getAttribute('class').then(c => c.includes('active') || c.includes('selected')).catch(() => false);

    results.steps.push({
      step: 12,
      description: 'Switched to Friends tab',
      result: friendsTabActive ? 'YES' : 'NO'
    });
    console.log(`   Friends tab active: ${friendsTabActive}\n`);

    // Step 12: Check if bell badge decreased
    console.log('📍 Step 13: Checking notification bell badge after accepting...');

    // Navigate back to homepage or check bell on current page
    const bellBadgeAfter = await page.locator('[data-testid="notification-badge"], .notification-badge, .badge').first();
    const hasBadgeAfter = await bellBadgeAfter.isVisible().catch(() => false);
    const badgeCountAfter = hasBadgeAfter ? await bellBadgeAfter.textContent() : '0';

    await page.screenshot({
      path: path.join(screenshotsDir, '05-final-bell.png'),
      fullPage: false
    });

    results.steps.push({
      step: 13,
      description: 'Badge count decreased/disappeared',
      result: (!hasBadgeAfter || parseInt(badgeCountAfter) < parseInt(badgeCount)) ? 'YES' : 'NO',
      initialCount: badgeCount,
      finalCount: badgeCountAfter
    });
    console.log(`   Initial badge count: ${badgeCount}`);
    console.log(`   Final badge count: ${badgeCountAfter}`);
    console.log(`   Badge cleared: ${!hasBadgeAfter || parseInt(badgeCountAfter) < parseInt(badgeCount)}\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.error = error.message;

    // Take error screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'error-screenshot.png'),
      fullPage: true
    });
  } finally {
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('=' .repeat(60));
    results.steps.forEach(step => {
      const status = step.result === 'YES' ? '✅' : '❌';
      console.log(`${status} Step ${step.step}: ${step.description} - ${step.result}`);
      if (step.badgeCount) console.log(`   Badge Count: ${step.badgeCount}`);
      if (step.url) console.log(`   URL: ${step.url}`);
      if (step.initialCount !== undefined) {
        console.log(`   Initial Count: ${step.initialCount}, Final Count: ${step.finalCount}`);
      }
    });
    console.log('=' .repeat(60));
    console.log(`\n📸 Screenshots saved to: ${screenshotsDir}\n`);

    await browser.close();
  }

  return results;
}

testNotificationFlow().catch(console.error);
