import type { Page } from '@playwright/test';
import { TEST_CONFIG } from '../test.config';

export abstract class BasePage {
  constructor(protected page: Page) {}

  protected async isPageValid(): Promise<boolean> {
    try {
      return !this.page.isClosed();
    } catch {
      return false;
    }
  }

  protected async ensureAuthentication(): Promise<boolean> {
    try {
      // Wait for user menu to be visible
      await this.page.waitForSelector('[data-testid="user-menu"]', {
        state: 'visible',
        timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
      });

      // Check if we're on the login page
      if (this.page.url().includes('/auth/login')) {
        console.warn('Redirected to login page, authentication failed');
        await this.logPageState('auth-failed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      await this.logPageState('auth-check-failed');
      return false;
    }
  }

  protected async waitForHydration(timeout = TEST_CONFIG.TIMEOUTS.HYDRATION): Promise<boolean> {
    if (!(await this.isPageValid())) {
      console.warn('Cannot wait for hydration: page is closed or invalid');
      return false;
    }

    const start = Date.now();
    try {
      // Wait for hydration attribute
      await this.page.waitForSelector(`[${TEST_CONFIG.ATTRIBUTES.HYDRATED}]`, {
        state: 'attached',
        timeout: timeout / 2
      });

      // Wait for any loading spinners to disappear
      const spinners = this.page.locator('[role="progressbar"]');
      const spinnerCount = await spinners.count();
      
      if (spinnerCount > 0) {
        await spinners.first().waitFor({ state: 'hidden', timeout: timeout / 2 });
      }

      return true;
    } catch (error) {
      console.error(`Hydration timeout after ${Date.now() - start}ms:`, error);
      await this.logPageState('hydration-failed');
      return false;
    }
  }

  protected async safeScreenshot(context: string): Promise<void> {
    if (!(await this.isPageValid())) {
      console.warn('Cannot take screenshot: page is closed or invalid');
      return;
    }

    try {
      await this.page.screenshot({
        path: `test-results/${context}.png`,
        fullPage: true
      });
    } catch (error) {
      console.error(`Failed to take screenshot for ${context}:`, error);
    }
  }

  protected async takeErrorScreenshot(context: string): Promise<void> {
    if (!(await this.isPageValid())) {
      console.warn('Cannot take error screenshot: page is closed or invalid');
      return;
    }

    try {
      // Take a screenshot
      await this.safeScreenshot(`error-${context}`);

      // Log current URL and page content
      console.log('Current URL:', this.page.url());
      console.log('Page content:', await this.page.content());

      // Log console messages
      console.log('Recent console messages:');
      this.page.on('console', msg => {
        console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
      });
    } catch (error) {
      console.error(`Failed to take error screenshot for ${context}:`, error);
    }
  }

  protected async fillInput(selector: string, value: string): Promise<void> {
    try {
      // Wait for input to be visible and enabled
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
      });

      // Clear existing value
      await this.page.fill(selector, '');

      // Type new value
      await this.page.type(selector, value, { delay: 50 });

      // Verify the value was set correctly
      const inputValue = await this.page.inputValue(selector);
      if (inputValue !== value) {
        throw new Error(`Input value mismatch. Expected: ${value}, Got: ${inputValue}`);
      }
    } catch (error) {
      console.error(`Failed to fill input ${selector}:`, error);
      await this.takeErrorScreenshot('input-fill-failed');
      throw error;
    }
  }

  protected async waitForForm(selector: string, timeout = TEST_CONFIG.TIMEOUTS.ELEMENT): Promise<boolean> {
    if (!(await this.isPageValid())) {
      console.warn('Cannot wait for form: page is closed or invalid');
      return false;
    }

    const start = Date.now();
    try {
      // Wait for form to be present in DOM
      await this.page.waitForSelector(selector, { 
        state: 'attached',
        timeout: timeout / 2 
      });

      // Wait for form to be visible
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: timeout / 2 
      });

      // Wait for form to be mounted
      const formLocator = this.page.locator(selector);
      await formLocator.waitFor({ state: 'visible', timeout: timeout / 2 });
      
      const isMounted = await formLocator.evaluate(
        (form, mountedAttr) => form.hasAttribute(mountedAttr),
        TEST_CONFIG.ATTRIBUTES.MOUNTED
      );
      
      if (!isMounted) {
        throw new Error('Form is not mounted');
      }

      // Wait for form to not be busy
      const isBusy = await formLocator.evaluate(
        (form, busyAttr) => form.hasAttribute(busyAttr),
        TEST_CONFIG.ATTRIBUTES.BUSY
      );
      
      if (isBusy) {
        throw new Error('Form is busy');
      }

      return true;
    } catch (error) {
      console.error(`Form wait timeout after ${Date.now() - start}ms:`, error);
      await this.logPageState('form-wait-failed');
      return false;
    }
  }

  protected async safeInteraction(
    action: () => Promise<void>,
    context: string,
    maxAttempts = 3
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await action();
        return true;
      } catch (error) {
        console.error(`Attempt ${attempt}/${maxAttempts} failed for ${context}:`, error);
        if (attempt === maxAttempts) {
          await this.logPageState(`${context}-failed`);
          return false;
        }
        await this.page.waitForTimeout(TEST_CONFIG.TIMEOUTS.ANIMATION);
      }
    }
    return false;
  }

  protected async logPageState(context: string): Promise<void> {
    try {
      // Take a screenshot
      await this.safeScreenshot(context);

      // Log current URL
      console.log('Current URL:', this.page.url());

      // Log HTML content
      const content = await this.page.content();
      console.log('Page HTML:', content.substring(0, 1000) + '...');

      // Log console messages
      console.log('Recent console messages:');
      this.page.on('console', msg => {
        console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
      });
    } catch (error) {
      console.error('Failed to log page state:', error);
    }
  }

  protected async waitForElement(
    selector: string, 
    options = { state: 'visible' as const, timeout: TEST_CONFIG.TIMEOUTS.ELEMENT }
  ): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, options);
      return true;
    } catch (error) {
      console.error(`Failed to find element ${selector}:`, error);
      await this.logPageState('element-wait-failed');
      return false;
    }
  }

  // Dodatkowa metoda z dłuższym timeoutem dla wymagających elementów
  protected async waitForElementExtended(
    selector: string, 
    state: 'attached' | 'detached' | 'visible' | 'hidden' = 'visible'
  ): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state,
        timeout: 10000 // Bezpośrednia wartość zamiast stałej TEST_CONFIG
      });
      return true;
    } catch (error) {
      console.error(`Failed to find element ${selector} with extended timeout:`, error);
      await this.logPageState('element-extended-wait-failed');
      return false;
    }
  }

  protected async goto(path: string): Promise<boolean> {
    try {
      await this.page.goto(path, {
        waitUntil: 'networkidle',
        timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION
      });
      return await this.waitForHydration();
    } catch (error) {
      console.error('Navigation failed:', error);
      await this.logPageState('navigation-failed');
      return false;
    }
  }

  protected async waitForNavigation(url: string) {
    if (!(await this.isPageValid())) {
      console.warn('Cannot wait for navigation: page is closed or invalid');
      return false;
    }

    const start = Date.now();
    try {
      // First wait for navigation with timeout
      await this.page.waitForURL(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: TEST_CONFIG.TIMEOUTS.RETRY
      });

      // Then wait for network to be idle with same timeout
      await this.page.waitForLoadState('networkidle', { 
        timeout: TEST_CONFIG.TIMEOUTS.RETRY
      });

      // Finally wait for hydration with same timeout
      await this.waitForHydration(TEST_CONFIG.TIMEOUTS.RETRY);

      return true;
    } catch (error) {
      console.error(`Navigation to ${url} failed after ${Date.now() - start}ms:`, error);
      await this.logPageState('navigation-failed');
      return false;
    }
  }

  protected async waitForLoadingSpinner(selector: string) {
    await this.waitForElement(selector);
  }

  protected async clickButton(selector: string) {
    if (await this.waitForElement(selector)) {
      const element = this.page.locator(selector);
      
      // Ensure element is in viewport
      await element.scrollIntoViewIfNeeded();
      
      // Click with retry
      await this.retryAction(async () => {
        await element.click();
      }, 'button-click');
    }
  }

  private async retryAction(action: () => Promise<void>, errorPrefix: string, maxAttempts = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await action();
        return;
      } catch (error) {
        lastError = error;
        console.error(`${errorPrefix} attempt ${attempt} failed:`, error);
        
        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(TEST_CONFIG.TIMEOUTS.ANIMATION); // Small exponential backoff
        }
      }
    }

    await this.logPageState(`${errorPrefix}-failed`);
    throw lastError;
  }

  protected async isElementEnabled(selector: string): Promise<boolean> {
    if (await this.waitForElement(selector)) {
      return this.page.locator(selector).isEnabled();
    }
    return false;
  }

  protected async isElementVisible(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    const count = await element.count();
    if (count === 0) return false;
    return element.isVisible();
  }

  async safeClick(selector: string) {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: TEST_CONFIG.TIMEOUTS.RETRY
      });
      await this.page.click(selector);
    } catch (error) {
      console.error(`Failed to click ${selector}:`, error);
      await this.logPageState('click-failed');
      throw error;
    }
  }
} 