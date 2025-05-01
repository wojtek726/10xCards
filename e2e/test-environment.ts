import { test as base, expect } from '@playwright/test';

// Test environment configuration
export const test = base.extend({
  // Configure page for each test
  page: async ({ page, context }, use) => {
    // Set timeouts
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(10000);
    context.setDefaultTimeout(10000);
    
    // Mock API endpoints that should always be mocked
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: null,
          accessToken: null,
          error: null
        })
      });
    });

    // Add error handling
    page.on('pageerror', error => {
      console.error('Page error:', error);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    // Add retry mechanism for navigation
    const originalGoto = page.goto.bind(page);
    page.goto = async (url: string, options = {}) => {
      const maxAttempts = 3;
      let lastError;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await originalGoto(url, {
            waitUntil: 'networkidle',
            timeout: 10000,
            ...options
          });
          return response;
        } catch (error) {
          console.error(`Navigation attempt ${attempt} failed:`, error);
          lastError = error;
          if (attempt < maxAttempts) {
            await page.waitForTimeout(500 * attempt); // Shorter backoff
          }
        }
      }
      throw lastError;
    };

    // Use the configured page
    await use(page);
  },

  // Configure context for each test
  context: async ({ context }, use) => {
    // Set timeout for context operations
    context.setDefaultTimeout(10000);
    await use(context);
  }
}); 