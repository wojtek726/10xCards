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
} 