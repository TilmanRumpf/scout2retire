import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 1400, height: 900 });
  
  try {
    // Navigate to home
    console.log('Navigating to home...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/welcome')) {
      console.log('On welcome page - navigating to login...');
      
      // Click Log In button
      await page.click('text="Log In"');
      await page.waitForURL('**/login**', { timeout: 5000 });
      
      console.log('Filling login form...');
      await page.fill('input[type="email"]', 'tilman.rumpf@gmail.com');
      await page.fill('input[type="password"]', 'testing123');
      
      console.log('Submitting login with Sign in button...');
      await page.click('text="Sign in"');
      
      // Wait for navigation away from login - be more lenient
      try {
        await page.waitForURL((url) => !url.toString().includes('/login'), {
          timeout: 15000
        });
        console.log('Login successful!');
      } catch (e) {
        console.log('Navigation check timed out, continuing anyway...');
      }
      
      await page.waitForTimeout(3000);
    }
    
    // Navigate to the algorithm page
    console.log('Navigating to algorithm manager...');
    await page.goto('http://localhost:5173/admin/algorithm', { waitUntil: 'networkidle' });
    
    // Wait a moment for any dynamic content
    await page.waitForTimeout(2000);
    
    console.log('Final URL:', page.url());
    
    // Take full page screenshot
    await page.screenshot({ path: '/tmp/algorithm_page.png', fullPage: true });
    
    console.log('Screenshot saved to /tmp/algorithm_page.png');
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/tmp/algorithm_page_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

test().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
