import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Scout2Retire/);
});

test('redirects to welcome page when not authenticated', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/welcome/);
});

test('welcome page loads correctly', async ({ page }) => {
  await page.goto('/welcome');
  await expect(page).toHaveURL(/welcome/);
  // Check for common elements on welcome page
  const loginButton = page.locator('text=/log in/i').or(page.locator('text=/sign in/i'));
  await expect(loginButton).toBeVisible();
});