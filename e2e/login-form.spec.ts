import { test, expect } from '@playwright/test';
import { AuthPage } from './page-objects/auth-page';

test.describe('Login Form Interaction', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test('should fill login form with valid credentials', async ({ page }) => {
    await authPage.navigateToLogin();
    
    // Fill form fields using page object
    await authPage.fillLoginForm('test@example.com', 'password123');
    
    // Verify form is filled correctly
    await expect(page.getByTestId('email-input')).toHaveValue('test@example.com');
    await expect(page.getByTestId('password-input')).toHaveValue('password123');
    
    // Take a screenshot of the filled form
    await page.screenshot({ path: 'test-results/login-form-filled.png' });
  });
}); 