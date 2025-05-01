import { test } from './fixtures/page-objects';
import { expect } from '@playwright/test';

test.describe('Basic Auth Pages', () => {
  test('should navigate to login page', async ({ page, loginPage }) => {
    await loginPage.goto();
    
    // Verify all required elements are present
    await expect(page.getByTestId('email')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('submit')).toBeVisible();
    await expect(page.getByTestId('signup-link')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.switchToSignup();
    
    // Verify all required elements are present
    await expect(page.getByTestId('email')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('confirm-password')).toBeVisible();
    await expect(page.getByTestId('submit')).toBeVisible();
    await expect(page.getByTestId('login-link')).toBeVisible();
  });
}); 