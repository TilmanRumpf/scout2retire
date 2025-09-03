import { test, expect } from '@playwright/test';

const EMAIL = 'tilman.rumpf@gmail.com';
const PASSWORD = 'Schoko2005';

test('verify hobbies are displayed', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.toString().includes('/login'));
  
  // Go to hobbies
  await page.goto('/onboarding/hobbies');
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/hobbies-final.png', fullPage: true });
  
  // Simple checks - just verify the text is there
  const pageText = await page.textContent('body');
  
  console.log('\n✅ VERIFICATION:');
  console.log(`  Contains "Surfing": ${pageText.includes('Surfing') || pageText.includes('surfing')}`);
  console.log(`  Contains "Snorkeling": ${pageText.includes('Snorkeling') || pageText.includes('snorkeling')}`);
  console.log(`  Contains "Scuba": ${pageText.includes('Scuba') || pageText.includes('scuba')}`);
  console.log(`  Contains "Golf": ${pageText.includes('Golf') || pageText.includes('golf')}`);
  console.log(`  Contains "Water Sports": ${pageText.includes('Water Sports')}`);
  
  // Assert they exist
  expect(pageText).toContain('Surfing');
  expect(pageText).toContain('Golf');
  
  console.log('\n✅ HOBBIES ARE DISPLAYING CORRECTLY!');
});