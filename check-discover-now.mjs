import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to discover page...');
  await page.goto('http://localhost:5173/discover');
  await page.waitForTimeout(3000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/tmp/discover-current.png', fullPage: true });
  
  // Check what town is showing
  const pageInfo = await page.evaluate(() => {
    const titleEl = document.querySelector('h2');
    const scoreText = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.includes('Score:'));
    
    return {
      title: titleEl?.textContent || 'No title found',
      score: scoreText?.textContent || 'No score found',
      url: window.location.href,
      hasDashes: document.body.textContent.includes('--')
    };
  });
  
  console.log('\n=== PAGE INFO ===');
  console.log(JSON.stringify(pageInfo, null, 2));
  
  await browser.close();
})();
