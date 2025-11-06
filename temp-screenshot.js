const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/admin/towns-manager');
  await page.waitForTimeout(2000); // Wait for page to load
  await page.screenshot({ path: '/tmp/towns-manager-screenshot.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved to /tmp/towns-manager-screenshot.png');
})();
