import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  private readonly selectors = {
    email: '[data-testid="email"]',
    password: '[data-testid="password"]',
    submit: '[data-testid="submit"]',
    signupLink: '[data-testid="signup-link"]',
    forgotPasswordLink: '[data-testid="forgot-password-link"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    loadingSpinner: '[data-testid="loading-spinner"]'
  };

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    try {
      await this.page.goto('/auth/login');
      await this.waitForHydration();
      
      const elementsLoaded = await Promise.all([
        this.waitForElement(this.selectors.email),
        this.waitForElement(this.selectors.password),
        this.waitForElement(this.selectors.submit)
      ]);

      if (!elementsLoaded.every(Boolean)) {
        throw new Error('Not all required elements were loaded');
      }
    } catch (error) {
      console.error('Failed to navigate to login page:', error);
      await this.takeErrorScreenshot('login-navigation-failed');
      throw error;
    }
  }

  async fillEmail(email: string) {
    await this.fillInput(this.selectors.email, email);
  }

  async fillPassword(password: string) {
    await this.fillInput(this.selectors.password, password);
  }

  async submit() {
    await this.clickButton(this.selectors.submit);
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
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

  async switchToSignup() {
    await this.clickButton(this.selectors.signupLink);
  }

  async forgotPassword() {
    await this.clickButton(this.selectors.forgotPasswordLink);
  }

  async isSubmitButtonEnabled() {
    return this.isElementEnabled(this.selectors.submit);
  }

  async waitForLoadingSpinner() {
    await super.waitForLoadingSpinner(this.selectors.loadingSpinner);
  }

  async expectSubmitButtonToBeDisabled() {
    const submitButton = this.page.locator('[data-testid="login-submit"]');
    await expect(submitButton).toBeDisabled();
  }
} 