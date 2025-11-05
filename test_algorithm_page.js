const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to see full page
  await page.setViewportSize({ width: 1280, height: 1024 });
  
  // Navigate to the algorithm page
  await page.goto('http://localhost:5173/admin/algorithm', { waitUntil: 'networkidle' });
  
  // Wait a moment for any dynamic content
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/algorithm_page.png', fullPage: true });
  
  console.log('Screenshot saved to /tmp/algorithm_page.png');
  
  await browser.close();
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
