import type { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string, options = { timeout: 30000, waitUntil: 'load' as 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }) {
    try {
      await this.page.goto(path, options);
    } catch (error) {
      console.error(`Navigation failed to: ${path}`, error);
      try {
        // Take a screenshot on navigation failure for debugging
        if (!this.page.isClosed()) {
          await this.page.screenshot({ path: `test-results/navigation-error-${Date.now()}.png`, fullPage: true });
        }
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
      throw error;
    }
  }

  async waitForUrl(url: string, options = { timeout: 30000 }) {
    try {
      await this.page.waitForURL(url, options);
    } catch (error) {
      console.error(`Failed to wait for URL: ${url}`, error);
      try {
        // Take a screenshot on waiting failure for debugging
        if (!this.page.isClosed()) {
          await this.page.screenshot({ path: `test-results/url-wait-error-${Date.now()}.png`, fullPage: true });
        }
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
      throw error;
    }
  }

  async waitForElement(selector: string, options = { timeout: 30000, state: 'visible' as const }) {
    try {
      return await this.page.waitForSelector(selector, options);
    } catch (error) {
      console.error(`Failed to wait for element: ${selector}`, error);
      try {
        // Take a screenshot when element not found for debugging
        if (!this.page.isClosed()) {
          await this.page.screenshot({ path: `test-results/element-wait-error-${Date.now()}.png`, fullPage: true });
        }
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
      throw error;
    }
  }

  async isElementVisible(selector: string, timeout = 15000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch (error) {
      console.log(`Element not visible: ${selector}`);
      return false;
    }
  }

  async safeClick(selector: string, options = { timeout: 15000 }) {
    try {
      // First wait for the element to be visible
      await this.page.waitForSelector(selector, { state: 'visible', timeout: options.timeout });
      // Then click
      await this.page.click(selector, options);
    } catch (error) {
      console.error(`Failed to click element: ${selector}`, error);
      try {
        if (!this.page.isClosed()) {
          await this.page.screenshot({ path: `test-results/click-error-${Date.now()}.png`, fullPage: true });
        }
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
      throw error;
    }
  }
  
  async ensureAuthentication() {
    try {
      // Check if we already have authentication tokens
      const hasTokens = await this.page.evaluate(() => {
        return !!localStorage.getItem('sb-access-token') || 
               !!document.cookie.includes('sb-access-token');
      });
      
      if (!hasTokens) {
        console.log('No authentication tokens found, adding test tokens');
        await this.page.evaluate(() => {
          localStorage.setItem('sb-access-token', 'test-access-token');
          localStorage.setItem('sb-refresh-token', 'test-refresh-token');
          localStorage.setItem('supabase-auth-token', JSON.stringify({
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token'
          }));
          
          document.cookie = 'sb-access-token=test-access-token; path=/';
          document.cookie = 'sb-refresh-token=test-refresh-token; path=/';
          
          localStorage.setItem('user', JSON.stringify({
            id: 'test-user-id',
            email: 'test@example.com'
          }));
          
          console.log('Test authentication data added');
          return true;
        });
        
        // Reload page to apply authentication
        await this.page.reload();
      }
    } catch (error) {
      console.error('Failed to ensure authentication:', error);
    }
  }
} 