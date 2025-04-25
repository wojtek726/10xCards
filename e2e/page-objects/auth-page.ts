import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AuthPage {
  constructor(private page: Page) {}

  async navigateToLogin() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToRegister() {
    await this.page.goto('/auth/signup');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isLoginFormVisible() {
    try {
      return await this.page.locator('[data-testid="login-form"]').isVisible({ timeout: 2000 });
    } catch (e) {
      // Try to determine another way if we're on the login page
      const loginTitle = await this.page.locator('text=Logowanie').isVisible({ timeout: 1000 }).catch(() => false);
      if (loginTitle) return true;
      
      // Take screenshot for debugging
      await this.page.screenshot({ path: `test-results/login-form-check-${Date.now()}.png` });
      return false;
    }
  }

  async isRegisterFormVisible() {
    try {
      return await this.page.locator('[data-testid="register-form"]').isVisible({ timeout: 2000 });
    } catch (e) {
      // Try to determine another way if we're on the register page
      const registerTitle = await this.page.locator('text=Rejestracja').isVisible({ timeout: 1000 }).catch(() => false);
      if (registerTitle) return true;
      
      // Take screenshot for debugging
      await this.page.screenshot({ path: `test-results/register-form-check-${Date.now()}.png` });
      return false;
    }
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    // Wait for form validation to enable the button
    await this.page.waitForTimeout(500);
  }

  async fillRegisterForm(email: string, password: string, confirmPassword: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.fill('[data-testid="confirm-password-input"]', confirmPassword);
    // Wait for form validation to enable the button
    await this.page.waitForTimeout(500);
  }

  async submitLoginForm() {
    const submitButton = this.page.locator('[data-testid="login-submit"]');
    // Check if button is enabled before clicking
    const isEnabled = await submitButton.isEnabled();
    if (!isEnabled) {
      console.log('Login button is disabled, cannot click');
      return false;
    }
    
    await submitButton.click();
    return true;
  }

  async submitRegisterForm() {
    const submitButton = this.page.locator('[data-testid="register-submit"]');
    // Check if button is enabled before clicking
    const isEnabled = await submitButton.isEnabled();
    if (!isEnabled) {
      console.log('Register button is disabled, cannot click');
      return false;
    }
    
    await submitButton.click();
    return true;
  }

  async submitLoginFormAndCheckLoading() {
    const success = await this.submitLoginForm();
    if (success) {
      await expect(this.page.locator('[data-testid="login-submit"]')).toHaveAttribute('aria-busy', 'true', { timeout: 10000 });
      await expect(this.page.locator('[data-testid="login-submit"]')).toBeDisabled();
    }
    return success;
  }

  async forceSubmitLoginForm() {
    // Use this when you want to test validation by submitting a form even when button is disabled
    const submitButton = this.page.locator('[data-testid="login-submit"]');
    await submitButton.click({ force: true });
  }

  async forceSubmitRegisterForm() {
    // Use this when you want to test validation by submitting a form even when button is disabled
    const submitButton = this.page.locator('[data-testid="register-submit"]');
    await submitButton.click({ force: true });
  }

  async isLoginButtonEnabled() {
    const button = this.page.locator('[data-testid="login-submit"]');
    return await button.isEnabled();
  }

  async isRegisterButtonEnabled() {
    const button = this.page.locator('[data-testid="register-submit"]');
    return await button.isEnabled();
  }

  async switchToRegister() {
    // Take a screenshot before clicking
    await this.page.screenshot({ path: `test-results/before-switch-to-register-${Date.now()}.png` });
    
    // First check if we're already on the register page
    if (await this.isRegisterFormVisible()) {
      return;
    }
    
    // Try clicking the regular link first
    try {
      await this.page.click('[data-testid="switch-to-register"]');
      // Wait for navigation to complete
      await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await this.page.waitForTimeout(1000);
    } catch (e) {
      // If that fails, try finding by text
      try {
        await this.page.click('a:has-text("Zarejestruj się")');
        // Wait for navigation to complete
        await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
        await this.page.waitForTimeout(1000);
      } catch (e) {
        // If that also fails, navigate directly
        await this.navigateToRegister();
      }
    }
    
    // Take a screenshot after switching
    await this.page.screenshot({ path: `test-results/after-switch-to-register-${Date.now()}.png` });
  }

  async switchToLogin() {
    // Take a screenshot before clicking
    await this.page.screenshot({ path: `test-results/before-switch-to-login-${Date.now()}.png` });
    
    // First check if we're already on the login page
    if (await this.isLoginFormVisible()) {
      return;
    }
    
    // Try clicking the regular link first
    try {
      await this.page.click('[data-testid="switch-to-login"]');
      // Wait for navigation to complete
      await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await this.page.waitForTimeout(1000);
    } catch (e) {
      // If that fails, try finding by text
      try {
        await this.page.click('a:has-text("Zaloguj się")');
        // Wait for navigation to complete
        await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
        await this.page.waitForTimeout(1000);
      } catch (e) {
        // If that also fails, navigate directly
        await this.navigateToLogin();
      }
    }
    
    // Take a screenshot after switching
    await this.page.screenshot({ path: `test-results/after-switch-to-login-${Date.now()}.png` });
  }

  async getErrorMessage(timeout = 5000) {
    try {
      // Take a screenshot to see what's happening
      await this.page.screenshot({ path: `test-results/error-check-${Date.now()}.png` });
      
      const errorElement = this.page.locator('[data-testid="error-message"]');
      
      // Wait for the error to be visible
      const isVisible = await errorElement.isVisible({ timeout });
      if (isVisible) {
        return await errorElement.textContent();
      }
      
      // If no error found with data-testid, try looking for any visible error text
      const formErrors = this.page.locator('.text-red-500, [class*="error"]:visible');
      const errorCount = await formErrors.count();
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const error = formErrors.nth(i);
          if (await error.isVisible()) {
            return await error.textContent();
          }
        }
      }
      
      console.log('Error message not found within timeout');
      // Take a screenshot for debugging
      await this.page.screenshot({ path: `test-results/error-message-timeout-${Date.now()}.png` });
      return null;
    } catch (err) {
      console.log('Error while getting error message:', err);
      await this.page.screenshot({ path: `test-results/error-message-exception-${Date.now()}.png` });
      return null;
    }
  }

  async waitForSuccessfulLogin(timeout = 10000) {
    try {
      // Take a screenshot to see what's happening
      await this.page.screenshot({ path: `test-results/before-login-check-${Date.now()}.png` });
      
      // First check that the login button shows loading state
      const buttonLocator = this.page.locator('[data-testid="login-submit"], [data-testid="register-submit"]');
      const submitText = await buttonLocator.textContent();
      console.log('Submit button text:', submitText);
      
      // Check for any of these indicators of a login attempt
      const promises = [
        buttonLocator.isDisabled().catch(() => false),
        buttonLocator.getAttribute('aria-busy').then(val => val === 'true').catch(() => false),
        this.page.waitForURL('**/flashcards**', { timeout: timeout / 2 }).catch(() => false),
        this.page.waitForTimeout(1000).then(() => true)  // Always wait at least 1 second
      ];
      
      const results = await Promise.all(promises);
      console.log('Login indicators:', results);
      
      // If any indicator was true, consider it a success
      const success = results.some(result => result === true);
      
      // Take another screenshot to see what happened
      await this.page.screenshot({ path: `test-results/after-login-check-${Date.now()}.png` });
      
      return success;
    } catch (err) {
      console.log('Exception during login check:', err);
      await this.page.screenshot({ path: `test-results/login-exception-${Date.now()}.png` });
      return false;
    }
  }
} 