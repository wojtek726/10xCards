import type { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {
    // Set test mode header for all requests
    this.page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    });
  }

  async goto(path: string) {
    try {
      // Check if page is already closed
      if (this.page.isClosed()) {
        console.warn('Cannot navigate: page is already closed');
        return;
      }
      
      await this.page.goto(path, {
        waitUntil: 'networkidle',
        timeout: 10000
      });
    } catch (error) {
      if (!this.page.isClosed()) {
        await this.page.screenshot({ 
          path: `test-results/navigation-error-${Date.now()}.png` 
        });
      }
      throw error;
    }
  }

  async waitForUrl(url: string) {
    try {
      await this.page.waitForURL(url, {
        waitUntil: 'networkidle',
        timeout: 10000
      });
    } catch (error) {
      if (!this.page.isClosed()) {
        await this.page.screenshot({ 
          path: `test-results/url-wait-error-${Date.now()}.png` 
        });
      }
      throw error;
    }
  }

  async waitForElement(selector: string) {
    try {
      return await this.page.waitForSelector(selector, {
        timeout: 5000
      });
    } catch (error) {
      if (!this.page.isClosed()) {
        await this.page.screenshot({ 
          path: `test-results/element-wait-error-${Date.now()}.png` 
        });
      }
      throw error;
    }
  }

  async isElementVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: 5000 
      });
      return true;
    } catch {
      return false;
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
      if (!this.page.isClosed()) {
        await this.page.screenshot({ 
          path: `test-results/click-error-${Date.now()}.png` 
        });
      }
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
} 