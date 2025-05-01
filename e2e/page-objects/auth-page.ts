import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

// Constants for timeouts and selectors
const TIMEOUT = {
  NAVIGATION: 10000,
  ELEMENT: 10000,
  HYDRATION: 10000,
  VALIDATION: 1000,
};

const SELECTORS = {
  LOGIN: {
    CONTAINER: '[data-testid="login-page-container"]',
    FORM: '[data-testid="login-form"]',
    EMAIL: '[data-testid="email-input"]',
    PASSWORD: '[data-testid="password-input"]',
    SUBMIT: '[data-testid="login-submit"]',
    SWITCH_TO_REGISTER: '[data-testid="switch-to-register"]',
  },
  REGISTER: {
    CONTAINER: '[data-testid="register-page-container"]',
    FORM: '[data-testid="register-form"]',
    EMAIL: '[data-testid="email-input"]',
    PASSWORD: '[data-testid="password-input"]',
    CONFIRM_PASSWORD: '[data-testid="confirm-password-input"]',
    SUBMIT: '[data-testid="register-submit"]',
    SWITCH_TO_LOGIN: '[data-testid="switch-to-login"]',
  },
  ERROR: '[data-testid="auth-error"]',
  SUCCESS: '[data-testid="auth-success"]',
};

export class AuthPage {
  constructor(private page: Page) {}

  private async waitForHydration() {
    try {
      await this.page.waitForFunction(() => {
        return window.document.documentElement.hasAttribute('data-hydrated');
      }, { timeout: TIMEOUT.HYDRATION });
    } catch (error) {
      console.error('Hydration timeout:', error);
      await this.page.screenshot({ path: `test-results/hydration-failed-${Date.now()}.png` });
      throw error;
    }
  }

  private async waitForElement(selector: string, options = { state: 'visible' as const }) {
    try {
      await this.page.waitForSelector(selector, { 
        ...options,
        timeout: TIMEOUT.ELEMENT 
      });
    } catch (error) {
      console.error(`Failed to find element ${selector}:`, error);
      await this.page.screenshot({ path: `test-results/element-wait-failed-${Date.now()}.png` });
      throw error;
    }
  }

  async navigateToLogin() {
    try {
      await this.page.goto('/auth/login', { 
        waitUntil: 'networkidle',
        timeout: TIMEOUT.NAVIGATION 
      });
      
      await this.waitForHydration();
      await this.waitForElement(SELECTORS.LOGIN.CONTAINER);
      await this.waitForElement(SELECTORS.LOGIN.FORM);
      
    } catch (error) {
      console.error('Failed to navigate to login:', error);
      await this.page.screenshot({ path: `test-results/login-navigation-failed-${Date.now()}.png` });
      console.log('Current URL:', this.page.url());
      console.log('Page HTML:', await this.page.content());
      throw error;
    }
  }

  async navigateToRegister() {
    try {
      await this.page.goto('/auth/signup', { 
        waitUntil: 'networkidle',
        timeout: TIMEOUT.NAVIGATION 
      });
      
      await this.waitForHydration();
      await this.waitForElement(SELECTORS.REGISTER.CONTAINER);
      await this.waitForElement(SELECTORS.REGISTER.FORM);
      
    } catch (error) {
      console.error('Failed to navigate to register:', error);
      await this.page.screenshot({ path: `test-results/register-navigation-failed-${Date.now()}.png` });
      console.log('Current URL:', this.page.url());
      console.log('Page HTML:', await this.page.content());
      throw error;
    }
  }

  async isLoginFormVisible() {
    return this.page.locator(SELECTORS.LOGIN.FORM).isVisible();
  }

  async isRegisterFormVisible() {
    return this.page.locator(SELECTORS.REGISTER.FORM).isVisible();
  }

  async fillLoginForm(email: string, password: string) {
    try {
      await this.waitForElement(SELECTORS.LOGIN.FORM);
      await this.page.fill(SELECTORS.LOGIN.EMAIL, email);
      await this.page.fill(SELECTORS.LOGIN.PASSWORD, password);
      await this.page.waitForTimeout(TIMEOUT.VALIDATION);
    } catch (error) {
      console.error('Failed to fill login form:', error);
      await this.page.screenshot({ path: `test-results/login-form-fill-failed-${Date.now()}.png` });
      throw error;
    }
  }

  async fillRegisterForm(email: string, password: string, confirmPassword: string) {
    try {
      await this.waitForElement(SELECTORS.REGISTER.FORM);
      await this.page.fill(SELECTORS.REGISTER.EMAIL, email);
      await this.page.fill(SELECTORS.REGISTER.PASSWORD, password);
      await this.page.fill(SELECTORS.REGISTER.CONFIRM_PASSWORD, confirmPassword);
      await this.page.waitForTimeout(TIMEOUT.VALIDATION);
    } catch (error) {
      console.error('Failed to fill register form:', error);
      await this.page.screenshot({ path: `test-results/register-form-fill-failed-${Date.now()}.png` });
      throw error;
    }
  }

  async submitLoginForm() {
    try {
      const submitButton = this.page.locator(SELECTORS.LOGIN.SUBMIT);
      const isEnabled = await submitButton.isEnabled();
      
      if (!isEnabled) {
        console.log('Login button is disabled');
        return false;
      }
      
      await submitButton.click();
      return true;
    } catch (error) {
      console.error('Failed to submit login form:', error);
      await this.page.screenshot({ path: `test-results/login-submit-failed-${Date.now()}.png` });
      throw error;
    }
  }

  async submitRegisterForm() {
    try {
      const submitButton = this.page.locator(SELECTORS.REGISTER.SUBMIT);
      const isEnabled = await submitButton.isEnabled();
      
      if (!isEnabled) {
        console.log('Register button is disabled');
        return false;
      }
      
      await submitButton.click();
      return true;
    } catch (error) {
      console.error('Failed to submit register form:', error);
      await this.page.screenshot({ path: `test-results/register-submit-failed-${Date.now()}.png` });
      throw error;
    }
  }

  async switchToRegister() {
    try {
      await this.page.click(SELECTORS.LOGIN.SWITCH_TO_REGISTER);
      await this.waitForElement(SELECTORS.REGISTER.FORM);
    } catch (error) {
      console.error('Failed to switch to register:', error);
      await this.page.screenshot({ path: `test-results/switch-to-register-failed-${Date.now()}.png` });
      throw error;
    }
  }

  async switchToLogin() {
    try {
      await this.page.click(SELECTORS.REGISTER.SWITCH_TO_LOGIN);
      await this.waitForElement(SELECTORS.LOGIN.FORM);
    } catch (error) {
      console.error('Failed to switch to login:', error);
      await this.page.screenshot({ path: `test-results/switch-to-login-failed-${Date.now()}.png` });
      throw error;
    }
  }

  async getErrorMessage() {
    try {
      const errorElement = this.page.locator(SELECTORS.ERROR);
      await errorElement.waitFor({ state: 'visible', timeout: TIMEOUT.ELEMENT });
      return errorElement.textContent();
    } catch (error) {
      console.error('Failed to get error message:', error);
      await this.page.screenshot({ path: `test-results/error-message-failed-${Date.now()}.png` });
      return null;
    }
  }

  async waitForSuccessfulLogin() {
    try {
      await this.page.waitForURL('/flashcards', { timeout: TIMEOUT.NAVIGATION });
      await this.waitForElement(SELECTORS.SUCCESS);
    } catch (error) {
      console.error('Failed to verify successful login:', error);
      await this.page.screenshot({ path: `test-results/login-success-failed-${Date.now()}.png` });
      throw error;
    }
  }
} 