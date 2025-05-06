import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from './test.config';

test.describe('Basic Sanity Tests', () => {
  test('health endpoint returns 200', async ({ request }) => {
    // This test verifies that the application is running
    // and the health endpoint responds correctly
    
    // Test with test mode parameter
    const responseWithTestMode = await request.get('/api/health?test=true', {
      headers: {
        'x-test-mode': 'true'
      }
    });
    expect(responseWithTestMode.status()).toBe(200);
    const bodyWithTestMode = await responseWithTestMode.json();
    expect(bodyWithTestMode.status).toBe('ok');
    
    // Test static health endpoint
    const responseStatic = await request.get('/test/health.json');
    expect(responseStatic.status()).toBe(200);
    const bodyStatic = await responseStatic.json();
    expect(bodyStatic.status).toBe('ok');
  });
  
  test('application renders home page', async ({ page }) => {
    // This test verifies that the application can render the home page
    await page.goto('/', { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    
    // Verify that the page loaded by checking for a common element
    await expect(page).toHaveTitle(/10x Cards/);
    
    // Take a screenshot for debugging in CI
    await page.screenshot({ path: 'home-page.png' });
  });
}); 