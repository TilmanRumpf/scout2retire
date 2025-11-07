import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to localhost:5173...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/tmp/screenshot-homepage.png', fullPage: true });
  
  console.log('Checking for clickable elements...');
  const clickableElements = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    const links = document.querySelectorAll('a');
    
    return {
      buttonCount: buttons.length,
      linkCount: links.length,
      buttons: Array.from(buttons).slice(0, 10).map(b => ({
        text: b.textContent?.trim(),
        disabled: b.disabled,
        visible: b.offsetParent !== null
      })),
      currentURL: window.location.href
    };
  });
  
  console.log(JSON.stringify(clickableElements, null, 2));
  
  await browser.close();
})();
