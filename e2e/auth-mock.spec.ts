import { test } from './fixtures/page-objects';
import { mockAuthApi } from './mocks/auth-api';
import { expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
  });

  test('should display error message for invalid credentials', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.expectErrorMessage('Invalid login credentials');
  });

  test('should successfully log in with valid credentials', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.expectSuccessMessage('Login successful');
  });

  test('should navigate to register page when clicking switch button', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.switchToSignup();
    await expect(page).toHaveURL('/auth/signup');
  });
}); 