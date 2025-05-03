import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base-page';
import { TEST_CONFIG } from '../test.config';

export class LoginPage extends BasePage {
  private readonly selectors = {
    email: '[data-testid="email"]',
    password: '[data-testid="password"]',
    submit: '[data-testid="submit"]',
    signupLink: '[data-testid="signup-link"]',
    forgotPasswordLink: '[data-testid="forgot-password-link"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    form: '[data-testid="login-form"]'
  };

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<boolean> {
    try {
      // Najpierw sprawdzamy, czy strona jest dostępna
      const response = await this.page.goto('/auth/login', {
        waitUntil: 'domcontentloaded',
        timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION
      });

      if (!response?.ok()) {
        throw new Error(`Failed to load login page: ${response?.status()}`);
      }

      // Czekamy na podstawowy render strony
      await this.page.waitForLoadState('domcontentloaded');

      // Czekamy na pojawienie się formularza - to jest kluczowy element
      const form = await this.page.waitForSelector(this.selectors.form, {
        state: 'visible',
        timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
      });

      if (!form) {
        throw new Error('Login form not found');
      }

      // Jeśli formularz jest widoczny, czekamy na resztę elementów
      await Promise.all([
        this.page.waitForSelector(this.selectors.email),
        this.page.waitForSelector(this.selectors.password),
        this.page.waitForSelector(this.selectors.submit)
      ]).catch(error => {
        console.warn('Some form elements were not loaded:', error);
      });

      return true;
    } catch (error) {
      console.error('Failed to navigate to login page:', error);
      if (!this.page.isClosed()) {
        await this.takeErrorScreenshot('login-navigation-failed');
      }
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
    try {
      // Fill form
      await this.page.fill(this.selectors.email, email);
      await this.page.fill(this.selectors.password, password);
      
      // Wait for form validation
      await this.page.waitForTimeout(500);
      
      // Log the attempt
      console.log('Attempting login with email:', email);
      
      // Click submit and wait for response
      const [response] = await Promise.all([
        this.page.waitForResponse(
          response => response.url().includes('/api/auth/login') && response.status() === 200,
          { timeout: TEST_CONFIG.TIMEOUTS.ACTION }
        ),
        this.page.click(this.selectors.submit)
      ]);

      // Parse and verify response
      const responseData = await response.json();
      console.log('Login response received:', {
        status: response.status(),
        hasSession: !!responseData?.session,
        hasAccessToken: !!responseData?.session?.access_token
      });

      if (!responseData?.session?.access_token) {
        throw new Error('Login response missing access token');
      }

      // Wait for navigation to start
      await this.page.waitForURL('/flashcards', { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
      
      // Wait for the page to be fully loaded
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForLoadState('domcontentloaded');

      // Log navigation success
      console.log('Successfully navigated to flashcards page');

      // Take screenshot of the current state
      await this.page.screenshot({ 
        path: 'test-results/login-state.png',
        fullPage: true 
      });

      // Log the current state for debugging
      console.log('Current URL after login:', this.page.url());
      console.log('Checking for user-menu visibility...');

      // Try to find the user menu with retries
      let retries = 3;
      let lastError = null;
      
      while (retries > 0) {
        try {
          // First check if we're still on the correct page
          if (!this.page.url().includes('/flashcards')) {
            throw new Error('Not on flashcards page anymore');
          }

          // Check if the user menu exists in DOM
          const userMenu = await this.page.$('[data-testid="user-menu"]');
          if (!userMenu) {
            throw new Error('User menu not found in DOM');
          }

          // Check if it's visible
          const isVisible = await userMenu.isVisible();
          if (!isVisible) {
            throw new Error('User menu exists but is not visible');
          }

          console.log('User menu found and is visible');
          break;
        } catch (error) {
          lastError = error;
          retries--;
          if (retries === 0) {
            console.error('Failed to find user menu after all retries:', lastError);
            
            // Take a screenshot of the failed state
            await this.page.screenshot({ 
              path: 'test-results/user-menu-not-found.png',
              fullPage: true 
            });
            
            // Log the page state
            console.log('Page content:', await this.page.content());
            
            throw lastError;
          }
          console.log(`Retry ${3 - retries} - waiting for user menu...`);
          await this.page.waitForTimeout(1000);
          
          // Check if we need to reload
          if (this.page.url().includes('/flashcards')) {
            await this.page.reload();
            await this.page.waitForLoadState('networkidle');
          } else {
            // If we're not on the flashcards page, try to navigate there
            await this.page.goto('/flashcards');
            await this.page.waitForLoadState('networkidle');
          }
        }
      }

      // Verify other critical elements
      const flashcardsList = await this.page.waitForSelector('[data-testid="flashcards-list"]', {
        state: 'visible',
        timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION
      });

      if (!flashcardsList) {
        throw new Error('Flashcards list not found after login');
      }

      console.log('Login process completed successfully');

    } catch (error) {
      console.error('Failed to perform login:', error);
      
      // Take error screenshot
      await this.page.screenshot({ 
        path: 'test-results/login-failed.png',
        fullPage: true 
      });
      
      // Log detailed page state
      console.log('Page URL at error:', this.page.url());
      console.log('Page content at error:', await this.page.content());
      
      // Log storage state safely
      try {
        const storage = await this.page.context().storageState();
        console.log('Storage state:', JSON.stringify(storage, null, 2));
      } catch (e) {
        console.warn('Could not get storage state:', e);
      }
      
      throw error;
    }
  }

  async expectSuccessMessage(message: string) {
    await expect(this.page.getByText(message)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
    });
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.getByText(message)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
    });
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