import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Going to TownsManager...');
  await page.goto('http://localhost:5173/admin/towns');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/tmp/towns-manager.png', fullPage: true });
  
  console.log('Looking for Smart Update button...');
  const buttons = await page.evaluate(() => {
    const allButtons = document.querySelectorAll('button');
    return Array.from(allButtons).map(b => ({
      text: b.textContent?.trim(),
      disabled: b.disabled,
      classList: b.className
    }));
  });
  
  console.log(JSON.stringify(buttons, null, 2));
  
  await browser.close();
})();
