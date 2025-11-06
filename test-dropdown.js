const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. Navigating to Algorithm Manager...');
  await page.goto('http://localhost:5173/admin/algorithm');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('2. Taking initial screenshot...');
  await page.screenshot({ path: '/tmp/screenshot-1-initial.png', fullPage: true });
  
  console.log('3. Looking for user dropdown input...');
  const inputSelector = 'input[placeholder*="Select user" i], input[placeholder*="user" i], [role="combobox"]';
  await page.waitForSelector(inputSelector, { timeout: 5000 });
  
  console.log('4. Clicking on the input field...');
  await page.click(inputSelector);
  await page.waitForTimeout(500);
  
  console.log('5. Typing "tobias" slowly...');
  await page.type(inputSelector, 'tobias', { delay: 100 });
  await page.waitForTimeout(1000);
  
  console.log('6. Taking screenshot after typing...');
  await page.screenshot({ path: '/tmp/screenshot-2-after-typing.png', fullPage: true });
  
  console.log('7. Checking for dropdown elements...');
  const dropdownVisible = await page.evaluate(() => {
    const dropdowns = document.querySelectorAll('[role="listbox"], .dropdown, [class*="dropdown"], [class*="menu"]');
    const results = [];
    
    dropdowns.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      results.push({
        index: idx,
        tag: el.tagName,
        classes: el.className,
        visible: styles.display !== 'none' && styles.visibility !== 'hidden' && rect.height > 0,
        zIndex: styles.zIndex,
        position: styles.position,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        hasChildren: el.children.length > 0,
        innerHTML: el.innerHTML.substring(0, 200)
      });
    });
    
    return results;
  });
  
  console.log('Dropdown analysis:', JSON.stringify(dropdownVisible, null, 2));
  
  await page.waitForTimeout(2000);
  await browser.close();
})();
