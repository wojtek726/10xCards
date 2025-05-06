import { test, expect } from '@playwright/test';

// Super podstawowe testy tylko do CI
test.describe('CI Basic Tests', () => {
  test('static file access works', async ({ request }) => {
    // Sprawdź, czy możemy uzyskać dostęp do statycznego pliku
    const response = await request.get('/test/health.json');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });
  
  test('static assets can load', async ({ page }) => {
    // Bardzo prosty test strony głównej bez skomplikowanych operacji
    await page.goto('/');
    const title = await page.title();
    console.log('Page title:', title);
    
    // Zrób screenshot dla debugowania w CI
    await page.screenshot({ path: 'ci-home-page.png' });
  });
}); 