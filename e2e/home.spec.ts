import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Side Project Evaluator');
  });

  test('has submit form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[placeholder*="AI Code Reviewer"]')).toBeVisible();
  });

  test('navigates to leaderboard', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Leaderboard")');
    await expect(page).toHaveURL('/leaderboard');
    await expect(page.locator('h1')).toContainText('Leaderboard');
  });

  test('navigates to API docs', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("API Docs")');
    await expect(page).toHaveURL('/api-docs');
    await expect(page.locator('h1')).toContainText('API Documentation');
  });
});
