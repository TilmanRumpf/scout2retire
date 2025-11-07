import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  console.log('Navigating to localhost:5173...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  console.log('\nChecking page state...');
  const pageState = await page.evaluate(() => {
    return {
      title: document.title,
      bodyHTML: document.body?.innerHTML?.substring(0, 500),
      hasRoot: !!document.getElementById('root'),
      rootContent: document.getElementById('root')?.innerHTML?.substring(0, 500)
    };
  });
  
  console.log(JSON.stringify(pageState, null, 2));
  
  await browser.close();
})();
