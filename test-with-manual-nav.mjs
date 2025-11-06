import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('INSTRUCTIONS:');
  console.log('1. Browser window will open');
  console.log('2. Please manually log in as executive admin');
  console.log('3. Navigate to /admin/algorithm page');
  console.log('4. Wait for the script to continue...');
  console.log('');
  console.log('Opening browser in 3 seconds...');
  
  await page.goto('http://localhost:5173/');
  
  // Wait for user to manually navigate and log in
  console.log('Waiting 30 seconds for you to log in and navigate...');
  await page.waitForTimeout(30000);
  
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  if (!currentUrl.includes('/admin/algorithm')) {
    console.log('⚠️ Not on algorithm page. Taking screenshot of current page...');
    await page.screenshot({ path: '/tmp/screenshot-current-page.png', fullPage: true });
    await browser.close();
    return;
  }
  
  console.log('✅ On algorithm page! Starting test...');
  await page.screenshot({ path: '/tmp/screenshot-1-initial.png', fullPage: true });
  
  const inputSelector = 'input[placeholder*="Type user email or name"]';
  
  try {
    await page.waitForSelector(inputSelector, { timeout: 5000 });
    console.log('✅ Found user input field!');
  } catch (e) {
    console.log('❌ Could not find user input field');
    await page.screenshot({ path: '/tmp/screenshot-no-input.png', fullPage: true });
    await browser.close();
    return;
  }
  
  console.log('Clicking on the input field...');
  await page.click(inputSelector);
  await page.waitForTimeout(500);
  
  console.log('Typing "tobias" slowly...');
  await page.type(inputSelector, 'tobias', { delay: 100 });
  await page.waitForTimeout(1500);
  
  console.log('Taking screenshot after typing...');
  await page.screenshot({ path: '/tmp/screenshot-2-after-typing.png', fullPage: true });
  
  console.log('Analyzing dropdown visibility...');
  const analysis = await page.evaluate(() => {
    const dropdown = document.querySelector('.absolute.z-50');
    if (!dropdown) {
      return { found: false, allZ50: document.querySelectorAll('.z-50').length };
    }
    
    const rect = dropdown.getBoundingClientRect();
    const styles = window.getComputedStyle(dropdown);
    
    return {
      found: true,
      classes: dropdown.className,
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      zIndex: styles.zIndex,
      position: styles.position,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      isVisible: styles.display !== 'none' && styles.visibility !== 'hidden' && rect.height > 0,
      childCount: dropdown.children.length,
      innerHTML: dropdown.innerHTML.substring(0, 300)
    };
  });
  
  console.log('\n=== DROPDOWN ANALYSIS ===');
  console.log(JSON.stringify(analysis, null, 2));
  
  await page.waitForTimeout(3000);
  await browser.close();
})();
