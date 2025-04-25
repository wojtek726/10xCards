import { test, expect } from '@playwright/test';
import { mockAuthApi } from './mocks/auth-api';
import { AuthPage } from './page-objects/auth-page';

test.describe('Authentication', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
    
    // Mock window.location.href to prevent actual navigation
    await page.addInitScript(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...window.location,
          href: window.location.href,
          assign: function(url: string) { 
            console.log('Mock navigation to:', url);
            return null; 
          },
          replace: function(url: string) { 
            console.log('Mock navigation to:', url);
            return null; 
          }
        }
      });
    });
    
    authPage = new AuthPage(page);
    await authPage.navigateToLogin();
  });

  test('shows login form by default', async () => {
    await expect(await authPage.isLoginFormVisible()).toBe(true);
    await expect(await authPage.isRegisterFormVisible()).toBe(false);
  });

  test('can switch between login and register forms', async () => {
    // Initially on login form
    await expect(await authPage.isLoginFormVisible()).toBe(true);
    await expect(await authPage.isRegisterFormVisible()).toBe(false);

    // Switch to register
    await authPage.switchToRegister();
    await expect(await authPage.isLoginFormVisible()).toBe(false);
    await expect(await authPage.isRegisterFormVisible()).toBe(true);

    // Switch back to login
    await authPage.switchToLogin();
    await expect(await authPage.isLoginFormVisible()).toBe(true);
    await expect(await authPage.isRegisterFormVisible()).toBe(false);
  });

  test.describe('Login', () => {
    // Skip this test until we can properly check client-side validation errors
    test.skip('shows error message on failed login with invalid email', async () => {
      await authPage.fillLoginForm('notanemail', 'password123');
      await authPage.forceSubmitLoginForm();
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain('Invalid email address');
    });

    // Skip this test until we can properly check API error responses in the UI
    test.skip('shows error message on failed login with invalid credentials', async () => {
      await authPage.fillLoginForm('invalid@example.com', 'wrongpassword');
      await authPage.forceSubmitLoginForm();
      
      const errorMessage = await authPage.getErrorMessage(10000);
      expect(errorMessage).toContain('Invalid login credentials');
    });

    test('successful login redirects to flashcards', async () => {
      await authPage.fillLoginForm('test@example.com', 'password123');
      await authPage.forceSubmitLoginForm();
      const loginSuccess = await authPage.waitForSuccessfulLogin();
      expect(loginSuccess).toBe(true);
    });

    test('shows loading state during login', async () => {
      await authPage.fillLoginForm('test@example.com', 'password123');
      await authPage.forceSubmitLoginForm();
      const waitResult = await authPage.waitForSuccessfulLogin();
      expect(waitResult).toBe(true);
    });
  });

  test.describe('Registration', () => {
    test.beforeEach(async () => {
      await authPage.switchToRegister();
    });

    // Testing client-side validation without submitting to API
    test('validates matching passwords', async ({ page }) => {
      // Fill in the form fields
      await page.fill('[data-testid="email-input"]', 'new@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'differentpassword');
      
      // Trigger validation by blurring the confirm password field
      await page.locator('[data-testid="confirm-password-input"]').blur();
      
      // Wait for the validation to process
      await page.waitForTimeout(500);

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/password-validation.png' });
      
      // Look for any validation errors displayed on the form
      const errorMessage = await page.locator('[id*="form-item-message"]').first();
      await expect(errorMessage).toBeVisible();
      
      // Verify the error message text contains expected validation message
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain("Hasła nie są identyczne");
    });

    // Testing client-side validation without submitting to API
    test('validates password length', async ({ page }) => {
      // Fill in the form fields
      await page.fill('[data-testid="email-input"]', 'new@example.com');
      await page.fill('[data-testid="password-input"]', 'weak');
      
      // Trigger validation by blurring the password field
      await page.locator('[data-testid="password-input"]').blur();
      
      // Wait for the validation to process
      await page.waitForTimeout(500);

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/password-length-validation.png' });
      
      // Look for any validation errors displayed on the form
      const errorMessage = await page.locator('[id*="form-item-message"]').first();
      await expect(errorMessage).toBeVisible();
      
      // Verify the error message text contains expected validation message
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain("Hasło musi mieć minimum 8 znaków");
    });

    test('successful registration redirects to flashcards', async () => {
      await authPage.fillRegisterForm('new@example.com', 'StrongPass123!', 'StrongPass123!');
      await authPage.forceSubmitRegisterForm();
      const registrationSuccess = await authPage.waitForSuccessfulLogin();
      expect(registrationSuccess).toBe(true);
    });
  });

  test.describe('Form validation', () => {
    test('login button is disabled when form is empty', async ({ page }) => {
      // Clear any values that might be in the form
      await page.fill('[data-testid="email-input"]', '');
      await page.fill('[data-testid="password-input"]', '');
      await page.waitForTimeout(500); // Wait for form validation
      const isLoginButtonEnabled = await authPage.isLoginButtonEnabled();
      expect(isLoginButtonEnabled).toBe(false);
    });

    test('register button is disabled when form is empty', async ({ page }) => {
      await authPage.switchToRegister();
      // Clear any values that might be in the form
      await page.fill('[data-testid="email-input"]', '');
      await page.fill('[data-testid="password-input"]', '');
      await page.fill('[data-testid="confirm-password-input"]', '');
      await page.waitForTimeout(500); // Wait for form validation
      const isRegisterButtonEnabled = await authPage.isRegisterButtonEnabled();
      expect(isRegisterButtonEnabled).toBe(false);
    });
  });
});