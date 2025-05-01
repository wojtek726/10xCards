import { test } from './fixtures/page-objects';
import { mockAuthApi } from './mocks/auth-api';
import { expect } from '@playwright/test';

test.describe('Authentication with Page Objects', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
  });

  test('should display error for invalid credentials', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.expectErrorMessage('Invalid login credentials');
  });

  test('should successfully log in with valid credentials', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.expectSuccessMessage('Login successful');
  });

  test('should navigate to signup page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.switchToSignup();
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should navigate to forgot password page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.forgotPassword();
    await expect(page).toHaveURL('/auth/reset-password');
  });
}); 