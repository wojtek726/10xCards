import { test as base, expect } from '@playwright/test';

// Create a custom test fixture that extends Playwright's base test
const test = base.extend({
  page: async ({ page }, use) => {
    // Set longer navigation timeouts for the page
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);
    await use(page);
  }
});

// Export both test and expect
export { test, expect };
export default test; 