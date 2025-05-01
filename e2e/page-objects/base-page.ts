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

  protected async waitForHydration(timeout = TEST_CONFIG.TIMEOUTS.HYDRATION): Promise<boolean> {
    if (!(await this.isPageValid())) {
      console.warn('Cannot check hydration: page is closed or invalid');
      return false;
    }

    const start = Date.now();
    try {
      // Wait for initial page load
      await this.page.waitForLoadState('domcontentloaded', { 
        timeout: timeout / 2 
      });
      
      // Wait for network to be idle
      await this.page.waitForLoadState('networkidle', { 
        timeout: timeout / 2 
      });

      // Wait for hydration attribute
      await this.page.waitForFunction(
        (hydrationAttr: string) => document.documentElement.hasAttribute(hydrationAttr),
        TEST_CONFIG.ATTRIBUTES.HYDRATED,
        { timeout: timeout / 2 }
      );

      // Wait for any forms to be mounted
      const forms = await this.page.locator('form').count();
      if (forms > 0) {
        await this.page.waitForFunction(
          (mountedAttr: string) => {
            const forms = document.querySelectorAll('form');
            return Array.from(forms).some(form => form.hasAttribute(mountedAttr));
          },
          TEST_CONFIG.ATTRIBUTES.MOUNTED,
          { timeout: timeout / 2 }
        );
      }

      return true;
    } catch (error) {
      console.error(`Hydration timeout after ${Date.now() - start}ms:`, error);
      await this.safeScreenshot('hydration-timeout');
      return false;
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

  protected async safeScreenshot(name: string): Promise<void> {
    try {
      await this.page.screenshot({ 
        path: `test-results/${name}-${Date.now()}.png`,
        fullPage: true 
      });
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
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
        timeout: 5000 
      });

      // Then wait for network to be idle with same timeout
      await this.page.waitForLoadState('networkidle', { 
        timeout: 5000 
      });

      // Finally wait for hydration with same timeout
      await this.waitForHydration(5000);

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

  protected async fillInput(selector: string, value: string) {
    if (await this.waitForElement(selector)) {
      const element = this.page.locator(selector);
      await element.fill(value);
      
      // Verify the value was actually set
      const actualValue = await element.inputValue();
      if (actualValue !== value) {
        console.error(`Failed to set input value. Expected: ${value}, Got: ${actualValue}`);
        await this.logPageState('input-fill-failed');
      }
    }
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
          await this.page.waitForTimeout(100 * attempt); // Small exponential backoff
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

  async waitForUrl(url: string) {
    try {
      await this.page.waitForURL(url, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      // Wait for hydration after URL change
      await this.waitForHydration(5000);
    } catch (error) {
      if (!this.page.isClosed()) {
        await this.page.screenshot({ 
          path: `test-results/url-wait-error-${Date.now()}.png` 
        });
      }
      throw error;
    }
  }

  async safeClick(selector: string) {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: 5000 
      });
      await this.page.click(selector);
    } catch (error) {
      console.error(`Failed to click ${selector}:`, error);
      await this.logPageState('click-failed');
      throw error;
    }
  }
  
  async ensureAuthentication() {
    try {
      const hasTokens = await this.page.evaluate(() => {
        return !!localStorage.getItem('supabase.auth.token');
      });
      
      if (!hasTokens) {
        await this.page.evaluate(() => {
          const testSession = {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_at: Date.now() + 3600000
          };

          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: testSession,
            expiresAt: testSession.expires_at
          }));
        });
        
        await this.page.reload({ waitUntil: 'networkidle' });
      }
    } catch (error) {
      console.error('Failed to ensure authentication:', error);
      throw error;
    }
  }

  protected async takeErrorScreenshot(name: string) {
    try {
      const timestamp = Date.now();
      await this.page.screenshot({ 
        path: `test-results/${name}-${timestamp}.png`,
        fullPage: true 
      });
    } catch (error) {
      console.error('Failed to take error screenshot:', error);
    }
  }
} 