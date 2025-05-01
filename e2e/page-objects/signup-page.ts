import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class SignupPage extends BasePage {
  private readonly selectors = {
    email: '[data-testid="email"]',
    password: '[data-testid="password"]',
    confirmPassword: '[data-testid="confirm-password"]',
    submit: '[data-testid="submit"]',
    loginLink: '[data-testid="login-link"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    loadingSpinner: '[data-testid="loading-spinner"]'
  };

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    try {
      await this.page.goto('/auth/signup');
      await this.waitForHydration();
      
      const elementsLoaded = await Promise.all([
        this.waitForElement(this.selectors.email),
        this.waitForElement(this.selectors.password),
        this.waitForElement(this.selectors.confirmPassword),
        this.waitForElement(this.selectors.submit)
      ]);

      if (!elementsLoaded.every(Boolean)) {
        throw new Error('Not all required elements were loaded');
      }
    } catch (error) {
      console.error('Failed to navigate to signup page:', error);
      await this.takeErrorScreenshot('signup-navigation-failed');
      throw error;
    }
  }

  async fillEmail(email: string) {
    await this.fillInput(this.selectors.email, email);
  }

  async fillPassword(password: string) {
    await this.fillInput(this.selectors.password, password);
  }

  async fillConfirmPassword(password: string) {
    await this.fillInput(this.selectors.confirmPassword, password);
  }

  async submit() {
    await this.clickButton(this.selectors.submit);
  }

  async signup(email: string, password: string, confirmPassword: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.submit();
  }

  async expectErrorMessage(message: string) {
    await this.waitForElement(this.selectors.errorMessage);
    await expect(this.page.locator(this.selectors.errorMessage))
      .toContainText(message, { timeout: 10000 });
  }

  async expectSuccessMessage(message: string) {
    await this.waitForElement(this.selectors.successMessage);
    await expect(this.page.locator(this.selectors.successMessage))
      .toContainText(message, { timeout: 10000 });
  }

  async switchToLogin() {
    await this.clickButton(this.selectors.loginLink);
  }

  async isSubmitButtonEnabled() {
    return this.isElementEnabled(this.selectors.submit);
  }

  async expectPasswordMismatchError() {
    await this.expectErrorMessage('Passwords do not match');
  }

  async expectPasswordLengthError() {
    await this.expectErrorMessage('Password must be at least 8 characters long');
  }

  async waitForLoadingSpinner() {
    await super.waitForLoadingSpinner(this.selectors.loadingSpinner);
  }

  async expectSubmitButtonToBeDisabled() {
    const submitButton = this.page.locator('[data-testid="register-submit"]');
    await expect(submitButton).toBeDisabled();
  }
} 