import { test, expect } from '@playwright/test';

test('check onboarding page - should redirect to welcome if not logged in', async ({ page }) => {
  // Try to access onboarding directly
  await page.goto('/onboarding');
  
  // Should redirect to welcome since we're not authenticated
  await expect(page).toHaveURL(/welcome/);
  
  // Take a screenshot so we can see what happened
  await page.screenshot({ path: 'test-results/onboarding-redirect.png' });
  
  // Wait a bit so you can see the browser
  await page.waitForTimeout(2000);
});