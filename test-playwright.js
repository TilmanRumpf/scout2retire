import { chromium } from 'playwright';

(async () => {
  console.log('Testing Playwright...');
  try {
    const browser = await chromium.launch();
    console.log('Browser launched successfully');
    await browser.close();
    console.log('Browser closed successfully');
  } catch (error) {
    console.error('Error:', error);
  }
})();